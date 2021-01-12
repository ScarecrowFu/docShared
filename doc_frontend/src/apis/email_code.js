import request from "src/utils/request";


export function getEmailCodeList(params) {
  return request({
    url: "/api/email_codes/",
    method: "get",
    params,
  });
}

export function retrieveEmailCode(instance_id) {
  return request({
    url: `/api/email_codes/${instance_id}/`,
    method: "get",
  });
}

export function createEmailCode(data) {
  return request({
    url: "/api/email_codes/",
    method: "post",
    data,
  });
}

export function deleteEmailCode(instance_id, data) {
  return request({
    url: `/api/email_codes/${instance_id}/`,
    method: "delete",
    data,
  });
}

export function updateEmailCode(instance_id, data, method = "put") {
  return request({
    url: `/api/email_codes/${instance_id}/`,
    method: method,
    data,
  });
}

export function bulkDeleteEmailCode(data) {
  return request({
    url: `/api/email_codes/bulk_delete/`,
    method: "post",
    data,
  });
}

export function getVerificationTypes(params) {
  return request({
    url: `/api/email_codes/verification_types/`,
    method: "get",
    params,
  });
}


export function getEmailCodeStatus() {
  return request({
    url: `/api/email_codes/code_status/`,
    method: "get",
  });
}