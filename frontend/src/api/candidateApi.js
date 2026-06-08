import api from "./axios";

export const fetchCandidatesApi = async (params) => {
  const response = await api.get("/candidates", { params });
  return response.data;
};

export const fetchCandidateDetailApi = async (id) => {
  const response = await api.get(`/candidates/${id}`);
  return response.data;
};

export const addScoreApi = async (id, payload) => {
  const response = await api.post(`/candidates/${id}/scores`, payload);
  return response.data;
};

export const generateSummaryApi = async (id) => {
  const response = await api.post(`/candidates/${id}/summary`);
  return response.data;
};

export const createCandidateApi = async (payload) => {
  const response = await api.post("/candidates", payload);
  return response.data;
};

export const deleteCandidateApi = async (id) => {
  const response = await api.delete(`/candidates/${id}`);
  return response.data;
};
