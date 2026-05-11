var shadow$provide = {};
(function(){
'use strict';/*

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/
var a={};
function b(){document.getElementById("spa-root").innerHTML='\x3ch2\x3eM365 Administration (demo)\x3c/h2\x3e\x3cdiv id\x3d"m365-ui"\x3eLoading mock data...\x3c/div\x3e';fetch("/static/mock/m365.json").then(function(c){return c.json()}).then(function(c){var g=document.getElementById("m365-ui");c=JSON.stringify(c,a.g,2);return g.innerHTML='\x3cpre style\x3d"white-space:pre-wrap;color:#bfefff"\x3e'+(c==null?"":c.toString())+"\x3c/pre\x3e"});return console.log("portfolio.enterprise.m365 initialized")}
var d=["portfolio","enterprise","m365","init"],e=this||self;d[0]in e||typeof e.execScript=="undefined"||e.execScript("var "+d[0]);for(var f;d.length&&(f=d.shift());)d.length||b===void 0?e=e[f]&&e[f]!==Object.prototype[f]?e[f]:e[f]={}:e[f]=b;b();
}).call(this);