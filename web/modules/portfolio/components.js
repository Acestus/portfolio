import * as squint_core from "../../runtime/core.js";
import * as core from "./core.js";
import * as portfolio_DOT_core from "./core.js";
var source_base = "https://github.com/Acestus/portfolio";
var footer = function () {
  return core.create_el(
    "footer",
    { class: "site-footer" },
    core.create_el("p", {}, "acestus.com — William Weeks-Balconi"),
  );
};
var action_links = function (article_path, source_path) {
  const bar_1 = core.create_el("div", { class: "action-links" });
  bar_1.appendChild(
    core.create_el(
      "a",
      { class: "action-btn", href: article_path },
      "📄 Read Article",
    ),
  );
  bar_1.appendChild(
    core.create_el(
      "a",
      {
        class: "action-btn",
        href: `${source_base ?? ""}${"/tree/main/"}${source_path ?? ""}`,
        target: "_blank",
        rel: "noopener noreferrer",
      },
      "⌨ Source Code",
    ),
  );
  return bar_1;
};
var page_shell = function (_active_key, article_path, source_path, content_el) {
  const shell_1 = core.create_el("div", { class: "page-shell" });
  const main_2 = core.create_el("main", { class: "main-content" });
  main_2.appendChild(content_el);
  main_2.appendChild(action_links(article_path, source_path));
  shell_1.appendChild(main_2);
  shell_1.appendChild(footer());
  return shell_1;
};

export { footer, action_links, page_shell };
