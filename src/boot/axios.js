import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.QCLI_API_URL || 'http://localhost:3000'
})

api.interceptors.request.use(
  (config) => {
    config.headers['Accept'] = 'application/json'
    const token = localStorage.getItem('gear_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default ({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
}

export { api }