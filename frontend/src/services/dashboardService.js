import api from "./api";

export const getDashboardUniversities = async () => {
  const response = await api.get("/users/universities");
  return response.data;
};
