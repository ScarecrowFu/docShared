import axios from 'axios'
import {baseURL, requestTimeout, contentType, messageDuration } from 'src/config/settings';
import {getLoginUser, toLogin} from 'src/utils/userAuth'
import {notification} from 'antd';


// 创建 service
const service = axios.create({
  baseURL: baseURL, // api 的 base_url
  timeout: requestTimeout, // 请求超时时间
  headers: {'Content-Type':  contentType}
})

// request 拦截器
service.interceptors.request.use(
    config => {
      const authInfo = getLoginUser()
      if (authInfo) {
        const token = authInfo.token
        if (token) {
          config.headers.Authorization = 'doc ' + token
        }
      }
      return config
    },
    error => {
      return Promise.reject(error)
    })

// response 拦截器
service.interceptors.response.use(
    response => {
      const res = response.data
      if (res.success === false) {
          notification.error({
              message: '请查看错误信息',
              description: res.messages,
              duration: messageDuration,
          });
        return Promise.reject('error')
      } else {
        return response
      }
    },
    error => {
      if (error.response) {
        const res = error.response.data;
        switch (error.response.status) {
          case 400:
                notification.error({
                    message: '错误的请求',
                    description: res.messages,
                    duration: messageDuration,
                });
                break;
          case 401:
              notification.error({
                  message: '登录凭证过期, 重新登录',
                  description: res.messages,
                  duration: messageDuration,
              });
              toLogin();
              break;
          case 403:
              notification.error({
                  message: '认证信息错误',
                  description: res.messages,
                  duration: messageDuration,
              });
              break ;
          case 500:
              notification.error({
                  message: '服务发生错误, 请稍候再试或联系管理员',
                  description: res.messages,
                  duration: messageDuration,
              });
              break;
          default:
              notification.error({
                  message: '服务发生错误, 请稍候再试或联系管理员',
                  description: res.messages,
                  duration: messageDuration,
              });
              break;
        }

      }
      return Promise.reject(error)
    }
)

export default service
