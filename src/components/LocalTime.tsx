"use client";

import { useEffect, useState } from "react";

function brisbaneTime(): string {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Brisbane",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());
}

/**
 * "Brisbane, 3:42 pm. Available for work." The time appears once the page has loaded, because the server
 * can't know it, and keeps itself current. Useful to a recruiter in another time zone.
 */
export default function LocalTime() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setTime(brisbaneTime());
    update();
    const id = window.setInterval(update, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return <>Brisbane{time ? `, ${time}` : ", AU"}. Available for work.</>;
}
