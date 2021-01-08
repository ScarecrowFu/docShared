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

export function recoverDoc(instance_id, data) {
  return request({
    url: `/api/docs/${instance_id}/recover/`,
    method: "post",
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

export function bulkRecoverDoc(data) {
  return request({
    url: `/api/docs/bulk_recover/`,
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



export function getDocHistory(instance_id) {
  return request({
    url: `/api/docs/${instance_id}/history_list/`,
    method: "get",
  });
}

export function getDocHistoryDetail(instance_id, params) {
  return request({
    url: `/api/docs/${instance_id}/history_detail/`,
    method: "get",
    params
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




///////////////////////////////////////////////////////////////////////////////////////////



export function getDocTagList(params) {
  return request({
    url: "/api/doc_tags/",
    method: "get",
    params,
  });
}

export function retrieveDocTag(instance_id) {
  return request({
    url: `/api/doc_tags/${instance_id}/`,
    method: "get",
  });
}

export function createDocTag(data) {
  return request({
    url: "/api/doc_tags/",
    method: "post",
    data,
  });
}

export function deleteDocTag(instance_id, data) {
  return request({
    url: `/api/doc_tags/${instance_id}/`,
    method: "delete",
    data,
  });
}

export function updateDocTag(instance_id, data, method = "put") {
  return request({
    url: `/api/doc_tags/${instance_id}/`,
    method: method,
    data,
  });
}

export function bulkDeleteDocTag(data) {
  return request({
    url: `/api/doc_tags/bulk_delete/`,
    method: "post",
    data,
  });
}

//////////////////////////////////////////////////////////


export function anonymousGetDocList(params) {
  return request({
    url: "/api/anonymous_docs/",
    method: "get",
    params,
  });
}

export function anonymousRetrieveDoc(instance_id) {
  return request({
    url: `/api/anonymous_docs/${instance_id}/`,
    method: "get",
  });
}

export function anonymousGetDocStatus(params) {
  return request({
    url: "/api/anonymous_docs/doc_status/",
    method: "get",
    params,
  });
}