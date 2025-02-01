import { useEffect, useRef, useState } from 'react'
import { useUser } from '@clerk/nextjs'

interface MatchmakingState {
  status: 'idle' | 'searching' | 'found' | 'error'
  match?: {
    gameId: string
    players: any[]
    startTime: string
  }
}

export function useMatchmaking() {
  const { user } = useUser()
  const [state, setState] = useState<MatchmakingState>({ status: 'idle' })
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!user) return

    ws.current = new WebSocket('ws://localhost:8080')
    
    ws.current.onopen = () => {
      console.log('Connected to matchmaking server')
    }

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      switch (data.type) {
        case 'matchmaking_status':
          setState(prev => ({ ...prev, status: data.payload.status }))
          break
        case 'match_found':
          setState({ status: 'found', match: data.payload })
          break
      }
    }

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error)
      setState(prev => ({ ...prev, status: 'error' }))
    }

    return () => {
      ws.current?.close()
    }
  }, [user])

  const findMatch = () => {
    if (!ws.current || !user) return
    
    ws.current.send(JSON.stringify({
      type: 'find_match',
      payload: {
        user: {
          id: user.id,
          name: user.fullName,
          rating: 1500 // Default rating
        }
      }
    }))
    setState(prev => ({ ...prev, status: 'searching' }))
  }

  const cancelSearch = () => {
    if (!ws.current) return
    
    ws.current.send(JSON.stringify({
      type: 'cancel_matchmaking',
      payload: {}
    }))
    setState(prev => ({ ...prev, status: 'idle' }))
  }

  return {
    state,
    findMatch,
    cancelSearch
  }
} 