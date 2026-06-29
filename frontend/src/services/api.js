import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "https://datapilot-65m6.onrender.com";

const api = axios.create({
  baseURL: BASE_URL,
});

export const uploadFile = async (file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded * 100) / event.total));
      }
    },
  });
  return response.data;
};

export const sendMessage = async (sessionId, message) => {
  const response = await api.post("/chat", {
    session_id: sessionId,
    message: message,
  });
  return response.data;
};

export const getChatHistory = async (sessionId) => {
  const response = await api.get(`/chat/history/${sessionId}`);
  return response.data;
};

// ── SQL APIs ──────────────────────────────────────────────────

export const uploadSQLiteDB = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/sql/upload-db", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const connectSQLDB = async (connectionData) => {
  const response = await api.post("/sql/connect", connectionData);
  return response.data;
};

export const sendSQLMessage = async (sessionId, message) => {
  const response = await api.post("/sql/chat", {
    session_id: sessionId,
    message: message,
  });
  return response.data;
};