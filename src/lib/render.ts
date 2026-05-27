export const nbsp = (value: string) => String(value).replace(/ /g, "\u00a0");

export function assetPath(path = "") {
  if (/^(https?:|mailto:|\/|#)/i.test(path)) return path;
  return `/${path}`;
}

export function linkIcon(link: { label?: string; href?: string }) {
  const label = String(link.label || "").toLowerCase();
  const href = String(link.href || "").toLowerCase();
  if (label.includes("github") || href.includes("github.com")) return "/icons/github-icon.png";
  if (label.includes("linkedin") || href.includes("linkedin.com")) return "/icons/linkedin-icon.webp";
  if (href.startsWith("mailto:")) return "/icons/mail-lucide.svg";
  return "";
}

export function formatProjectDate(datetime: string, fallback: string, month: "short" | "long" = "short") {
  const [year, rawMonth] = String(datetime || "").split("-");
  const date = year && rawMonth ? new Date(Number(year), Number(rawMonth) - 1, 1) : null;
  if (!date || Number.isNaN(date.getTime())) return fallback;
  const formatted = date.toLocaleDateString("en-US", { month, year: "numeric" });
  return month === "short" ? formatted.toUpperCase() : formatted;
}

export function renderInlineBlock(block: any) {
  return typeof block === "string" ? escapeHtml(block) : block?.html || "";
}

export function renderCode(code: string, language: string) {
  const escaped = escapeHtml(code);
  if (language === "py") {
    return escaped.replace(
      /(#.*$)|(&quot;.*?&quot;|&#39;.*?&#39;)|\b(from|import|def|for|in|with|as|return|if|else|None|True|False)\b|\b([A-Za-z_][A-Za-z0-9_]*)(?=\()/gm,
      (match, comment, string, keyword, fn) => {
        if (comment) return `<span class="tok-comment">${comment}</span>`;
        if (string) return `<span class="tok-string">${string}</span>`;
        if (keyword) return `<span class="tok-keyword">${keyword}</span>`;
        if (fn) return `<span class="tok-fn">${fn}</span>`;
        return match;
      },
    );
  }
  if (language === "ts" || language === "js") {
    return escaped.replace(
      /(\/\/.*$)|(&quot;.*?&quot;|&#39;.*?&#39;|`.*?`)|\b(import|from|const|let|var|async|await|function|for|of|try|finally|return|if|else)\b|\b([A-Za-z_$][A-Za-z0-9_$]*)(?=\()/gm,
      (match, comment, string, keyword, fn) => {
        if (comment) return `<span class="tok-comment">${comment}</span>`;
        if (string) return `<span class="tok-string">${string}</span>`;
        if (keyword) return `<span class="tok-keyword">${keyword}</span>`;
        if (fn) return `<span class="tok-fn">${fn}</span>`;
        return match;
      },
    );
  }
  return escaped;
}

export function renderProseBlocks(blocks: any[] = []) {
  return blocks.map((block) => {
    if (typeof block === "string") {
      return `<p class="prose-p">${escapeHtml(block)}</p>`;
    }
    if (block.html) {
      return `<p class="prose-p">${block.html}</p>`;
    }
    const tag = block.list === "ol" ? "ol" : "ul";
    const sectioned = block.items.some((item: any) => typeof item !== "string" && item.lead);
    const items = block.items.map((item: any) => {
      if (typeof item === "string") {
        return `<li>${escapeHtml(item)}</li>`;
      }
      const heading = item.lead
        ? `<h3 class="prose-subhead">${escapeHtml(item.lead.replace(/\.$/, ""))}</h3>`
        : "";
      const body = item.text || "";
      const pull = item.pullQuote
        ? `<blockquote class="pull-quote">${escapeHtml(item.pullQuote)}</blockquote>`
        : "";
      return `<li class="prose-section-item">${heading}${body ? `<p class="prose-subcopy">${escapeHtml(body)}</p>` : ""}${pull}</li>`;
    }).join("");
    const sectionClass = sectioned ? " prose-list--sectioned" : "";
    return `<${tag} class="prose-list prose-list--${tag}${sectionClass}">${items}</${tag}>`;
  }).join("");
}

export function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char] || char);
}
