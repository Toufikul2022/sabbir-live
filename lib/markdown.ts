import { Marked } from "marked";

// Shared by blog pages and the /manage editor's preview, so both look the same.

const escape = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

// Raw HTML typed into a post is shown as text, never run.
const marked = new Marked({ gfm: true, breaks: true, renderer: { html: (t) => escape(t.text) } });

export function renderMarkdown(markdown: string) {
  const html = marked.parse(markdown, { async: false });
  return html
    .replace(/(href|src)="\s*(?:javascript|vbscript|data):[^"]*"/gi, '$1="#"')
    .replace(/<a href="(https?:\/\/[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"')
    .replace(/<img /g, '<img loading="lazy" decoding="async" ');
}
