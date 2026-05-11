import api from "./api";

export const getAdminUniversities = async () => {
  const response = await api.get("/admin/universities");
  return response.data;
};

export const createUniversity = async (payload) => {
  const response = await api.post("/admin/universities", payload);
  return response.data;
};

export const updateUniversity = async (id, payload) => {
  const response = await api.put(`/admin/universities/${id}`, payload);
  return response.data;
};

export const deleteUniversity = async (id) => {
  await api.delete(`/admin/universities/${id}`);
};

export const getAdminUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data;
};

export const updateAdminUserRole = async (id, role) => {
  const response = await api.put(`/admin/users/${id}/role`, { role });
  return response.data;
};

export const deleteAdminUser = async (id) => {
  await api.delete(`/admin/users/${id}`);
};

export const sendAdminUsersEmail = async (payload) => {
  const response = await api.post("/admin/users/send-email", payload);
  return response.data;
};
