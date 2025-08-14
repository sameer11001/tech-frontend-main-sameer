// Chat System Types

export interface ChatSession {
  session: string;
}

export interface ChatUser {
  userId: string;
  business_profile_id: string;
  connected_at: string;
}

export interface BusinessGroupMember {
  user_id: string;
  joined_at: string;
}

export interface ConversationMember {
  user_id: string;
  joined_at: string;
}

export interface ChatMessage {
  id?: string;
  from: string;
  text: string;
  timestamp: number;
  conversation_id?: string;
  phone_number_id?: string;
  status?: MessageStatus;
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

export interface MessageStatusUpdate {
  conversation_id: string;
  status: MessageStatus;
  message_id: string;
  timestamp: string;
}

export interface ConversationData {
  conversation_id: string;
}

export interface BusinessGroupData {
  phone_number_id: string;
}

export interface ChatError {
  message: string;
  code?: string;
}

// Socket Event Payloads
export interface JoinConversationPayload {
  conversation_id: string;
}

export interface LeaveConversationPayload {
  conversation_id: string;
}

export interface SendMessagePayload {
  text: string;
  conversation_id?: string;
}

export interface UserTypingPayload {
  userId: string;
  conversation_id?: string;
}

export interface JoinBusinessGroupPayload {
  session?: string;
}

export interface LeaveBusinessGroupPayload {
  session?: string;
}

// Redis Keys (for reference)
export interface RedisKeys {
  socket_user_session: string;
  socket_user_id_session: string;
  conversation_room: string;
  conversation_user_session: string;
  conversation_members: string;
  business_room: string;
  business_group_user_session: string;
  business_members: string;
  session_business: string;
  business_phone_number_id: string;
} 