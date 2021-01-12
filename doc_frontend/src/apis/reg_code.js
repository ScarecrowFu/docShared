import request from "src/utils/request";


export function getRegisterCodeList(params) {
  return request({
    url: "/api/reg_codes/",
    method: "get",
    params,
  });
}

export function retrieveRegisterCode(instance_id) {
  return request({
    url: `/api/reg_codes/${instance_id}/`,
    method: "get",
  });
}

export function createRegisterCode(data) {
  return request({
    url: "/api/reg_codes/",
    method: "post",
    data,
  });
}

export function deleteRegisterCode(instance_id, data) {
  return request({
    url: `/api/reg_codes/${instance_id}/`,
    method: "delete",
    data,
  });
}

export function updateRegisterCode(instance_id, data, method = "put") {
  return request({
    url: `/api/reg_codes/${instance_id}/`,
    method: method,
    data,
  });
}

export function bulkDeleteRegisterCode(data) {
  return request({
    url: `/api/reg_codes/bulk_delete/`,
    method: "post",
    data,
  });
}

export function getRegisterCodeStatus() {
  return request({
    url: `/api/reg_codes/code_status/`,
    method: "get",
  });
}