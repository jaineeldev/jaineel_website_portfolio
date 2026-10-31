import Image from "next/image";
import type { Project } from "@/content/projects";

// Wide enough to read at a glance, small enough not to compete with the title. Rows without a real capture
// keep the same space empty, so the text lines up down the list.
const BOX = "block h-[56px] w-[90px] flex-none sm:h-[80px] sm:w-[128px]";

/** The small capture beside a Work row. A capture with a light version swaps with the theme. */
export default function WorkThumb({ thumb, priority = false }: { thumb: Project["thumb"]; priority?: boolean }) {
  if (!thumb) return <span aria-hidden className={BOX.replace("flex-none", "")} />;

  const img = (src: string, extra: string) => (
    <Image
      src={src}
      alt=""
      width={288}
      height={180}
      sizes="(min-width: 640px) 128px, 90px"
      priority={priority}
      unoptimized
      className={`h-full w-full object-cover ${extra}`}
    />
  );

  return (
    <span
      aria-hidden
      className={`${BOX} overflow-hidden border border-border bg-raise transition-colors duration-300 group-hover:border-accent group-focus-visible:border-accent`}
    >
      {img(thumb.src, thumb.srcLight ? "themed-dark" : "")}
      {thumb.srcLight && img(thumb.srcLight, "themed-light")}
    </span>
  );
}
