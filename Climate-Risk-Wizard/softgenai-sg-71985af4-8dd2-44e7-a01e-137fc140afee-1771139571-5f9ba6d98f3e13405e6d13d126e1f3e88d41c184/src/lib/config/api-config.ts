/**
 * Backend Integration Configuration
 * Controls API mode, base URL, and logging verbosity
 */

export type APIMode = "mock" | "real";

export interface APIConfig {
  mode: APIMode;
  baseURL: string;
  logLevel: "verbose" | "normal" | "silent";
  timeout: number;
}

/**
 * Get API configuration from environment variables
 */
export function getAPIConfig(): APIConfig {
  const mode = (process.env.NEXT_PUBLIC_API_MODE || "mock") as APIMode;
  
  // Default base URLs
  const defaultBaseURL = mode === "mock" 
    ? "http://localhost:3000/api"
    : "https://api.staging.climatewizard.ai/v1";
  
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || defaultBaseURL;
  
  // Logging verbosity
  const logLevel = (process.env.NEXT_PUBLIC_LOG_LEVEL || "normal") as "verbose" | "normal" | "silent";
  
  // Request timeout (ms)
  const timeout = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "30000", 10);
  
  return {
    mode,
    baseURL,
    logLevel,
    timeout
  };
}

/**
 * Logging utility respecting verbosity settings
 */
export const apiLogger = {
  verbose: (...args: any[]) => {
    const config = getAPIConfig();
    if (config.logLevel === "verbose") {
      console.log("[API:VERBOSE]", ...args);
    }
  },
  
  info: (...args: any[]) => {
    const config = getAPIConfig();
    if (config.logLevel !== "silent") {
      console.log("[API:INFO]", ...args);
    }
  },
  
  error: (...args: any[]) => {
    const config = getAPIConfig();
    if (config.logLevel !== "silent") {
      console.error("[API:ERROR]", ...args);
    }
  },
  
  warn: (...args: any[]) => {
    const config = getAPIConfig();
    if (config.logLevel !== "silent") {
      console.warn("[API:WARN]", ...args);
    }
  }
};

/**
 * Check if we're in mock mode
 */
export function isMockMode(): boolean {
  return getAPIConfig().mode === "mock";
}

/**
 * Check if we're in real mode (staging/production)
 */
export function isRealMode(): boolean {
  return getAPIConfig().mode === "real";
}

/**
 * Get full API endpoint URL
 */
export function getEndpointURL(path: string): string {
  const config = getAPIConfig();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${config.baseURL}${cleanPath}`;
}