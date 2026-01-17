import api from "./axios";

export const getMessagesApi = (conversationId) => {
  return api.get(`/messages/${conversationId}`);
};
