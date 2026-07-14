import axios from "axios";
import { supabase } from "../lib/supabaseClient";

const BASE_URL = import.meta.env.VITE_API_URL || "https://datapilot-65m6.onrender.com";

const api = axios.create({
  baseURL: BASE_URL,
});

// Attach the current user's Supabase JWT to every outgoing request, if logged in.
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
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

export const getHistory = async () => {
  const response = await api.get("/history");
  return response.data;
};

export const deleteSession = async (sessionId) => {
  const response = await api.delete(`/history/${sessionId}`);
  return response.data;
};

// ── Profile APIs ──────────────────────────────────────────────

export const getProfile = async () => {
  const response = await api.get("/profile");
  return response.data;
};

export const updateProfile = async (profileData) => {
  // profileData: { name, role, company }
  const response = await api.put("/profile", profileData);
  return response.data;
};