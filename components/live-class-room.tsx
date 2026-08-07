'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  Loader2,
  MessageSquare,
  Mic,
  MicOff,
  Send,
  Users,
  Video,
  VideoOff,
  Wifi,
} from 'lucide-react'

import { auth } from '@/lib/firebase'
import { Timestamp } from 'firebase/firestore'
import {
  removeRoomParticipant,
  removeRoomSignal,
  RoomParticipant,
  sendRoomMessage,
  sendRoomSignal,
  subscribeToRoomMessages,
  subscribeToRoomParticipants,
  subscribeToRoomSignals,
  upsertRoomParticipant,
  type LiveChatMessage,
} from '@/lib/firebase-live-room'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const MAX_PARTICIPANTS = 8
const PRESENCE_TIMEOUT_MS = 45_000

interface LiveClassRoomProps {
  classId: string
  userId: string
  displayName: string
}

function VideoTile({
  stream,
  label,
  muted = false,
}: {
  stream: MediaStream
  label: string
  muted?: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const videoElement = videoRef.current
    if (videoElement) videoElement.srcObject = stream
    return () => {
      if (videoElement) videoElement.srcObject = null
    }
  }, [stream])

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
      <video ref={videoRef} autoPlay playsInline muted={muted} className="h-full w-full object-cover" />
      <span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white">
        {label}
      </span>
    </div>
  )
}

function isFresh(participant: RoomParticipant) {
  return Date.now() - participant.lastSeenAt.toMillis() < PRESENCE_TIMEOUT_MS
}

export function LiveClassRoom({ classId, userId, displayName }: LiveClassRoomProps) {
  const [roomState, setRoomState] = useState<'joining' | 'connected' | 'error'>('joining')
  const [error, setError] = useState('')
  const [participants, setParticipants] = useState<RoomParticipant[]>([])
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({})
  const [messages, setMessages] = useState<LiveChatMessage[]>([])
  const [messageText, setMessageText] = useState('')
  const [isMuted, setIsMuted] = useState(true)
  const [isVideoOff, setIsVideoOff] = useState(true)
  const isMutedRef = useRef(true)
  const isVideoOffRef = useRef(true)

  const localStreamRef = useRef<MediaStream | null>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const peersRef = useRef(new Map<string, RTCPeerConnection>())
  const participantsRef = useRef<RoomParticipant[]>([])
  const initializedPeersRef = useRef(new Set<string>())

  const sendSignal = useCallback(
    (recipientId: string, type: 'offer' | 'answer' | 'candidate', payload: RTCSessionDescriptionInit | RTCIceCandidateInit) =>
      sendRoomSignal(classId, { senderId: userId, recipientId, type, payload }),
    [classId, userId]
  )

  const closePeer = useCallback((remoteId: string) => {
    const peer = peersRef.current.get(remoteId)
    peer?.close()
    peersRef.current.delete(remoteId)
    initializedPeersRef.current.delete(remoteId)
    setRemoteStreams((current) => {
      if (!current[remoteId]) return current
      const next = { ...current }
      delete next[remoteId]
      return next
    })
  }, [])

  const ensurePeer = useCallback(
    async (remoteId: string, initiator: boolean, iceServers: RTCIceServer[]) => {
      const existing = peersRef.current.get(remoteId)
      if (existing) return existing

      const peer = new RTCPeerConnection({ iceServers })
      peersRef.current.set(remoteId, peer)
      initializedPeersRef.current.add(remoteId)

      localStreamRef.current?.getTracks().forEach((track) => peer.addTrack(track, localStreamRef.current!))
      peer.onicecandidate = (event) => {
        if (event.candidate) {
          void sendSignal(remoteId, 'candidate', event.candidate.toJSON())
        }
      }
      peer.ontrack = (event) => {
        const stream = event.streams[0]
        if (stream) setRemoteStreams((current) => ({ ...current, [remoteId]: stream }))
      }
      peer.onconnectionstatechange = () => {
        if (['failed', 'closed', 'disconnected'].includes(peer.connectionState)) {
          closePeer(remoteId)
        }
      }

      if (initiator) {
        const offer = await peer.createOffer()
        await peer.setLocalDescription(offer)
        await sendSignal(remoteId, 'offer', offer)
      }

      return peer
    },
    [closePeer, sendSignal]
  )

  useEffect(() => {
    let disposed = false
    let unsubscribeParticipants: (() => void) | undefined
    let unsubscribeSignals: (() => void) | undefined
    let unsubscribeMessages: (() => void) | undefined
    let heartbeat: ReturnType<typeof setInterval> | undefined

    const setup = async () => {
      try {
        const currentUser = auth.currentUser
        const token = await currentUser?.getIdToken()
        const turnResponse = await fetch(`/api/live-classes/${classId}/turn-credentials`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        const turnConfig = turnResponse.ok ? await turnResponse.json() : null
        const iceServers: RTCIceServer[] = turnConfig?.iceServers || [
          { urls: 'stun:stun.l.google.com:19302' },
        ]

        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        if (disposed) {
          localStream.getTracks().forEach((track) => track.stop())
          return
        }
        localStreamRef.current = localStream
        setLocalStream(localStream)
        if (localVideoRef.current) localVideoRef.current.srcObject = localStream

        const now = Timestamp.now()
        const participant: RoomParticipant = {
          uid: userId,
          displayName,
          joinedAt: now,
          lastSeenAt: now,
          isMuted: true,
          isVideoOff: true,
        }
        await upsertRoomParticipant(classId, participant)

        unsubscribeParticipants = subscribeToRoomParticipants(classId, (nextParticipants) => {
          const freshParticipants = nextParticipants.filter(isFresh)
          const previousParticipants = participantsRef.current
          participantsRef.current = freshParticipants
          setParticipants(freshParticipants)

          if (freshParticipants.length > MAX_PARTICIPANTS) {
            setError(`This room is full. It supports up to ${MAX_PARTICIPANTS} participants.`)
            setRoomState('error')
            return
          }

          for (const remote of freshParticipants) {
            if (remote.uid === userId || peersRef.current.has(remote.uid)) continue
            void ensurePeer(remote.uid, userId < remote.uid, iceServers)
          }

          for (const remote of previousParticipants) {
            if (remote.uid !== userId && !freshParticipants.some((item) => item.uid === remote.uid)) {
              closePeer(remote.uid)
            }
          }
        }, (listenerError) => setError(listenerError.message))

        unsubscribeSignals = subscribeToRoomSignals(classId, userId, async (signal) => {
          try {
            const peer = await ensurePeer(signal.senderId, false, iceServers)
            if (signal.type === 'offer') {
              await peer.setRemoteDescription(signal.payload as RTCSessionDescriptionInit)
              const answer = await peer.createAnswer()
              await peer.setLocalDescription(answer)
              await sendSignal(signal.senderId, 'answer', answer)
            } else if (signal.type === 'answer') {
              await peer.setRemoteDescription(signal.payload as RTCSessionDescriptionInit)
            } else {
              await peer.addIceCandidate(signal.payload as RTCIceCandidateInit)
            }
          } catch (signalError) {
            console.error('[live-room] Signal processing failed:', signalError)
          } finally {
            await removeRoomSignal(classId, signal.id).catch(() => undefined)
          }
        }, (listenerError) => setError(listenerError.message))

        unsubscribeMessages = subscribeToRoomMessages(classId, setMessages, (listenerError) =>
          setError(listenerError.message)
        )

        heartbeat = setInterval(() => {
          void upsertRoomParticipant(classId, {
            ...participant,
            lastSeenAt: Timestamp.now(),
            isMuted: isMutedRef.current,
            isVideoOff: isVideoOffRef.current,
          })
        }, 15_000)
        setRoomState('connected')
      } catch (setupError) {
        console.error('[live-room] Failed to join:', setupError)
        setError(
          setupError instanceof DOMException && setupError.name === 'NotAllowedError'
            ? 'Camera and microphone permission is required to enter the live room.'
            : setupError instanceof Error
              ? setupError.message
              : 'Unable to join the live room.'
        )
        setRoomState('error')
      }
    }

    void setup()

    const peerConnections = peersRef.current

    return () => {
      disposed = true
      if (heartbeat) clearInterval(heartbeat)
      unsubscribeParticipants?.()
      unsubscribeSignals?.()
      unsubscribeMessages?.()
      peerConnections.forEach((peer) => peer.close())
      peerConnections.clear()
      localStreamRef.current?.getTracks().forEach((track) => track.stop())
      setLocalStream(null)
      void removeRoomParticipant(classId, userId).catch(() => undefined)
    }
  }, [classId, closePeer, displayName, ensurePeer, sendSignal, userId])

  const activeParticipants = useMemo(
    () => participants.filter(isFresh),
    [participants]
  )

  const updateMediaState = async (muted: boolean, videoOff: boolean) => {
    const now = Timestamp.now()
    await upsertRoomParticipant(classId, {
      uid: userId,
      displayName,
      joinedAt: now,
      lastSeenAt: now,
      isMuted: muted,
      isVideoOff: videoOff,
    })
  }

  const toggleMute = () => {
    const next = !isMuted
    isMutedRef.current = next
    localStreamRef.current?.getAudioTracks().forEach((track) => (track.enabled = !next))
    setIsMuted(next)
    void updateMediaState(next, isVideoOff)
  }

  const toggleVideo = () => {
    const next = !isVideoOff
    isVideoOffRef.current = next
    localStreamRef.current?.getVideoTracks().forEach((track) => (track.enabled = !next))
    setIsVideoOff(next)
    void updateMediaState(isMuted, next)
  }

  const submitMessage = async (event: React.FormEvent) => {
    event.preventDefault()
    const message = messageText.trim()
    if (!message) return
    setMessageText('')
    await sendRoomMessage(classId, { uid: userId, displayName, message }).catch((sendError) => {
      setError(sendError instanceof Error ? sendError.message : 'Message could not be sent.')
    })
  }

  if (roomState === 'joining') {
    return (
      <Card className="flex min-h-[420px] items-center justify-center rounded-3xl border-red-500/30 bg-slate-950 p-8 text-center text-white">
        <div>
          <Loader2 className="mx-auto size-10 animate-spin text-red-400" />
          <p className="mt-4 text-sm text-slate-300">Connecting to the live room…</p>
        </div>
      </Card>
    )
  }

  if (roomState === 'error') {
    return (
      <Card className="rounded-3xl border-red-500/30 bg-red-950/20 p-8 text-center">
        <AlertCircle className="mx-auto size-10 text-red-500" />
        <h3 className="mt-3 text-lg font-bold text-foreground">Unable to join live room</h3>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="overflow-hidden rounded-3xl border-red-500/40 bg-slate-950 p-4 text-white shadow-xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-red-600/90 px-3 py-1 text-xs font-bold">
            <span className="size-2 animate-pulse rounded-full bg-white" /> LIVE ROOM
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-300">
            <Users className="size-3.5 text-red-400" /> {activeParticipants.length}/{MAX_PARTICIPANTS}
          </span>
        </div>

        {error && (
          <div className="mb-3 flex items-center gap-2 rounded-xl bg-amber-500/15 px-3 py-2 text-xs text-amber-200">
            <Wifi className="size-3.5" /> {error}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {localStream && (
            <VideoTile stream={localStream} label={`${displayName} (You)`} muted />
          )}
          {Object.entries(remoteStreams).map(([remoteId, stream]) => (
            <VideoTile
              key={remoteId}
              stream={stream}
              label={activeParticipants.find((item) => item.uid === remoteId)?.displayName || 'Participant'}
            />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button onClick={toggleMute} size="sm" variant={isMuted ? 'destructive' : 'secondary'} className="rounded-full text-xs">
            {isMuted ? <MicOff className="mr-1.5 size-3.5" /> : <Mic className="mr-1.5 size-3.5" />}
            {isMuted ? 'Unmute' : 'Mute'}
          </Button>
          <Button onClick={toggleVideo} size="sm" variant={isVideoOff ? 'destructive' : 'secondary'} className="rounded-full text-xs">
            {isVideoOff ? <VideoOff className="mr-1.5 size-3.5" /> : <Video className="mr-1.5 size-3.5" />}
            {isVideoOff ? 'Start camera' : 'Stop camera'}
          </Button>
          <span className="ml-auto text-[11px] text-slate-400">Mesh room · max {MAX_PARTICIPANTS}</span>
        </div>
      </Card>

      <Card className="flex h-[420px] flex-col rounded-3xl border-border/60 bg-card p-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-4 text-primary" />
            <h4 className="text-sm font-bold text-foreground">Live Discussion</h4>
          </div>
          <span className="text-[11px] text-muted-foreground">{messages.length} messages</span>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto py-3 text-xs">
          {messages.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">Be the first to ask a question.</p>
          ) : messages.map((message) => (
            <div key={message.id} className="rounded-2xl bg-muted/40 p-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="font-bold text-foreground">{message.displayName}</span>
                <span className="text-[10px] text-muted-foreground">
                  {message.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="break-words leading-relaxed text-foreground/90">{message.message}</p>
            </div>
          ))}
        </div>
        <form onSubmit={submitMessage} className="flex gap-2 border-t border-border/60 pt-3">
          <input
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            placeholder="Ask a question…"
            className="min-w-0 flex-1 rounded-full border border-border/60 bg-muted/30 px-3.5 py-2 text-xs outline-none focus:border-primary"
          />
          <Button type="submit" size="sm" disabled={!messageText.trim()} className="size-8 rounded-full p-0">
            <Send className="size-3.5" />
          </Button>
        </form>
      </Card>
    </div>
  )
}
