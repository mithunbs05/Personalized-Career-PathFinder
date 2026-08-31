/**
 * API client for the FastAPI onboarding endpoints.
 *
 * Communicates with:
 *  - POST /api/v1/onboarding/chat — conversational turn
 *  - POST /api/v1/profile/save   — persist final profile
 */

import type {
  OnboardingChatRequest,
  OnboardingChatResponse,
  ProfileSaveRequest,
  ProfileSaveResponse,
} from '../types/onboarding';

// Bypass Vite/Express proxy in dev to avoid express.json() hanging POST requests
const FASTAPI_BASE = import.meta.env.DEV ? 'http://localhost:8000/api/v1' : '/api/v1';

/** Timeout for API calls in milliseconds */
const REQUEST_TIMEOUT_MS = 60_000;

/**
 * Custom fetch wrapper with timeout and error handling.
 */
async function fetchWithTimeout<T>(
  url: string,
  options: RequestInit,
  timeoutMs: number = REQUEST_TIMEOUT_MS
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      let errorData: Record<string, unknown> = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: response.statusText };
      }
      throw new OnboardingApiError(
        response.status,
        (errorData.detail as string) || `HTTP Error ${response.status}`,
        errorData
      );
    }

    return (await response.json()) as T;
  } catch (err) {
    if (err instanceof OnboardingApiError) throw err;
    if ((err as Error).name === 'AbortError') {
      throw new OnboardingApiError(
        408,
        'Request timed out. The AI service may be slow — please try again.',
        { timeout: true }
      );
    }
    throw new OnboardingApiError(
      0,
      (err as Error).message || 'Network error. Please check your connection.',
      { network: true }
    );
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Custom error class for onboarding API errors.
 */
export class OnboardingApiError extends Error {
  status: number;
  data: Record<string, unknown>;

  constructor(status: number, message: string, data?: Record<string, unknown>) {
    super(message);
    this.name = 'OnboardingApiError';
    this.status = status;
    this.data = data || {};
  }
}

/**
 * Onboarding service for communicating with the FastAPI backend.
 */
export const onboardingService = {
  /**
   * Send a conversational onboarding turn to the backend.
   * Returns the assistant's reply, updated entities, and completion status.
   */
  async sendChat(request: OnboardingChatRequest): Promise<OnboardingChatResponse> {
    return fetchWithTimeout<OnboardingChatResponse>(
      `${FASTAPI_BASE}/onboarding/chat`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      }
    );
  },

  /**
   * Save the completed profile to Supabase via the backend.
   * Requires a valid Supabase auth token.
   */
  async saveProfile(
    request: ProfileSaveRequest,
    authToken: string
  ): Promise<ProfileSaveResponse> {
    return fetchWithTimeout<ProfileSaveResponse>(
      `${FASTAPI_BASE}/profile/save`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(request),
      }
    );
  },
};
