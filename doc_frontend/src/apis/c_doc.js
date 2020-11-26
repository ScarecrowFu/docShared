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

export function getCDocMemberPermissionTypes(params) {
  return request({
    url: "/api/collected_docs/member_permission_types/",
    method: "get",
    params,
  });
}

/////////////////////////////////////////////////////////////



export function getCDocUserList(params) {
  return request({
    url: "/api/collected_doc_users/",
    method: "get",
    params,
  });
}

export function retrieveCDocUser(instance_id) {
  return request({
    url: `/api/collected_doc_users/${instance_id}/`,
    method: "get",
  });
}

export function createCDocUser(data) {
  return request({
    url: "/api/collected_doc_users/",
    method: "post",
    data,
  });
}

export function deleteCDocUser(instance_id, data) {
  return request({
    url: `/api/collected_doc_users/${instance_id}/`,
    method: "delete",
    data,
  });
}

export function updateCDocUser(instance_id, data, method = "put") {
  return request({
    url: `/api/collected_doc_users/${instance_id}/`,
    method: method,
    data,
  });
}

export function bulkDeleteCDocUser(data) {
  return request({
    url: `/api/collected_doc_users/bulk_delete/`,
    method: "post",
    data,
  });
}


/////////////////////////////////////////////////////////////



export function getCDocTeamList(params) {
  return request({
    url: "/api/collected_doc_teams/",
    method: "get",
    params,
  });
}

export function retrieveCDocTeam(instance_id) {
  return request({
    url: `/api/collected_doc_teams/${instance_id}/`,
    method: "get",
  });
}

export function createCDocTeam(data) {
  return request({
    url: "/api/collected_doc_teams/",
    method: "post",
    data,
  });
}

export function deleteCDocTeam(instance_id, data) {
  return request({
    url: `/api/collected_doc_teams/${instance_id}/`,
    method: "delete",
    data,
  });
}

export function updateCDocTeam(instance_id, data, method = "put") {
  return request({
    url: `/api/collected_doc_teams/${instance_id}/`,
    method: method,
    data,
  });
}

export function bulkDeleteCDocTeam(data) {
  return request({
    url: `/api/collected_doc_teams/bulk_delete/`,
    method: "post",
    data,
  });
}