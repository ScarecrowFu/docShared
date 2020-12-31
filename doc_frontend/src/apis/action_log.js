import request from "src/utils/request";


export function getActionLogList(params) {
  return request({
    url: "/api/action_logs/",
    method: "get",
    params,
  });
}

export function retrieveActionLog(instance_id) {
  return request({
    url: `/api/action_logs/${instance_id}/`,
    method: "get",
  });
}

export function createActionLog(data) {
  return request({
    url: "/api/action_logs/",
    method: "post",
    data,
  });
}

export function deleteActionLog(instance_id, data) {
  return request({
    url: `/api/action_logs/${instance_id}/`,
    method: "delete",
    data,
  });
}

export function updateActionLog(instance_id, data, method = "put") {
  return request({
    url: `/api/action_logs/${instance_id}/`,
    method: method,
    data,
  });
}

export function bulkDeleteActionLog(data) {
  return request({
    url: `/api/action_logs/bulk_delete/`,
    method: "post",
    data,
  });
}

export function getActionTypes(params) {
  return request({
    url: `/api/action_logs/action_types/`,
    method: "get",
    params,
  });
}