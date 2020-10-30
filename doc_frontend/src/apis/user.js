/**
 * Author: Alan Fu
 * Email: fualan1990@gmail.com
 * 用户管理接口
 **/
import request from "src/utils/request";

export async function login(data) {
  return request({
    url: "/api/auth/",
    method: "post",
    data,
  });
}

export function getInfo() {
  return request({
    url: "/api/users/info/",
    method: "get",
  });
}

export function logout() {
  return request({
    url: "/api/users/logout/",
    method: "post",
  });
}

export function register() {
  return request({
    url: "/register",
    method: "post",
  });
}

export function getUserList(params) {
  return request({
    url: "/api/users/",
    method: "get",
    params,
  });
}

export function retrieveUser(instance_id) {
  return request({
    url: `/api/users/${instance_id}/`,
    method: "get",
  });
}

export function createUser(data) {
  return request({
    url: "/api/users/",
    method: "post",
    data,
  });
}

export function deleteUser(instance_id, data) {
  return request({
    url: `/api/users/${instance_id}/`,
    method: "delete",
    data,
  });
}

export function updateUser(instance_id, data, method = "put") {
  return request({
    url: `/api/users/${instance_id}/`,
    method: method,
    data,
  });
}

export function bulkDeleteUser(data) {
  return request({
    url: `/api/users/bulk_delete/`,
    method: "post",
    data,
  });
}

export function activationUser(instance_id, data) {
  return request({
    url: `/api/users/${instance_id}/activation/`,
    method: "post",
    data,
  });
}

export function resetPasswordUser(instance_id, data) {
  return request({
    url: `/api/users/${instance_id}/reset_password/`,
    method: "post",
    data,
  });
}
