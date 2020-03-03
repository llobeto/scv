import axios from 'axios'

const httpClient = axios.create({
  baseURL: process.env.VUE_APP_ENDPONT,
  timeout: 1000,
})

export { httpClient }