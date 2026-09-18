/*
  Spicy — rendu statique. Construit la page à partir de window.SITE_DATA (inliné)
  ou, à défaut, charge data/content.yml (YAML minimal, sans dépendance).
*/
(function () {
  "use strict";

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  function set(id, text) {
    const node = document.getElementById(id);
    if (node && text != null) node.textContent = text;
    return node;
  }

  // Mini-parseur YAML : clés imbriquées, listes d'objets, paires clé-valeur.
  function parseYAML(text) {
    const lines = text.split(/\r?\n/);
    let pos = 0;

    function unquote(s) {
      if (!s) return "";
      if ((s[0] === '"' && s.endsWith('"')) || (s[0] === "'" && s.endsWith("'")))
        return s.slice(1, -1);
      return s;
    }

    function parseBlock(indent) {
      const obj = {};
      let arr = null;
      while (pos < lines.length) {
        const raw = lines[pos];
        if (!raw.trim() || raw.trim().startsWith("#")) { pos++; continue; }
        const cur = raw.match(/^\s*/)[0].length;
        if (cur < indent) break;
        const line = raw.trim();
        if (line.startsWith("- ")) {
          if (!arr) arr = [];
          const rest = line.slice(2).trim();
          if (rest.includes(":")) {
            const item = {};
            const i = rest.indexOf(":");
            item[rest.slice(0, i).trim()] = unquote(rest.slice(i + 1).trim());
            pos++;
            const sub = parseBlock(cur + 2);
            Object.assign(item, sub.obj);
            arr.push(item);
          } else {
            arr.push(unquote(rest));
            pos++;
          }
          continue;
        }
        const idx = line.indexOf(":");
        if (idx === -1) { pos++; continue; }
        const key = line.slice(0, idx).trim();
        const val = unquote(line.slice(idx + 1).trim());
        if (val === "") {
          pos++;
          const sub = parseBlock(cur + 1);
          obj[key] = sub.arr !== null ? sub.arr : sub.obj;
        } else {
          obj[key] = val;
          pos++;
        }
      }
      return { obj, arr };
    }

    return parseBlock(0).obj;
  }

  function render(data) {
    const site = data.site || {};
    document.title = site.title || "Spicy";
    const desc = document.querySelector('meta[name="description"]');
    if (desc && site.description) desc.setAttribute("content", site.description);

    const hero = data.hero || {};
    set("hero-badge", hero.badge);
    set("hero-title", hero.title);
    set("hero-subtitle", hero.subtitle);
    set("hero-text", hero.text);
    if (hero.cta_primary) {
      const a = document.getElementById("hero-cta-primary");
      if (a) { a.textContent = hero.cta_primary.label; a.href = hero.cta_primary.url; }
    }
    if (hero.cta_secondary) {
      const a = document.getElementById("hero-cta-secondary");
      if (a) { a.textContent = hero.cta_secondary.label; a.href = hero.cta_secondary.url; }
    }

    const about = data.about || {};
    set("about-title", about.title);
    set("about-text", about.text);
    const facts = document.getElementById("about-facts");
    if (facts && Array.isArray(about.facts)) {
      facts.innerHTML = "";
      about.facts.forEach((f) => {
        const li = el("li", "fact");
        li.appendChild(el("span", "fact-spark", "✦"));
        li.appendChild(el("span", "fact-label", f.label + " : "));
        li.appendChild(el("span", "fact-value", f.value));
        facts.appendChild(li);
      });
    }

    const games = data.games || {};
    set("games-title", games.title);
    const gameList = document.getElementById("games-list");
    if (gameList && Array.isArray(games.items)) {
      gameList.innerHTML = "";
      games.items.forEach((g) => {
        const card = el("article", "game-card");
        card.appendChild(el("h3", "game-name", g.name));
        card.appendChild(el("p", "game-desc", g.description));
        gameList.appendChild(card);
      });
    }

    const socials = data.socials || {};
    set("socials-title", socials.title);
    const socialList = document.getElementById("socials-list");
    if (socialList && Array.isArray(socials.items)) {
      socialList.innerHTML = "";
      socials.items.forEach((s) => {
        const a = el("a", "social-link");
        a.href = s.url || "#";
        a.target = "_blank";
        a.rel = "noopener";
        a.appendChild(el("span", "social-icon", s.icon || "→"));
        a.appendChild(el("span", "social-name", s.name));
        socialList.appendChild(a);
      });
    }

    const support = data.support || {};
    set("support-title", support.title);
    set("support-text", support.text);
    const supportList = document.getElementById("support-list");
    if (supportList && Array.isArray(support.items)) {
      supportList.innerHTML = "";
      support.items.forEach((s) => {
        const a = el("a", "btn btn-secondary");
        a.href = s.url || "#";
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = s.name;
        supportList.appendChild(a);
      });
    }

    const footer = data.footer || {};
    set("footer-text", footer.text);
    const contact = document.getElementById("footer-contact");
    if (contact && footer.contact_url) contact.href = footer.contact_url;
  }

  function boot(data) {
    render(data);
    document.body.classList.add("ready");
  }

  if (window.SITE_DATA && Object.keys(window.SITE_DATA).length) {
    boot(window.SITE_DATA);
  } else {
    fetch("data/content.yml")
      .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
      .then((t) => boot(parseYAML(t)))
      .catch(() => document.body.classList.add("ready"));
  }
})();
