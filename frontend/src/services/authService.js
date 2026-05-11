import api from "./api";

export const registerUser = async (payload) => {
  const response = await api.post("/auth/register", payload);
  return response.data;
};

export const loginUser = async (payload) => {
  const response = await api.post("/auth/login", payload);
  return response.data;
};

export const getMyProfile = async () => {
  const response = await api.get("/users/me");
  return response.data;
};

export const updateMyProfile = async (payload) => {
  const response = await api.put("/users/me", payload);
  return response.data;
};

export const uploadAvatar = async (file) => {
  const form = new FormData();
  form.append("file", file);
  const response = await api.post("/users/me/avatar", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
