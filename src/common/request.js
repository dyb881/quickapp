import { fetch } from '@system.fetch'
import storage from '@system.storage'
import router from '@system.router'

export function request(url, data, method) {
  if (!/^http/.test(url) && this.baseUrl) url = this.baseUrl + url
  const { token, userType } = this.data.user.info

  return fetch({
    url,
    data,
    method,
    responseType: 'json',
    header: {
      token,
      userType,
      'Content-Type': 'application/json'
    }
  })
    .then(({ data }) => {
      console.info(data)
      if (data.code === 200) {
        if ([0, '1000'].includes(data.data.code)) {
          return {
            ok: true,
            ...data.data
          }
        } else {
          if (data.data.code === 401) {
            this.data.user.info = {}
            this.data.car.list = []
            this.data.car._index = undefined
            storage.clear()
            router.clear()
            router.replace({ uri: '/pages/index' })
          }
          return Promise.reject(data.data.msg)
        }
      } else {
        return Promise.reject()
      }
    })
    .catch(error => {
      console.info(error)
      const message = (typeof error === 'string' && error) || '请求错误'
      return { ok: false, message, error }
    })
}

export function get(url, data) {
  return request(url, data)
}

export function post(url, data) {
  return request(url, data, 'POST')
}

export function del(url, data) {
  return request(url, data, 'DELETE')
}

export function put(url, data) {
  return request(url, data, 'PUT')
}