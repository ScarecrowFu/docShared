import request from "src/utils/request";


export function getSystemSettingList(params) {
  return request({
    url: "/api/sys_set/",
    method: "get",
    params,
  });
}

export function retrieveSystemSetting(instance_id) {
  return request({
    url: `/api/sys_set/${instance_id}/`,
    method: "get",
  });
}

export function getSystemSettingSpecifyList(params) {
  return request({
    url: "/api/sys_set/specify_set/",
    method: "get",
    params,
  });
}

export function saveSystemSettingSpecifyList(data) {
  return request({
    url: "/api/sys_set/specify_set/",
    method: "post",
    data,
  });
}

