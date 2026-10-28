import { ViewTransition } from "react";

// A template remounts on every navigation, which is what lets the page fade (see globals.css, "Page change").
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition default="none" enter="page-in" exit="page-out">
      {children}
    </ViewTransition>
  );
}
