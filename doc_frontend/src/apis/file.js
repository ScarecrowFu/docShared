import request from "src/utils/request";


export function getFileGroupList(params) {
  return request({
    url: "/api/file_groups/",
    method: "get",
    params,
  });
}

export function retrieveFileGroup(instance_id) {
  return request({
    url: `/api/file_groups/${instance_id}/`,
    method: "get",
  });
}

export function createFileGroup(data) {
  return request({
    url: "/api/file_groups/",
    method: "post",
    data,
  });
}

export function deleteFileGroup(instance_id, data) {
  return request({
    url: `/api/file_groups/${instance_id}/`,
    method: "delete",
    data,
  });
}

export function updateFileGroup(instance_id, data, method = "put") {
  return request({
    url: `/api/file_groups/${instance_id}/`,
    method: method,
    data,
  });
}

export function bulkDeleteFileGroup(data) {
  return request({
    url: `/api/file_groups/bulk_delete/`,
    method: "post",
    data,
  });
}




///////////////////////////////////////////////////////////////////////////////////////////



export function getFileAttachmentList(params) {
  return request({
    url: "/api/file_attachments/",
    method: "get",
    params,
  });
}

export function retrieveFileAttachment(instance_id) {
  return request({
    url: `/api/file_attachments/${instance_id}/`,
    method: "get",
  });
}

export function createFileAttachment(data, headers = { "Content-Type": "application/json;charset=UTF-8" }) {
  return request({
    url: "/api/file_attachments/",
    method: "post",
    headers: headers,
    data,
  });
}

export function deleteFileAttachment(instance_id, data) {
  return request({
    url: `/api/file_attachments/${instance_id}/`,
    method: "delete",
    data,
  });
}

export function updateFileAttachment(instance_id, data, method = "put") {
  return request({
    url: `/api/file_attachments/${instance_id}/`,
    method: method,
    data,
  });
}

export function bulkDeleteFileAttachment(data) {
  return request({
    url: `/api/file_attachments/bulk_delete/`,
    method: "post",
    data,
  });
}