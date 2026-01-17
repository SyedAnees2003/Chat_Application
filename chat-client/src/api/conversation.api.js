import api from "./axios";

export const getMyConversationsApi = () => {
  return api.get("/conversations");
};

export const getConversationMembersApi = (id) =>
  api.get(`/conversations/${id}/members`);

export const addMemberApi = (id, userId) =>
  api.post(`/conversations/${id}/members`, { userId });

export const removeMemberApi = (id, userId) =>
  api.delete(`/conversations/${id}/members`, {
    data: { userId }
  });