"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;
const POLL_MS = 30_000;

type Track = { isPlaying: true; title: string; artist: string };
type Idle = { isPlaying: false };
type State = Track | Idle | null;

export default function NowPlaying() {
  const [state, setState] = useState<State>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Nobody is looking at a hidden tab, so don't spend Spotify requests on it.
      if (document.hidden) return;
      try {
        const res = await fetch("/api/spotify/now-playing", {
          cache: "no-store",
        });
        if (!res.ok) {
          if (!cancelled) setState({ isPlaying: false });
          return;
        }
        const data = (await res.json()) as State;
        if (!cancelled) setState(data);
      } catch {
        if (!cancelled) setState({ isPlaying: false });
      }
    }

    load();
    const id = window.setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const playing = state && state.isPlaying ? state : null;

  return (
    <AnimatePresence>
      {playing && (
        <motion.div
          key={`${playing.title}-${playing.artist}`}
          initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 8, filter: "blur(4px)" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="flex max-w-full items-center gap-2.5 font-mono text-[10.5px] uppercase tracking-[0.14em]"
        >
          <span aria-hidden className="eq text-fg-muted">
            <i />
            <i />
            <i />
          </span>
          <span className="flex-none text-fg-dim">Listening to</span>
          <span className="truncate normal-case tracking-normal text-fg-muted">
            <span className="text-fg">{playing.title}</span>
            <span className="mx-1.5 text-fg-dim" aria-hidden>·</span>
            <span>{playing.artist}</span>
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
