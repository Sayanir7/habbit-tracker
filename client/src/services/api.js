const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const getToken = () => localStorage.getItem("habit-quest-token");

const request = async (path, options = {}) => {
  const token = getToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
};

export const api = {
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  signup: (payload) => request("/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request("/auth/me"),
  tracker: () => request("/tracker"),
  createHabit: (payload) => request("/habits", { method: "POST", body: JSON.stringify(payload) }),
  updateHabit: (id, payload) => request(`/habits/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteHabit: (id) => request(`/habits/${id}`, { method: "DELETE" }),
  createTask: (payload) => request("/tasks", { method: "POST", body: JSON.stringify(payload) }),
  updateTask: (id, payload) => request(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: "DELETE" }),
  upsertNote: (date, body) => request(`/notes/${date}`, { method: "PUT", body: JSON.stringify({ body }) })
};
