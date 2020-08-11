import { create } from '@system.websocketfactory'
import { getUserId } from '@system.device'

export const getWebSocketSign = async () => {
  const { data } = await getUserId()
  return data.userId + +new Date()
}

let ws
let interval
let timeout
let isOpen

const clear = () => {
  if(interval) {
    clearInterval(interval)
    interval= null
  }

  if(timeout) {
    clearTimeout(timeout)
    timeout = null
  }
}

export function websocket({url, ...config}, onMessage) {
  if(!/^ws/.test(url) && this.wsUrl) url = this.wsUrl + url
  Object.assign(config,{url})
  ws = create(config)
  const reconnect = () => {
    clear()
    if(isOpen) timeout = setTimeout(() => websocket(config, onMessage), 500)
  }

  ws.onopen = () => {
    isOpen = true
    console.info('open')
    clear()
    interval = setInterval(() => {
      console.info('heartbeat')
      ws.send({ data: 'heartbeat' })
    }, 30000)
  }

  ws.onmessage = (data) => {
    onMessage && onMessage(data)
  }

  ws.onerror = () => {
    console.info('error')
    reconnect()
  }

  ws.onclose =  () => {
    console.info('close')
    reconnect()
  }

  return () => {
    isOpen = false
    clear()
    ws.close()
  }
}