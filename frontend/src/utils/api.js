// WHY: This file is a wrapper around the browser's fetch() function
// Instead of writing fetch() with headers every time, we call api.get() or api.post()
// It automatically attaches the JWT token from localStorage to every request

const BASE_URL = "http://localhost:5000/api";

async function request(method, path, data = null) {
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const config = { method, headers };
    if (data && method !== "GET") config.body = JSON.stringify(data);

    let res;
    try {
        res = await fetch(`${BASE_URL}${path}`, config);
    } catch {
        // FIX: show a clear message instead of raw "TypeError: Failed to fetch"
        throw new Error("Cannot reach server. Make sure the backend is running.");
    }
    const json = await res.json();

    if (!res.ok) throw new Error(json.message || "Request failed");
    return json;
}

const api = {
    get: (path) => request("GET", path),
    post: (path, data) => request("POST", path, data),
    put: (path, data) => request("PUT", path, data),
    delete: (path) => request("DELETE", path),
};

export default api;
