"use client";

type LogLevel = "info" | "warn" | "error";

function shouldLog(): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem("VALENTINE_DEBUG") === "1";
}

export function logClientDebug(level: LogLevel, message: string, payload?: unknown): void {
  if (!shouldLog()) {
    return;
  }

  const prefix = `[valentine-debug] ${message}`;

  if (level === "error") {
    console.error(prefix, payload);
    return;
  }

  if (level === "warn") {
    console.warn(prefix, payload);
    return;
  }

  console.info(prefix, payload);
}
