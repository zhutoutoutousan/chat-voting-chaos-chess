import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const response = await fetch(
      `${process.env.PLATFORM_API_URL}/game/${params.id}/move`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}`,
        },
        body: JSON.stringify(body),
      }
    )

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to make move:', error)
    return NextResponse.json(
      { error: 'Failed to make move' },
      { status: 500 }
    )
  }
} 