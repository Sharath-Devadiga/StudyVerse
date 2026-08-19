"use client";

import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import { getRoomSummary } from "../../../lib/api/room";
import { getApiErrorMessage } from "../../../lib/utils";

function InlineMarkdown({ text }: { text: string }) {
  return <>{text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((token, index) => token.startsWith("**") && token.endsWith("**") ? <strong key={index} className="font-semibold text-slate-900">{token.slice(2, -2)}</strong> : token.startsWith("`") && token.endsWith("`") ? <code key={index} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.82em] text-slate-800">{token.slice(1, -1)}</code> : <Fragment key={index}>{token}</Fragment>)}</>;
}

function MarkdownNotes({ markdown }: { markdown: string }) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n"); const blocks: ReactNode[] = []; let index = 0;
  while (index < lines.length) { const line = lines[index]!; if (!line.trim()) { index++; continue; }
    if (line.startsWith("```")) { const code: string[] = []; index++; while (index < lines.length && !lines[index]!.startsWith("```")) code.push(lines[index++]!); if (index < lines.length) index++; blocks.push(<pre key={blocks.length} className="my-4 overflow-x-auto rounded-lg bg-slate-900 p-4 text-left text-xs leading-relaxed text-slate-100"><code>{code.join("\n")}</code></pre>); continue; }
    const heading = line.match(/^(#{1,3})\s+(.+)$/); if (heading) { const Tag = heading[1]!.length === 1 ? "h2" : heading[1]!.length === 2 ? "h3" : "h4"; blocks.push(<Tag key={blocks.length} className={Tag === "h2" ? "mt-6 text-lg font-semibold text-slate-900" : "mt-5 text-sm font-semibold text-slate-900"}><InlineMarkdown text={heading[2]!} /></Tag>); index++; continue; }
    const ordered = /^\d+\.\s+/.test(line), bullet = /^[-*+]\s+/.test(line); if (ordered || bullet) { const pattern = ordered ? /^\d+\.\s+(.+)$/ : /^[-*+]\s+(.+)$/; const items: string[] = []; while (index < lines.length) { const match = lines[index]!.match(pattern); if (!match) break; items.push(match[1]!); index++; } const List = ordered ? "ol" : "ul"; blocks.push(<List key={blocks.length} className={`my-3 space-y-2 pl-5 text-left text-sm leading-6 text-slate-700 ${ordered ? "list-decimal" : "list-disc marker:text-blue-500"}`}>{items.map((item, itemIndex) => <li key={itemIndex}><InlineMarkdown text={item} /></li>)}</List>); continue; }
    const paragraph = [line]; index++; while (index < lines.length && lines[index]!.trim() && !/^(#{1,3}\s+|```|[-*+]\s+|\d+\.\s+)/.test(lines[index]!)) paragraph.push(lines[index++]!); blocks.push(<p key={blocks.length} className="my-3 text-left text-sm leading-6 text-slate-700"><InlineMarkdown text={paragraph.join(" ")} /></p>);
  }
  return <article className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white px-5 py-2 text-left shadow-sm">{blocks}</article>;
}

export function AiSummaryPanel({ roomId }: { roomId: string }) {
  const [summary, setSummary] = useState<string | null>(null); const [loading, setLoading] = useState(false); const [error, setError] = useState<string | null>(null);
  async function generate() { setLoading(true); setError(null); try { const result = await getRoomSummary(roomId); setSummary(result.summary.trim() || null); } catch (e) { setError(getApiErrorMessage(e, "Unable to generate a summary.")); } finally { setLoading(false); } }
  return <div className="h-full overflow-y-auto bg-slate-50 px-4 py-8 sm:px-6"><div className="mx-auto flex max-w-2xl flex-col items-center text-center"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Sparkles className="h-6 w-6" /></span><h2 className="mt-3 text-lg font-semibold text-slate-900">AI study-room summary</h2><p className="mt-1 max-w-md text-sm text-slate-500">Concise notes based only on the last 24 hours of real discussions and materials.</p>{loading ? <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white px-8 py-7 text-sm text-slate-600"><Loader2 className="h-6 w-6 animate-spin text-blue-600" />Reviewing recent study-room activity…</div> : summary ? <div className="mt-6 w-full"><MarkdownNotes markdown={summary} /></div> : error ? <div className="mt-8 max-w-md rounded-xl border border-red-200 bg-red-50 p-5 text-left"><div className="flex gap-2 text-sm font-medium text-red-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />Couldn&apos;t generate the summary</div><p className="mt-2 text-sm leading-6 text-red-700">{error}</p></div> : <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white px-8 py-7 text-sm text-slate-500">No summary generated yet.</div>}<button onClick={generate} disabled={loading} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{loading && <Loader2 className="h-4 w-4 animate-spin" />}{summary ? "Refresh summary" : "Generate summary"}</button></div></div>;
}
