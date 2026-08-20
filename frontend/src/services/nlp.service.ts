import { request } from './api';
import { RegisterCredentials, UserProfile } from '../types/auth';

export interface NlpRegistrationResponse {
  extracted: {
    name?: string | null;
    email?: string | null;
    password?: string | null;
    confirmPassword?: string | null;
  };
  mergedFields: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  missingFields: string[];
  isComplete: boolean;
  clarificationNeeded?: boolean;
  botReply: string;
  suggestedReplies: string[];
}

export interface NlpProfileResponse {
  extractedProfile: Partial<UserProfile>;
  mergedProfile: UserProfile;
  botReply: string;
  suggestedReplies: string[];
  isComplete: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  extractedChips?: { label: string; value: string; type: string }[];
  suggestedReplies?: string[];
  isCompletePrompt?: boolean;
}

export const nlpService = {
  async parseRegistrationMessage(
    message: string,
    currentFields: Partial<RegisterCredentials>,
    history: { role: 'user' | 'assistant'; content: string }[] = []
  ): Promise<NlpRegistrationResponse> {
    return request<NlpRegistrationResponse>('/nlp/parse-registration', {
      method: 'POST',
      body: JSON.stringify({
        message,
        currentFields,
        history,
      }),
    });
  },

  async parseProfileMessage(
    message: string,
    currentProfile: Partial<UserProfile>,
    step?: number | string,
    history: { role: 'user' | 'assistant'; content: string }[] = []
  ): Promise<NlpProfileResponse> {
    return request<NlpProfileResponse>('/nlp/parse-profile', {
      method: 'POST',
      body: JSON.stringify({
        message,
        currentProfile,
        step,
        history,
      }),
    });
  },
};
