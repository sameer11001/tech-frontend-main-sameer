
export interface Conversation {
  id: string;
  contact_name: string;
  contact_phone_number: string;
  country_code_phone_number: string;
  updated_at: string;
  contact_id: string;
  client_id: string;
  created_at: string;
  status: 'open' | 'solved' | 'pending' | string;
  assignments_id: string;
  last_message: string;
  last_message_time: string;
  conversation_expiration_time: string;
  conversation_is_expired: boolean;
}

export interface Meta {
  total_items: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  has_next: boolean;
  has_prev: boolean;
  next_page: number | null;
  prev_page: number | null;
}

export interface ConversationsResponse {
  data: Conversation[];
  meta: Meta;
}
