import api from "./axios";

export const getMyConversationsApi = () => {
  return api.get("/conversations");
};
