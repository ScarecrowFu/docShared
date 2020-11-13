import request from "src/utils/request";


export function getTeamGroupList(params) {
  return request({
    url: "/api/team_groups/",
    method: "get",
    params,
  });
}

export function retrieveTeamGroup(instance_id) {
  return request({
    url: `/api/team_groups/${instance_id}/`,
    method: "get",
  });
}

export function createTeamGroup(data) {
  return request({
    url: "/api/team_groups/",
    method: "post",
    data,
  });
}

export function deleteTeamGroup(instance_id, data) {
  return request({
    url: `/api/team_groups/${instance_id}/`,
    method: "delete",
    data,
  });
}

export function updateTeamGroup(instance_id, data, method = "put") {
  return request({
    url: `/api/team_groups/${instance_id}/`,
    method: method,
    data,
  });
}

export function bulkDeleteTeamGroup(data) {
  return request({
    url: `/api/team_groups/bulk_delete/`,
    method: "post",
    data,
  });
}