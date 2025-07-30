// src/api.js

const BASE_URL =
  "https://wph61ywnp3.execute-api.ap-southeast-2.amazonaws.com/prod";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = {};
  }
  if (!res.ok) {
    throw new Error(json.error || res.statusText || "API Error");
  }
  return json;
}

// INGREDIENTS
export function getIngredients() {
  return request("/ingredients");
}
export function addIngredient(data) {
  return request("/ingredients", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export function deleteIngredient(id) {
  return request(`/ingredients/${id}`, { method: "DELETE" });
}

// RECIPES
export function getRecipes() {
  return request("/recipes");
}
export function addRecipe(data) {
  return request("/recipes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export function deleteRecipe(id) {
  return request(`/recipes/${id}`, { method: "DELETE" });
}

// SALES
export function getSales() {
  return request("/sales");
}
export function recordSale(data) {
  return request("/sales", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export function deleteSale(id) {
  return request(`/sales/${id}`, { method: "DELETE" });
}

// DASHBOARD
export function getDashboardStats() {
  return request("/dashboard");
}
