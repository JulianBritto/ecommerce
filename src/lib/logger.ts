import * as fs from "fs";
import * as path from "path";

const LOG_DIR = path.join(process.cwd(), "log");

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

export interface LogEntry {
  timestamp: string;
  level: "INFO" | "ERROR" | "WARN";
  message: string;
  context?: Record<string, any>;
  error?: string;
}

export function getLogFilePath(filename: string): string {
  return path.join(LOG_DIR, filename);
}

export function writeLog(
  filename: string,
  level: "INFO" | "ERROR" | "WARN",
  message: string,
  context?: Record<string, any>,
  error?: Error | string
): void {
  try {
    const timestamp = new Date().toISOString();

    const entry: LogEntry = {
      timestamp,
      level,
      message,
      context,
      error:
        error instanceof Error
          ? `${error.name}: ${error.message}\n${error.stack}`
          : typeof error === "string"
            ? error
            : undefined,
    };

    const logPath = getLogFilePath(filename);
    const logLine = JSON.stringify(entry) + "\n";

    fs.appendFileSync(logPath, logLine, "utf-8");
  } catch (err) {
    console.error("Failed to write log:", err);
  }
}

export function logPreferenceError(
  message: string,
  details?: Record<string, any>,
  error?: Error | string
): void {
  const filename = `preference-error-${new Date().toISOString().split("T")[0]}.log`;
  writeLog(filename, "ERROR", message, details, error);
}

export function logPaymentEvent(
  message: string,
  details?: Record<string, any>
): void {
  const filename = `payment-${new Date().toISOString().split("T")[0]}.log`;
  writeLog(filename, "INFO", message, details);
}
