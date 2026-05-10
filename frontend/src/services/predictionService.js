import api from "./api";

export const predictAdmission = async (payload) => {
  const response = await api.post("/predictions/admission/suggest", payload);
  return response.data;
};
