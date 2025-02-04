import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'

export async function POST(request: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const response = await fetch(`${process.env.PLATFORM_API_URL}/lobby`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId}`,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to create lobby:', error)
    return NextResponse.json(
      { error: 'Failed to create lobby' },
      { status: 500 }
    )
  }
} 