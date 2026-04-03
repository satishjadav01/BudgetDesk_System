import { api } from "./client";

export const invoiceService = {
  list(params) {
    return api.get("/invoices/", { params });
  },
  create(payload) {
    return api.post("/invoices/", payload);
  },
  update(id, payload) {
    return api.put(`/invoices/${id}/`, payload);
  },
  remove(id) {
    return api.delete(`/invoices/${id}/`);
  },
  downloadPdf(id) {
    return api.get(`/invoices/${id}/pdf/`, { responseType: "blob" });
  },
};
