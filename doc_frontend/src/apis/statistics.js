import request from "src/utils/request";


export function getDashboardStatistics(params) {
  return request({
    url: "/api/dashboard_statistics/",
    method: "get",
    params,
  });
}