import request from "src/utils/request";


export function getDocList(params) {
  return request({
    url: "/api/docs/",
    method: "get",
    params,
  });
}

export function retrieveDoc(instance_id) {
  return request({
    url: `/api/docs/${instance_id}/`,
    method: "get",
  });
}

export function createDoc(data) {
  return request({
    url: "/api/docs/",
    method: "post",
    data,
  });
}

export function deleteDoc(instance_id, data) {
  return request({
    url: `/api/docs/${instance_id}/`,
    method: "delete",
    data,
  });
}

export function updateDoc(instance_id, data, method = "put") {
  return request({
    url: `/api/docs/${instance_id}/`,
    method: method,
    data,
  });
}

export function bulkDeleteDoc(data) {
  return request({
    url: `/api/docs/bulk_delete/`,
    method: "post",
    data,
  });
}


export function getDocStatus(params) {
  return request({
    url: "/api/docs/doc_status/",
    method: "get",
    params,
  });
}


///////////////////////////////////////////////////////////////////////////////////////////



export function getDocTemplateList(params) {
  return request({
    url: "/api/doc_templates/",
    method: "get",
    params,
  });
}

export function retrieveDocTemplate(instance_id) {
  return request({
    url: `/api/doc_templates/${instance_id}/`,
    method: "get",
  });
}

export function createDocTemplate(data) {
  return request({
    url: "/api/doc_templates/",
    method: "post",
    data,
  });
}

export function deleteDocTemplate(instance_id, data) {
  return request({
    url: `/api/doc_templates/${instance_id}/`,
    method: "delete",
    data,
  });
}

export function updateDocTemplate(instance_id, data, method = "put") {
  return request({
    url: `/api/doc_templates/${instance_id}/`,
    method: method,
    data,
  });
}

export function bulkDeleteDocTemplate(data) {
  return request({
    url: `/api/doc_templates/bulk_delete/`,
    method: "post",
    data,
  });
}