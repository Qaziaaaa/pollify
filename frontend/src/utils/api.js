const BASE_URL = "http://localhost:5000/api";

async function request(method, path, data = null) {
  const token = localStorage.getItem("token");
  const isFormData = data instanceof FormData;
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isFormData) headers["Content-Type"] = "application/json";

  const config = { method, headers };
  if (data && method !== "GET") config.body = isFormData ? data : JSON.stringify(data);

  const res = await fetch(`${BASE_URL}${path}`, config);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
}

const api = {
  get: (path) => request("GET", path),
  post: (path, data) => request("POST", path, data),
  put: (path, data) => request("PUT", path, data),
  patch: (path, data) => request("PATCH", path, data),
  delete: (path) => request("DELETE", path),
};

export default api;
