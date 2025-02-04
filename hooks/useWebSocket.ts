import { useEffect, useRef } from 'react'
import { apiClient } from '@/lib/api-client'

interface WebSocketOptions {
  onMessage?: (data: any) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Event) => void
}

export function useWebSocket(path: string, options: WebSocketOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const ws = new WebSocket(`${apiClient.getWsUrl()}${path}`)

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      options.onMessage?.(data)
    }

    ws.onopen = () => {
      options.onOpen?.()
    }

    ws.onclose = () => {
      options.onClose?.()
    }

    ws.onerror = (error) => {
      options.onError?.(error)
    }

    wsRef.current = ws

    return () => {
      ws.close()
    }
  }, [path, options])

  return wsRef.current
} 