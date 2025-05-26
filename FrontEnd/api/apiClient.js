const API_BASE = "http://localhost:3000";

function toFullURL(path) {
  if (/^https?:\/\//.test(path)) return path;
  return API_BASE + path.replace(/^\/+/, "");
}

async function apiRequest(endpoint, method = "GET", data = null, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const config = {
    method,
    headers,
  };

  if (data && !(data instanceof FormData)) {
    config.body = JSON.stringify(data);
  } else if (data instanceof FormData) {
    delete headers["Content-Type"]; // Let browser set it
    config.body = data;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, config);
  if (!res.ok) throw new Error(`Erreur API: ${res.status} ${res.statusText}`);
  return res.status !== 204 ? await res.json() : null;
}

// === API spécifiques produits ===
export async function getAllProducts() {
  return apiRequest("/api/produits");
}

export async function deleteProduct(id, token) {
  return apiRequest(`/api/produits/${id}`, "DELETE", null, token);
}

export async function createProduct(formData, token) {
  return apiRequest("/api/produits", "POST", formData, token);
}

export async function updateProduct(id, formData, token) {
  return apiRequest(`/api/produits/${id}`, "PUT", formData, token);
}

export async function loginAdmin(credentials) {
  return apiRequest("/api/auth/login", "POST", credentials);
}

export { toFullURL };
