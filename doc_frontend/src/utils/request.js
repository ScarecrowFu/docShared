import axios from 'axios'
import {message} from 'antd'
import {baseURL, requestTimeout, contentType, authInfoName } from 'src/config/settings';

// 创建 service
const service = axios.create({
  baseURL: baseURL, // api 的 base_url
  timeout: requestTimeout, // 请求超时时间
  headers: {'Content-Type':  contentType}
})

// request 拦截器
service.interceptors.request.use(
    config => {
      const authInfo = JSON.parse(localStorage.getItem(authInfoName))
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
        let config = {
          content: res.messages,
          top: 100,
          duration: 5,
        }
        message.error(config);
        return Promise.reject('error')
      } else {
        return response
      }
    },
    error => {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            break
          case 403:
            break
          case 500:
            break
          default:
        }

      }
      return Promise.reject(error)
    }
)

export default service
