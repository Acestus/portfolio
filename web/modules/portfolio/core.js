import * as squint_core from "../../runtime/core.js";
var by_id = function (id) {
  return document.getElementById(id);
};
var create_el = /* @__PURE__ */ (() => {
  const impl5_1 = function (tag, attrs, children) {
    const el_2 = document.createElement(tag);
    for (let G__3 of squint_core.iterable(attrs)) {
      const vec___4_7 = G__3;
      const k_8 = squint_core.nth(vec___4_7, 0, null);
      const v_9 = squint_core.nth(vec___4_7, 1, null);
      if (k_8 === "class") {
        el_2.className = v_9;
      } else {
        el_2.setAttribute(squint_core.name(k_8), v_9);
      }
    }
    for (let G__10 of squint_core.iterable(children)) {
      const child_11 = G__10;
      if (squint_core.string_QMARK_(child_11)) {
        el_2.appendChild(document.createTextNode(child_11));
      } else {
        if (!(child_11 == null)) {
          el_2.appendChild(child_11);
        } else {
        }
      }
    }
    return el_2;
  };
  const f1 = function (arg2, arg3, ...rest4) {
    const self__23064__auto___12 = this;
    return impl5_1.call(
      self__23064__auto___12,
      arg2,
      arg3,
      rest4.length === 0 ? null : rest4,
    );
  };
  f1["squint$lang$variadic"] = impl5_1;
  return f1;
})();
var mount_BANG_ = function (el) {
  const root_1 = by_id("app");
  root_1.innerHTML = "";
  return root_1.appendChild(el);
};
var now = function () {
  return Date.now();
};
var toast_BANG_ = function (text) {
  const el_1 = create_el("div", { class: "click-toast" }, text);
  document.body.appendChild(el_1);
  return setTimeout(function () {
    if (squint_core.truth_(el_1.parentNode)) {
      return el_1.parentNode.removeChild(el_1);
    }
  }, 2500);
};

export { by_id, create_el, mount_BANG_, now, toast_BANG_ };
