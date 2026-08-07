import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface RoomParticipant {
  uid: string
  displayName: string
  joinedAt: Timestamp
  lastSeenAt: Timestamp
  isMuted: boolean
  isVideoOff: boolean
}

export type RoomSignalType = 'offer' | 'answer' | 'candidate'

export interface RoomSignal {
  id: string
  senderId: string
  recipientId: string
  type: RoomSignalType
  payload: RTCSessionDescriptionInit | RTCIceCandidateInit
  createdAt: Timestamp
}

export interface LiveChatMessage {
  id: string
  uid: string
  displayName: string
  message: string
  createdAt: Timestamp
}

function roomCollection(classId: string, child: 'roomParticipants' | 'signals' | 'messages') {
  return collection(db, 'liveClasses', classId, child)
}

export function subscribeToRoomParticipants(
  classId: string,
  callback: (participants: RoomParticipant[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    roomCollection(classId, 'roomParticipants'),
    (snapshot) => callback(snapshot.docs.map((item) => item.data() as RoomParticipant)),
    (error) => onError?.(error as Error)
  )
}

export function subscribeToRoomSignals(
  classId: string,
  recipientId: string,
  callback: (signal: RoomSignal) => void,
  onError?: (error: Error) => void
) {
  const signalsQuery = query(
    roomCollection(classId, 'signals'),
    where('recipientId', '==', recipientId)
  )
  return onSnapshot(
    signalsQuery,
    (snapshot) =>
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          callback({ id: change.doc.id, ...(change.doc.data() as Omit<RoomSignal, 'id'>) })
        }
      }),
    (error) => onError?.(error as Error)
  )
}

export function subscribeToRoomMessages(
  classId: string,
  callback: (messages: LiveChatMessage[]) => void,
  onError?: (error: Error) => void
) {
  const messagesQuery = query(roomCollection(classId, 'messages'), limit(100))
  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      const messages = snapshot.docs
        .map((item) => ({ id: item.id, ...(item.data() as Omit<LiveChatMessage, 'id'>) }))
        .sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis())
      callback(messages)
    },
    (error) => onError?.(error as Error)
  )
}

export function upsertRoomParticipant(classId: string, participant: RoomParticipant) {
  return setDoc(
    doc(db, 'liveClasses', classId, 'roomParticipants', participant.uid),
    participant,
    { merge: true }
  )
}

export function removeRoomParticipant(classId: string, uid: string) {
  return deleteDoc(doc(db, 'liveClasses', classId, 'roomParticipants', uid))
}

export function sendRoomSignal(
  classId: string,
  signal: Omit<RoomSignal, 'id' | 'createdAt'>
) {
  return addDoc(roomCollection(classId, 'signals'), {
    ...signal,
    createdAt: Timestamp.now(),
  })
}

export function removeRoomSignal(classId: string, signalId: string) {
  return deleteDoc(doc(db, 'liveClasses', classId, 'signals', signalId))
}

export function sendRoomMessage(
  classId: string,
  message: Omit<LiveChatMessage, 'id' | 'createdAt'>
) {
  return addDoc(roomCollection(classId, 'messages'), {
    ...message,
    createdAt: Timestamp.now(),
  })
}

