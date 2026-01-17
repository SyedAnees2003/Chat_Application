import api from "./axios";

export const getUsersApi = () => {
  return api.get("/users");
};
