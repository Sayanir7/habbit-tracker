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
  login: (payload) => request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  signup: (payload) => request("/api/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request("/api/auth/me"),
  tracker: () => request("/api/tracker"),
  createHabit: (payload) => request("/api/habits", { method: "POST", body: JSON.stringify(payload) }),
  updateHabit: (id, payload) => request(`/api/habits/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteHabit: (id) => request(`/api/habits/${id}`, { method: "DELETE" }),
  createTask: (payload) => request("/api/tasks", { method: "POST", body: JSON.stringify(payload) }),
  updateTask: (id, payload) => request(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteTask: (id) => request(`/api/tasks/${id}`, { method: "DELETE" }),
  createNote: (date, payload) => request(`/api/notes/${date}`, { method: "POST", body: JSON.stringify(payload) }),
  listNotes: (page = 1, limit = 10) => request(`/api/notes?page=${page}&limit=${limit}`),
  searchLocations: (query) => request(`/api/notes/locations?query=${encodeURIComponent(query)}`),
  dailyKnowledge: () => request("/api/knowledge/daily"),
  knowledgeHistory: () => request("/api/knowledge/history"),
  dailyQuiz: () => request("/api/quiz/daily"),
  quizHistory: () => request("/api/quiz/history"),
  submitQuiz: (payload) => request("/api/quiz/attempts", { method: "POST", body: JSON.stringify(payload) }),
  assistantChat: (payload) => request("/api/assistant/chat", { method: "POST", body: JSON.stringify(payload) })
};
