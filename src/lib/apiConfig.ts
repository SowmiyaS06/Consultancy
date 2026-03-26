const removeTrailingSlash = (value: string) => value.replace(/\/$/, "");

const resolveApiBaseUrl = () => {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim();
  if (fromEnv) {
    return removeTrailingSlash(fromEnv);
  }

  if (import.meta.env.DEV) {
    return "http://localhost:5000";
  }

  return "";
};

export const API_BASE_URL = resolveApiBaseUrl();
