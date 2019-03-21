import axios from 'axios'
import { Message } from 'element-ui'

const _baseUrl = process.env.NODE_ENV == 'development' ? 'http://192.168.1.139:9095/' : 'http://192.168.1.241:9095/'

const fetch = axios.create({
  baseURL: _baseUrl,
  timeout: 500
})

// request interceptor
fetch.interceptors.request.use(
  config => {

    return config
  },
  error => {
    console.log(error)
    Promise.reject(error)
  }
)

// response interceptor
// fetch.interceptors.response.use(
//   response => response,
//   error => {
//     console.log('err' + error)
//     Message({
//       message: error.message,
//       type: 'error',
//       duration: 5 * 1000
//     })
//     return Promise.reject(error)
//   }
// )

export default fetch
