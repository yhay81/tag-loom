(() => {
  "use strict";

  const form = document.querySelector("#search-form");
  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  const elements = {
    all: document.querySelector("#all-terms"),
    any: document.querySelector("#any-terms"),
    exact: document.querySelector("#exact-terms"),
    exclude: document.querySelector("#exclude-terms"),
    query: document.querySelector("#query-preview"),
    chips: document.querySelector("#condition-preview"),
    conditionCount: document.querySelector("#condition-count"),
    savedCount: document.querySelector("#saved-count"),
    savedList: document.querySelector("#saved-list"),
    searchButton: document.querySelector("#search-button"),
    saveButton: document.querySelector("#save-button"),
    resetButton: document.querySelector("#reset-button"),
    copyButton: document.querySelector("#copy-query-button"),
    shareButton: document.querySelector("#share-button"),
    exportButton: document.querySelector("#export-button"),
    status: document.querySelector("#action-status"),
  };

  const storageKey = "tag-loom:saved-searches:v1";
  const currentKey = "tag-loom:current-search:v1";
  const sessionKey = "tag-loom:session:v1";
  const visitKey = "tag-loom:last-visit:v1";
  const today = new Date().toISOString().slice(0, 10);
  const modes = new Set(["all", "posts", "reels", "tags"]);
  const modeSites = {
    all: "site:instagram.com",
    posts: "site:instagram.com/p/",
    reels: "site:instagram.com/reel/",
    tags: "site:instagram.com/explore/tags/",
  };
  const emptyState = {
    all: "",
    any: "",
    exact: "",
    exclude: "",
    mode: "all",
  };

  const safeParse = (value, fallback) => {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  };

  const normalizeState = (value) => {
    const source = value && typeof value === "object" ? value : {};
    const stringValue = (key) => (typeof source[key] === "string" ? source[key].slice(0, 240) : "");
    return {
      all: stringValue("all"),
      any: stringValue("any"),
      exact: stringValue("exact"),
      exclude: stringValue("exclude"),
      mode: modes.has(source.mode) ? source.mode : "all",
    };
  };

  const makeSessionId = () => {
    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replaceAll(/[xy]/g, (character) => {
      const random = Math.floor(Math.random() * 16);
      const value = character === "x" ? random : (random & 0x3) | 0x8;
      return value.toString(16);
    });
  };

  let sessionId = localStorage.getItem(sessionKey);
  if (!sessionId) {
    sessionId = makeSessionId();
    localStorage.setItem(sessionKey, sessionId);
  }

  let hasConfigured = false;
  const storedSavedSearches = safeParse(localStorage.getItem(storageKey), []);
  let savedSearches = [];

  const selectedMode = () => {
    const selected = document.querySelector('input[name="mode"]:checked');
    return selected instanceof HTMLInputElement && modes.has(selected.value)
      ? selected.value
      : "all";
  };

  const track = (name) => {
    void fetch("/api/events", {
      body: JSON.stringify({
        mode: selectedMode(),
        name,
        sessionId,
      }),
      headers: { "content-type": "application/json" },
      keepalive: true,
      method: "POST",
    }).catch(() => undefined);
  };

  const setStatus = (message, kind = "") => {
    if (!(elements.status instanceof HTMLElement)) {
      return;
    }
    elements.status.textContent = message;
    elements.status.dataset.kind = kind;
  };

  const valueOf = (element) =>
    element instanceof HTMLTextAreaElement ? element.value.slice(0, 240) : "";

  const getState = () => ({
    all: valueOf(elements.all),
    any: valueOf(elements.any),
    exact: valueOf(elements.exact),
    exclude: valueOf(elements.exclude),
    mode: selectedMode(),
  });

  const setTextarea = (element, value) => {
    if (element instanceof HTMLTextAreaElement) {
      element.value = typeof value === "string" ? value.slice(0, 240) : "";
    }
  };

  const applyState = (state) => {
    setTextarea(elements.all, state.all);
    setTextarea(elements.any, state.any);
    setTextarea(elements.exact, state.exact);
    setTextarea(elements.exclude, state.exclude);
    const mode = modes.has(state.mode) ? state.mode : "all";
    document.querySelectorAll('input[name="mode"]').forEach((input) => {
      if (input instanceof HTMLInputElement) {
        input.checked = input.value === mode;
      }
    });
  };

  const cleanTerm = (term) => term.replaceAll('"', "").trim();
  const splitTerms = (value) => {
    const terms = value
      .split(/[\n,、]+/)
      .map((term) => cleanTerm(term).replaceAll(/\s+/g, " "))
      .filter(Boolean)
      .slice(0, 20);
    return [...new Set(terms)];
  };

  const quote = (term) => `"${cleanTerm(term)}"`;
  const formatTerm = (term, exact = false) => {
    const clean = cleanTerm(term);
    return exact || clean.startsWith("#") || /\s/.test(clean) ? quote(clean) : clean;
  };

  const buildQuery = (state) => {
    const groups = {
      all: splitTerms(state.all),
      any: splitTerms(state.any),
      exact: splitTerms(state.exact),
      exclude: splitTerms(state.exclude),
    };
    const parts = [modeSites[state.mode] ?? modeSites.all];

    parts.push(...groups.all.map((term) => formatTerm(term)));
    if (groups.any.length === 1) {
      parts.push(formatTerm(groups.any[0]));
    } else if (groups.any.length > 1) {
      parts.push(`(${groups.any.map((term) => formatTerm(term)).join(" OR ")})`);
    }
    parts.push(...groups.exact.map((term) => quote(term)));
    parts.push(...groups.exclude.map((term) => `-${formatTerm(term, /\s/.test(term))}`));

    return {
      conditionCount: Object.values(groups).reduce((total, terms) => total + terms.length, 0),
      groups,
      query: parts.join(" "),
    };
  };

  const makeGoogleUrl = (query) =>
    `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=ja`;

  const makeShareUrl = (state) => {
    const url = new URL(window.location.origin);
    for (const key of ["all", "any", "exact", "exclude"]) {
      if (state[key]) {
        url.searchParams.set(key, state[key]);
      }
    }
    if (state.mode !== "all") {
      url.searchParams.set("mode", state.mode);
    }
    return url.toString();
  };

  const stateFromUrl = () => {
    const parameters = new URLSearchParams(window.location.search);
    const hasSharedState = ["all", "any", "exact", "exclude", "mode"].some((key) =>
      parameters.has(key),
    );
    if (!hasSharedState) {
      return null;
    }
    return normalizeState({
      all: parameters.get("all")?.slice(0, 240) ?? "",
      any: parameters.get("any")?.slice(0, 240) ?? "",
      exact: parameters.get("exact")?.slice(0, 240) ?? "",
      exclude: parameters.get("exclude")?.slice(0, 240) ?? "",
      mode: modes.has(parameters.get("mode")) ? parameters.get("mode") : "all",
    });
  };

  const addChip = (label, kind) => {
    if (!(elements.chips instanceof HTMLElement)) {
      return;
    }
    const chip = document.createElement("span");
    chip.className = "condition-chip";
    chip.dataset.kind = kind;
    chip.textContent = label;
    elements.chips.append(chip);
  };

  const renderQuery = () => {
    const state = getState();
    const built = buildQuery(state);

    if (elements.query instanceof HTMLOutputElement) {
      elements.query.textContent = built.query;
    }
    if (elements.conditionCount instanceof HTMLElement) {
      elements.conditionCount.textContent = `${built.conditionCount} 条件`;
    }
    if (elements.chips instanceof HTMLElement) {
      elements.chips.replaceChildren();
      built.groups.all.forEach((term) => addChip(`AND  ${term}`, "all"));
      built.groups.any.forEach((term) => addChip(`OR  ${term}`, "any"));
      built.groups.exact.forEach((term) => addChip(`完全一致  ${term}`, "exact"));
      built.groups.exclude.forEach((term) => addChip(`除外  ${term}`, "exclude"));
    }

    const disabled = built.conditionCount === 0;
    for (const button of [elements.searchButton, elements.saveButton, elements.copyButton]) {
      if (button instanceof HTMLButtonElement) {
        button.disabled = disabled;
      }
    }
    localStorage.setItem(currentKey, JSON.stringify(state));
    return built;
  };

  const copyText = async (value) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    if (!copied) {
      throw new Error("copy_failed");
    }
  };

  const stateLabel = (state) => {
    const terms = [...splitTerms(state.all), ...splitTerms(state.any), ...splitTerms(state.exact)];
    return terms.slice(0, 3).join(" × ") || "保存した検索";
  };

  savedSearches = Array.isArray(storedSavedSearches)
    ? storedSavedSearches
        .filter((saved) => saved && typeof saved === "object")
        .slice(0, 12)
        .map((saved) => {
          const state = normalizeState(saved.state);
          return {
            id: typeof saved.id === "string" ? saved.id.slice(0, 64) : makeSessionId(),
            label: stateLabel(state),
            state,
            updatedAt: Number.isFinite(saved.updatedAt) ? saved.updatedAt : Date.now(),
          };
        })
        .filter((saved) => buildQuery(saved.state).conditionCount > 0)
    : [];

  const persistSavedSearches = () => {
    localStorage.setItem(storageKey, JSON.stringify(savedSearches));
  };

  const renderSaved = () => {
    if (!(elements.savedList instanceof HTMLElement)) {
      return;
    }
    elements.savedList.replaceChildren();
    if (savedSearches.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "よく使う条件を保存すると、ここからすぐ再検索できます。";
      elements.savedList.append(empty);
    } else {
      savedSearches.forEach((saved) => {
        const item = document.createElement("article");
        item.className = "saved-item";

        const loadButton = document.createElement("button");
        loadButton.className = "saved-load";
        loadButton.type = "button";
        const title = document.createElement("strong");
        title.textContent = saved.label;
        const detail = document.createElement("small");
        detail.textContent = buildQuery(saved.state).query;
        loadButton.append(title, detail);
        loadButton.addEventListener("click", () => {
          applyState(saved.state);
          renderQuery();
          setStatus("保存した条件を読み込みました。", "success");
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "saved-delete";
        deleteButton.type = "button";
        deleteButton.setAttribute("aria-label", `${saved.label}を削除`);
        deleteButton.textContent = "×";
        deleteButton.addEventListener("click", () => {
          savedSearches = savedSearches.filter((entry) => entry.id !== saved.id);
          persistSavedSearches();
          renderSaved();
          setStatus("保存した条件を削除しました。");
        });

        item.append(loadButton, deleteButton);
        elements.savedList.append(item);
      });
    }
    if (elements.savedCount instanceof HTMLElement) {
      elements.savedCount.textContent = `${savedSearches.length} / 12`;
    }
    if (elements.exportButton instanceof HTMLButtonElement) {
      elements.exportButton.disabled = savedSearches.length === 0;
    }
  };

  form.addEventListener("input", () => {
    renderQuery();
    if (!hasConfigured) {
      hasConfigured = true;
      track("configured");
    }
  });
  form.addEventListener("change", () => {
    renderQuery();
    if (!hasConfigured) {
      hasConfigured = true;
      track("configured");
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const built = renderQuery();
    if (built.conditionCount === 0) {
      setStatus("検索条件を1つ以上入力してください。", "error");
      return;
    }
    track("searched");
    window.open(makeGoogleUrl(built.query), "_blank", "noopener,noreferrer");
    setStatus("Google検索を新しいタブで開きました。", "success");
  });

  document.querySelectorAll("[data-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!(button instanceof HTMLButtonElement)) {
        return;
      }
      applyState({
        all: button.dataset.templateAll ?? "",
        any: button.dataset.templateAny ?? "",
        exact: button.dataset.templateExact ?? "",
        exclude: button.dataset.templateExclude ?? "",
        mode: button.dataset.templateMode ?? "all",
      });
      renderQuery();
      hasConfigured = true;
      track("configured");
      setStatus("ひな形を読み込みました。条件は自由に変更できます。");
    });
  });

  if (elements.saveButton instanceof HTMLButtonElement) {
    elements.saveButton.addEventListener("click", () => {
      const state = getState();
      const built = buildQuery(state);
      if (built.conditionCount === 0) {
        setStatus("保存する条件を入力してください。", "error");
        return;
      }
      const signature = JSON.stringify(state);
      const existing = savedSearches.find((saved) => JSON.stringify(saved.state) === signature);
      if (existing) {
        existing.updatedAt = Date.now();
        savedSearches = [existing, ...savedSearches.filter((saved) => saved.id !== existing.id)];
        setStatus("同じ条件の保存日時を更新しました。", "success");
      } else {
        savedSearches.unshift({
          id: makeSessionId(),
          label: stateLabel(state),
          state,
          updatedAt: Date.now(),
        });
        savedSearches = savedSearches.slice(0, 12);
        setStatus("この端末へ検索条件を保存しました。", "success");
      }
      persistSavedSearches();
      renderSaved();
      track("saved");
    });
  }

  if (elements.resetButton instanceof HTMLButtonElement) {
    elements.resetButton.addEventListener("click", () => {
      applyState(emptyState);
      renderQuery();
      setStatus("入力をクリアしました。");
    });
  }

  if (elements.copyButton instanceof HTMLButtonElement) {
    elements.copyButton.addEventListener("click", async () => {
      const built = buildQuery(getState());
      if (built.conditionCount === 0) {
        setStatus("コピーする条件を入力してください。", "error");
        return;
      }
      try {
        await copyText(built.query);
        setStatus("検索式をコピーしました。", "success");
      } catch {
        setStatus("検索式をコピーできませんでした。", "error");
      }
    });
  }

  if (elements.shareButton instanceof HTMLButtonElement) {
    elements.shareButton.addEventListener("click", async () => {
      const state = getState();
      const built = buildQuery(state);
      if (built.conditionCount === 0) {
        setStatus("共有する条件を入力してください。", "error");
        return;
      }
      const url = makeShareUrl(state);
      try {
        if (typeof navigator.share === "function") {
          await navigator.share({
            text: "この検索条件をTag Loomで開く",
            title: stateLabel(state),
            url,
          });
        } else {
          await copyText(url);
        }
        track("shared");
        setStatus(
          typeof navigator.share === "function"
            ? "検索条件を共有しました。"
            : "共有URLをコピーしました。",
          "success",
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          setStatus("共有をキャンセルしました。");
        } else {
          setStatus("検索条件を共有できませんでした。", "error");
        }
      }
    });
  }

  if (elements.exportButton instanceof HTMLButtonElement) {
    elements.exportButton.addEventListener("click", () => {
      if (savedSearches.length === 0) {
        setStatus("CSVへ出力する保存検索がありません。", "error");
        return;
      }
      const escapeCsv = (value) => {
        const text = String(value);
        const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
        return `"${safe.replaceAll('"', '""')}"`;
      };
      const rows = [
        ["name", "mode", "all_terms", "any_terms", "exact_terms", "exclude_terms", "google_url"],
        ...savedSearches.map((saved) => {
          const query = buildQuery(saved.state).query;
          return [
            saved.label,
            saved.state.mode,
            saved.state.all,
            saved.state.any,
            saved.state.exact,
            saved.state.exclude,
            makeGoogleUrl(query),
          ];
        }),
      ];
      const csv = `\uFEFF${rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n")}`;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `tag-loom-searches-${today}.csv`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      track("exported");
      setStatus("保存した検索をCSVへ書き出しました。", "success");
    });
  }

  const sharedState = stateFromUrl();
  const storedCurrent = normalizeState(safeParse(localStorage.getItem(currentKey), emptyState));
  applyState(sharedState ?? storedCurrent);
  renderQuery();
  renderSaved();

  const lastVisit = localStorage.getItem(visitKey);
  track("visited");
  if (lastVisit && lastVisit !== today) {
    track("returned");
  }
  localStorage.setItem(visitKey, today);

  if (sharedState) {
    setStatus("共有された検索条件を読み込みました。", "success");
  }
})();
