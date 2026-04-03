import { api } from "./client";

export const dashboardService = {
  summary() {
    return api.get("/dashboard/summary/");
  },
  monthly(year) {
    return api.get("/dashboard/monthly/", { params: { year } });
  },
};
