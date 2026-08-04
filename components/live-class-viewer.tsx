'use client'

import { useState, useEffect } from 'react'
import { Users, MessageSquare, Send, Phone, PhoneOff, Maximize2 } from 'lucide-react'
import { Button } from './ui/button'

interface LiveClassViewerProps {
  classId: string
  title: string
  instructor: string
  liveUrl?: string
  attendees: number
}

interface ChatMessage {
  id: string
  user: string
  message: string
  timestamp: Date
}

export function LiveClassViewer({
  classId,
  title,
  instructor,
  liveUrl,
  attendees,
}: LiveClassViewerProps) {
  const [isJoined, setIsJoined] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      user: 'Instructor',
      message: 'Welcome to the live class! Feel free to ask questions in the chat.',
      timestamp: new Date(Date.now() - 5 * 60000),
    },
  ])
  const [newMessage, setNewMessage] = useState('')
  const [participantCount, setParticipantCount] = useState(attendees)

  useEffect(() => {
    // Simulate real-time attendee count updates
    if (isJoined) {
      const timer = setInterval(() => {
        setParticipantCount((prev) => {
          // Randomly add or remove participants
          const change = Math.random() > 0.5 ? 1 : -1
          return Math.max(1, prev + change)
        })
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [isJoined])

  const handleJoin = () => {
    setIsJoined(true)
    // In a real app, this would initialize WebRTC or join a video conference
    console.log('[v0] User joined live class:', classId)
  }

  const handleLeave = () => {
    setIsJoined(false)
    console.log('[v0] User left live class:', classId)
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        user: 'You',
        message: newMessage,
        timestamp: new Date(),
      }
      setMessages([...messages, message])
      setNewMessage('')
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!isJoined) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-8 flex flex-col items-center justify-center min-h-96 text-center">
        <div className="mb-6">
          <Users className="size-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Live Class Ready</h3>
          <p className="text-slate-300 mb-4">{title}</p>
          <p className="text-slate-400 text-sm mb-4">Instructor: {instructor}</p>
          <p className="text-blue-400 font-semibold">{participantCount} people in class</p>
        </div>
        <Button onClick={handleJoin} size="lg" className="bg-blue-600 hover:bg-blue-700">
          Join Live Class
        </Button>
      </div>
    )
  }

  return (
    <div className="flex gap-4 h-full">
      {/* Main video area */}
      <div className="flex-1 flex flex-col">
        <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden aspect-video flex items-center justify-center mb-4">
          {/* Mock video feed */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 to-slate-900/50 flex items-center justify-center">
            <div className="text-center">
              <Users className="size-24 text-blue-400/50 mx-auto mb-4" />
              <p className="text-slate-300">Live class stream</p>
              <p className="text-slate-400 text-sm mt-2">{participantCount} participants</p>
            </div>
          </div>

          {/* Participant avatars */}
          <div className="absolute top-4 right-4 flex gap-2">
            {[...Array(Math.min(participantCount, 4))].map((_, i) => (
              <div
                key={i}
                className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
              >
                P{i + 1}
              </div>
            ))}
          </div>

          {/* Controls overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
            <Button
              onClick={() => setIsMuted(!isMuted)}
              variant={isMuted ? 'destructive' : 'secondary'}
              size="sm"
            >
              {isMuted ? 'Unmute' : 'Mute'}
            </Button>
            <Button
              onClick={() => setIsVideoOff(!isVideoOff)}
              variant={isVideoOff ? 'destructive' : 'secondary'}
              size="sm"
            >
              {isVideoOff ? 'Start Video' : 'Stop Video'}
            </Button>
            <Button onClick={handleLeave} variant="destructive" size="sm">
              <PhoneOff className="size-4 mr-2" />
              Leave
            </Button>
          </div>
        </div>

        {/* Class info */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">Instructor: {instructor}</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Users className="size-4" />
            {participantCount} online
          </div>
        </div>
      </div>

      {/* Chat sidebar */}
      <div className="w-80 bg-slate-50 dark:bg-slate-900 rounded-lg flex flex-col border border-border">
        {/* Chat header */}
        <div className="p-4 border-b border-border flex items-center gap-2">
          <MessageSquare className="size-5" />
          <h3 className="font-semibold">Live Chat</h3>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground">{msg.user}</span>
                <span className="text-xs text-muted-foreground">{formatTime(msg.timestamp)}</span>
              </div>
              <p className="text-sm text-foreground break-words">{msg.message}</p>
            </div>
          ))}
        </div>

        {/* Message input */}
        <div className="p-4 border-t border-border flex gap-2">
          <input
            type="text"
            placeholder="Send a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSendMessage()
            }}
            className="flex-1 px-3 py-2 rounded bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleSendMessage}
            className="p-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            aria-label="Send message"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
