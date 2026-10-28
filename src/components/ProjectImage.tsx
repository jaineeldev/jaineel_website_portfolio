import Image from "next/image";
import type { ProjectImage as ProjectImageData } from "@/content/projects";

/**
 * One real capture for a project page. A capture with a light version swaps with the theme.
 * A wide one scrolls sideways at full size on a phone, so its small labels stay readable.
 */
export default function ProjectImage({ image }: { image: ProjectImageData }) {
  const fit = image.scroll
    ? "h-auto w-full min-w-[780px] max-w-none sm:min-w-0"
    : "h-auto w-full";
  const sizes = image.scroll ? "(min-width: 680px) 680px, 780px" : "(min-width: 680px) 680px, 100vw";

  return (
    <figure className="mt-9">
      <div className={`border border-border bg-raise ${image.scroll ? "overflow-x-auto sm:overflow-hidden" : "overflow-hidden"}`}>
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes={sizes}
          priority
          className={`${fit} ${image.srcLight ? "themed-dark" : ""}`}
        />
        {image.srcLight && (
          <Image
            src={image.srcLight}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes={sizes}
            className={`${fit} themed-light`}
          />
        )}
      </div>
      <figcaption className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-fg-dim">
        {image.caption}
        {image.scroll && <span className="sm:hidden"> Swipe to see all of it.</span>}
      </figcaption>
    </figure>
  );
}
