// ===== API CLIENT =====
// Centralized HTTP wrapper around fetch. Auto-injects JWT from localStorage
// handles JSON vs FormData based on data type, enforces request timeout,
// and clears expired tokens on 401 responses.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const TIMEOUT_MS = 15000; // 15 second timeout — prevents hanging on slow networks

async function request(method, path, data = null, options = {}) {
  const token = localStorage.getItem("token");
  const isFormData = data instanceof FormData;
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isFormData) headers["Content-Type"] = "application/json";

  // AbortController for timeout + optional external signal
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const signal = options.signal;

  // Link external signal to the controller
  if (signal) {
    const onAbort = () => controller.abort();
    signal.addEventListener("abort", onAbort, { once: true });
    // Clean up the listener when our controller fires
    controller.signal.addEventListener("abort", () => signal.removeEventListener("abort", onAbort), { once: true });
  }

  const config = { method, headers, signal: controller.signal };
  if (data && method !== "GET") config.body = isFormData ? data : JSON.stringify(data);

  try {
    const res = await fetch(`${BASE_URL}${path}`, config);
    clearTimeout(timer);
    const json = await res.json();

    // Auto-logout on expired/invalid token
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirect to login unless already there
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login";
      }
      throw new Error(json.message || "Session expired. Please sign in again.");
    }

    if (!res.ok) throw new Error(json.message || "Request failed");
    return json;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") throw new Error("Request timed out");
    throw err;
  }
}

// Convenience methods matching HTTP verbs
const api = {
  get: (path, options) => request("GET", path, null, options),
  post: (path, data, options) => request("POST", path, data, options),
  put: (path, data, options) => request("PUT", path, data, options),
  patch: (path, data, options) => request("PATCH", path, data, options),
  delete: (path, options) => request("DELETE", path, null, options),
};

export default api;
