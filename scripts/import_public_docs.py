"""One-time public HTML-to-Markdown import. Never overwrites an authored guide."""
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
import hashlib,json,re
from urllib.parse import urlsplit

ROOT=Path(__file__).resolve().parents[1]
@dataclass
class Node:
    tag:str
    attrs:dict=field(default_factory=dict)
    children:list=field(default_factory=list)
    def text(self):return ''.join(x if isinstance(x,str) else x.text() for x in self.children)
    def walk(self):
        yield self
        for x in self.children:
            if isinstance(x,Node):yield from x.walk()

class Tree(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True);self.root=Node('document');self.stack=[self.root]
    def handle_starttag(self,tag,attrs):
        node=Node(tag,dict(attrs));self.stack[-1].children.append(node)
        if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:self.stack.append(node)
    def handle_startendtag(self,tag,attrs):
        self.handle_starttag(tag,attrs)
        if self.stack[-1].tag==tag:self.stack.pop()
    def handle_endtag(self,tag):
        for i in range(len(self.stack)-1,0,-1):
            if self.stack[i].tag==tag:self.stack=self.stack[:i];break
    def handle_data(self,data):self.stack[-1].children.append(data)

def tidy(text):return re.sub(r'\s+',' ',text).strip()
def code(text,block=False):
    longest=max((len(x) for x in re.findall(r'`+',text)),default=0)
    fence='`'*max(3 if block else 1,longest+1)
    return f'\n\n{fence}text\n{text.strip(chr(10)).rstrip()}\n{fence}\n\n' if block else fence+text+fence

def article_tree(tree):
    started=False
    def trim(node):
        nonlocal started
        if isinstance(node,str):return node if started else ''
        classes=node.attrs.get('class','').split()
        if node.tag in {'head','header','nav','script','style','footer'} or 'footer-link' in classes or 'back-link' in classes:return None
        if node.tag=='h1':started=True;return None
        children=[]
        for child in node.children:
            value=trim(child)
            if value is not None and value!='':children.append(value)
        return Node(node.tag,node.attrs,children) if children else None
    return trim(next(x for x in tree.root.walk() if x.tag=='body'))

def markdown(node,mapping):
    if isinstance(node,str):return re.sub(r'\s+',' ',node).replace('\\','\\\\').replace('*','\\*').replace('_','\\_').replace('[','\\[').replace(']','\\]')
    tag=node.tag;classes=node.attrs.get('class','').split()
    if tag in {'script','style','nav','header','footer'}:return ''
    if tag=='pre' or 'code-block' in classes:return code(node.text(),True)
    if tag=='code':return code(node.text())
    inner=''.join(markdown(x,mapping) for x in node.children).strip()
    if tag in {'h2','h3','h4','h5','h6'}:return '\n\n'+'#'*int(tag[1])+' '+inner+'\n\n'
    if tag=='a':
        href=node.attrs.get('href','');parts=urlsplit(href)
        if parts.scheme not in {'','http','https','mailto'}:return inner
        href=mapping.get(href,href).replace(' ','%20').replace('(','%28').replace(')','%29')
        return '['+inner+']('+href+')' if href else inner
    if tag in {'b','strong'}:return '**'+inner+'**'
    if tag in {'i','em'}:return '*'+inner+'*'
    if tag=='br':return '  \n'
    if tag=='hr':return '\n\n---\n\n'
    if tag=='table':
        rows=[]
        for row in (x for x in node.walk() if x.tag=='tr'):
            cells=[tidy(''.join(markdown(y,mapping) for y in x.children)).replace('|','\\|') for x in row.children if isinstance(x,Node) and x.tag in {'td','th'}]
            if cells:rows.append(cells)
        if not rows:return ''
        width=max(map(len,rows));rows=[x+['']*(width-len(x)) for x in rows]
        lines=['| '+' | '.join(x)+' |' for x in rows];lines.insert(1,'| '+' | '.join(['---']*width)+' |')
        return '\n\n'+'\n'.join(lines)+'\n\n'
    if tag in {'ul','ol'}:
        lines=[]
        for index,item in enumerate(x for x in node.children if isinstance(x,Node) and x.tag=='li'):
            content=''.join(markdown(x,mapping) for x in item.children).strip().splitlines();prefix=f'{index+1}. ' if tag=='ol' else '- '
            if content:lines.append(prefix+content[0]+'\n'+'\n'.join(' '*len(prefix)+line if line else '' for line in content[1:]))
        return '\n\n'+'\n'.join(lines)+'\n\n'
    if 'metric-card' in classes:
        value=next((tidy(x.text()) for x in node.walk() if 'metric-value' in x.attrs.get('class','').split()),'')
        label=next((tidy(x.text()) for x in node.walk() if 'metric-label' in x.attrs.get('class','').split()),'')
        return '\n- '+code(value)+' — '+label+'\n'
    if tag=='blockquote' or 'callout' in classes or 'summary' in classes:
        return '\n\n'+'\n'.join('> '+line for line in inner.splitlines())+'\n\n'
    if tag in {'p','div','main','article','section'}:return '\n\n'+inner+'\n\n'
    return inner

ARCHITECTURE={'architecture-studio','agentic-web','caf-matcher','iac-pipeline','platform-console','workflow-toolkit','copilot-ops-console'}
OPERATIONS={'policy-dashboard','fabric-capacity-tuner','fabric-pipeline','ad-gpo-fundamentals','m365-admin','pricing-optimizer','log-pipeline'}

def main():
    entries=json.loads((ROOT/'data/articles.json').read_text());mapping={x['url']:'/docs/'+Path(x['url']).stem+'/' for x in entries}
    docs=ROOT/'site/content/docs';docs.mkdir(parents=True,exist_ok=True);manifest=[]
    projects={x['url'] for x in json.loads((ROOT/'data/projects.json').read_text())}
    for item in entries:
        source=ROOT/'resources/public'/item['url'].lstrip('/');slug=source.stem;target=docs/(slug+'.md')
        if target.exists():raise SystemExit(f'Refusing to overwrite an authored guide: {target}')
        tree=Tree();tree.feed(source.read_text());content=article_tree(tree);assert content is not None
        summary=next((tidy(x.text()) for x in content.walk() if 'summary' in x.attrs.get('class','').split()),'')
        if not summary:summary=next((tidy(x.text()) for x in content.walk() if x.tag=='p'),item['description'])
        description=summary if len(summary)<=220 else summary[:217].rsplit(' ',1)[0]+'…'
        space='Architecture & delivery' if slug in ARCHITECTURE else ('Cloud & operations' if slug in OPERATIONS else 'Working examples')
        demo=next((x.attrs['href'] for x in tree.root.walk() if x.tag=='a' and x.attrs.get('href') in projects),None)
        body=markdown(content,mapping).strip()+'\n';front={'title':item['title'],'description':description,'space':space,'date':'2026-11-04','draft':False,'legacyArticle':item['url']}
        if demo:front['demo']=demo
        rendered='---\n'+'\n'.join(key+': '+json.dumps(value,ensure_ascii=False) for key,value in front.items())+'\n---\n\n'+body
        target.write_text(rendered)
        # Preserve every substantive paragraph, heading and code example; navigation is deliberately omitted.
        expected=[tidy(x.text()) for x in content.walk() if x.tag in {'p','h2','h3','h4','pre'} or 'code-block' in x.attrs.get('class','').split()]
        manifest.append({'slug':slug,'source':str(source.relative_to(ROOT)),'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'initialMarkdownSha256':hashlib.sha256(rendered.encode()).hexdigest(),'legacyUrl':item['url'],'docsUrl':mapping[item['url']],'space':space,'semanticBlocks':expected})
    (ROOT/'data/docs-import.json').write_text(json.dumps({'sourceCommit':'fd91d34a8cb33cbc34a22555794a838389149f19','purpose':'One-time import provenance; authored Markdown is the documentation source of truth after import.','articles':manifest},ensure_ascii=False,indent=2)+'\n')
    print(f'Imported {len(manifest)} public articles as authored Hugo Markdown; no private Journal content read.')

if __name__=='__main__':main()
