import request from "src/utils/request";


export function getAnnouncementList(params) {
  return request({
    url: "/api/announcements/",
    method: "get",
    params,
  });
}

export function retrieveAnnouncement(instance_id) {
  return request({
    url: `/api/announcements/${instance_id}/`,
    method: "get",
  });
}

export function createAnnouncement(data) {
  return request({
    url: "/api/announcements/",
    method: "post",
    data,
  });
}

export function deleteAnnouncement(instance_id, data) {
  return request({
    url: `/api/announcements/${instance_id}/`,
    method: "delete",
    data,
  });
}

export function updateAnnouncement(instance_id, data, method = "put") {
  return request({
    url: `/api/announcements/${instance_id}/`,
    method: method,
    data,
  });
}

export function bulkDeleteAnnouncement(data) {
  return request({
    url: `/api/announcements/bulk_delete/`,
    method: "post",
    data,
  });
}