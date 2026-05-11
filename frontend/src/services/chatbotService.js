import api from "./api";

export const sendChatbotMessage = async (message) => {
  const response = await api.post("/chatbot/message", { message });
  return response.data;
};

export const getChatbotKnowledgeBase = async () => {
  const response = await api.get("/chatbot/knowledge-base");
  return response.data;
};

export const createChatbotKnowledgeEntry = async (payload) => {
  const response = await api.post("/chatbot/knowledge-base", payload);
  return response.data;
};

export const updateChatbotKnowledgeEntry = async (id, payload) => {
  const response = await api.put(`/chatbot/knowledge-base/${id}`, payload);
  return response.data;
};

export const deleteChatbotKnowledgeEntry = async (id) => {
  await api.delete(`/chatbot/knowledge-base/${id}`);
};
