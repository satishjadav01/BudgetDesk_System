import { api } from "./client";

export const expenseService = {
  list(params) {
    return api.get("/expenses/", { params });
  },
  create(payload) {
    return api.post("/expenses/", payload);
  },
  update(id, payload) {
    return api.put(`/expenses/${id}/`, payload);
  },
  remove(id) {
    return api.delete(`/expenses/${id}/`);
  },
};
