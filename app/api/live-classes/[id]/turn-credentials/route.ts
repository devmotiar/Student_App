import { createHmac } from 'crypto'
import { NextResponse } from 'next/server'
import { getAdminAuth } from '@/lib/firebase-admin'

export async function GET(request: Request) {
  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    const decodedToken = await getAdminAuth().verifyIdToken(authorization.slice(7))
    const turnUrl = process.env.TURN_SERVER_URL
    const sharedSecret = process.env.TURN_SHARED_SECRET

    if (!turnUrl || !sharedSecret) {
      return NextResponse.json({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        turnConfigured: false,
      })
    }

    const ttl = Math.max(300, Number(process.env.TURN_CREDENTIAL_TTL_SECONDS) || 3600)
    const expiry = Math.floor(Date.now() / 1000) + ttl
    const username = `${expiry}:${decodedToken.uid}`
    const credential = createHmac('sha1', sharedSecret).update(username).digest('base64')

    return NextResponse.json({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: turnUrl, username, credential },
      ],
      turnConfigured: true,
    })
  } catch (error) {
    console.error('[turn-credentials] Failed to verify Firebase token:', error)
    return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 })
  }
}

