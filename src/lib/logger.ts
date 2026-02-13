import pino from "pino";
import { env } from "@/lib/env";

const isDev = env.NODE_ENV !== "production";

const loggerOptions: pino.LoggerOptions = {
  name: "valentine-app",
  level: env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
};

if (isDev) {
  loggerOptions.transport = {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  };
}

export const logger = pino(loggerOptions);
