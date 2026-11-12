(() => {
  const toggle = document.querySelector(".docs-menu-toggle");
  const navigation = document.getElementById("docs-navigation");
  toggle?.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    navigation?.classList.toggle("is-open", open);
  });

  const input = document.getElementById("docs-search");
  const results = document.getElementById("docs-search-results");
  if (!input || !results) return;
  input.form?.addEventListener("submit", (event) => event.preventDefault());
  const normalize = (text) =>
    text
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  let documents;
  let request = 0;
  const load = () =>
    (documents ??= fetch(input.dataset.index, { credentials: "omit" })
      .then((response) => {
        if (!response.ok) throw new Error("Documentation index unavailable");
        return response.json();
      })
      .then((entries) => {
        if (!Array.isArray(entries))
          throw new Error("Invalid documentation index");
        return entries.filter((entry) => {
          if (
            typeof entry.title !== "string" ||
            typeof entry.text !== "string" ||
            typeof entry.url !== "string"
          )
            return false;
          const url = new URL(entry.url, location.origin);
          return (
            url.origin === location.origin && url.pathname.startsWith("/docs/")
          );
        });
      })
      .catch((error) => {
        documents = undefined;
        throw error;
      }));
  const message = (text) => {
    const paragraph = document.createElement("p");
    paragraph.className = "docs-search-status";
    paragraph.textContent = text;
    results.replaceChildren(paragraph);
  };
  input.addEventListener("input", async () => {
    const id = ++request;
    const query = normalize(input.value.trim());
    results.hidden = !query;
    results.replaceChildren();
    if (!query) return;
    message("Searching documentation…");
    try {
      const entries = await load();
      if (id !== request) return;
      const terms = query.split(/\s+/);
      const matches = entries
        .map((entry) => {
          const title = normalize(entry.title);
          const text = normalize(
            `${entry.title} ${entry.description ?? ""} ${entry.text}`,
          );
          return {
            entry,
            score: terms.every((term) => text.includes(term))
              ? title.includes(query)
                ? 100
                : terms.filter((term) => title.includes(term)).length * 10 + 1
              : 0,
          };
        })
        .filter((item) => item.score > 0)
        .sort(
          (a, b) =>
            b.score - a.score || a.entry.title.localeCompare(b.entry.title),
        )
        .slice(0, 10);
      message(
        matches.length
          ? `${matches.length} matching guide${matches.length === 1 ? "" : "s"}`
          : "No documents found",
      );
      for (const { entry } of matches) {
        const link = document.createElement("a");
        link.href = entry.url;
        link.className = "docs-search-result";
        const label = document.createElement("strong");
        label.textContent = entry.title;
        const detail = document.createElement("span");
        detail.textContent = `${entry.space ?? "Documentation"} · ${entry.description ?? ""}`;
        link.append(label, detail);
        results.append(link);
      }
    } catch {
      if (id === request)
        message(
          "Search is unavailable. Browse the documentation navigation instead.",
        );
    }
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "/" &&
      !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)
    ) {
      event.preventDefault();
      input.focus();
    }
    if (event.key === "Escape" && document.activeElement === input) {
      input.value = "";
      input.dispatchEvent(new Event("input"));
      input.blur();
    }
  });
})();
