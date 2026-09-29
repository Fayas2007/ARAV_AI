// types/index.ts – Shared TypeScript types for ARAV AI mobile app

export interface User {
  id: string;
  full_name: string;
  mobile_number: string;
  email?: string;
  state?: string;
  district?: string;
  preferred_language: string;
  cooperative_society?: string;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface SourceCitation {
  title: string;
  url?: string;
  category?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceCitation[];
  language: string;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  title?: string;
  language: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChatConversationDetail {
  id: string;
  title?: string;
  language: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface ChatResponse {
  conversation_id: string;
  message_id: string;
  content: string;
  sources: SourceCitation[];
  language: string;
  created_at: string;
}

export interface Scheme {
  id: string;
  name: string;
  category?: string;
  description?: string;
  eligibility?: string;
  benefits?: string;
  required_documents?: string[];
  application_procedure?: string;
  official_url?: string;
  applicable_state?: string;
  ministry?: string;
  is_active: boolean;
  verified_at?: string;
  source?: string;
}

export interface Society {
  id: string;
  name: string;
  society_type?: string;
  registration_number?: string;
  district?: string;
  state?: string;
  address?: string;
  phone?: string;
  email?: string;
  services?: string[];
  is_verified: boolean;
  verification_source?: string;
  verified_at?: string;
}

export interface StatusHistory {
  status: string;
  notes?: string;
  changed_by?: string;
  created_at: string;
}

export interface Application {
  id: string;
  reference_number: string;
  application_type: string;
  title: string;
  status: string;
  form_data?: Record<string, any>;
  submitted_at: string;
  history: StatusHistory[];
}

export interface DocumentRequest {
  id: string;
  reference_number: string;
  document_type: string;
  description?: string;
  status: string;
  notes?: string;
  requested_at: string;
  ready_at?: string;
}

export interface GrievanceStatus {
  status: string;
  notes?: string;
  created_at: string;
}

export interface Grievance {
  id: string;
  reference_number: string;
  category: string;
  subject: string;
  description: string;
  related_society?: string;
  status: string;
  submitted_at: string;
  history: GrievanceStatus[];
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  notification_type: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

export type Language = 'en' | 'hi' | 'ta' | 'te';

export const LANGUAGES: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
];
