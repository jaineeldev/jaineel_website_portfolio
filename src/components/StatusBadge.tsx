/**
 * A project's status as a small tinted label, so Live, In development and Complete read apart at a glance.
 * Takes the first part of a line like "Live · v1.2.0 · Oct 2026" as the status and leaves the rest as plain text.
 * The word is always there, so colour is never the only signal. Colours live in globals.css (`.status`).
 */
type Kind = "live" | "wip" | "done" | "plain";

function kindOf(status: string): Kind {
  const s = status.trim().toLowerCase();
  if (s.startsWith("live")) return "live";
  if (s.startsWith("in development") || s.startsWith("wip")) return "wip";
  if (s.startsWith("complete")) return "done";
  return "plain";
}

export default function StatusBadge({ status }: { status: string }) {
  const [head, ...rest] = status.split(" · ");
  return (
    <>
      <span className={`status status--${kindOf(head)}`}>{head}</span>
      {rest.length > 0 && <span>{rest.join(" · ")}</span>}
    </>
  );
}
