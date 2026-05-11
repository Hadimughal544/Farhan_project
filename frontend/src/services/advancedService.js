import api from "./api";

export const getStudentDashboard = async () => {
  const response = await api.get("/advanced/student-dashboard");
  return response.data;
};

export const getPredictionHistory = async () => {
  const response = await api.get("/advanced/prediction-history");
  return response.data;
};

export const getSavedUniversities = async () => {
  const response = await api.get("/advanced/saved-universities");
  return response.data;
};

export const saveUniversity = async (universityId, note = "") => {
  const response = await api.post("/advanced/saved-universities", { university_id: universityId, note });
  return response.data;
};

export const removeSavedUniversity = async (savedId) => {
  await api.delete(`/advanced/saved-universities/${savedId}`);
};

export const getScholarshipRecommendations = async (payload) => {
  const response = await api.post("/advanced/scholarships/recommendations", payload);
  return response.data;
};

export const getCareerRecommendation = async (payload) => {
  const response = await api.post("/advanced/career/recommend", payload);
  return response.data;
};

export const generateRoadmap = async (payload) => {
  const response = await api.post("/advanced/roadmap/generate", payload);
  return response.data;
};

export const compareUniversities = async (universityIds) => {
  const response = await api.post("/advanced/universities/compare", universityIds);
  return response.data;
};

export const getMeritTrends = async (universityId) => {
  const response = await api.get("/advanced/merit-trends", {
    params: universityId ? { university_id: universityId } : undefined,
  });
  return response.data;
};

export const createMeritTrend = async (payload) => {
  const response = await api.post("/advanced/admin/merit-trends", payload);
  return response.data;
};

export const deleteMeritTrend = async (trendId) => {
  await api.delete(`/advanced/admin/merit-trends/${trendId}`);
};
