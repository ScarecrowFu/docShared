import request from "src/utils/request";


export function getCDocList(params) {
  return request({
    url: "/api/collected_docs/",
    method: "get",
    params,
  });
}

export function retrieveCDoc(instance_id) {
  return request({
    url: `/api/collected_docs/${instance_id}/`,
    method: "get",
  });
}

export function createCDoc(data) {
  return request({
    url: "/api/collected_docs/",
    method: "post",
    data,
  });
}

export function deleteCDoc(instance_id, data) {
  return request({
    url: `/api/collected_docs/${instance_id}/`,
    method: "delete",
    data,
  });
}

export function updateCDoc(instance_id, data, method = "put") {
  return request({
    url: `/api/collected_docs/${instance_id}/`,
    method: method,
    data,
  });
}

export function bulkDeleteCDoc(data) {
  return request({
    url: `/api/collected_docs/bulk_delete/`,
    method: "post",
    data,
  });
}

export function getCDocPermissionTypes(params) {
  return request({
    url: "/api/collected_docs/permission_types/",
    method: "get",
    params,
  });
}