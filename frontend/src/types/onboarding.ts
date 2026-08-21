/**
 * TypeScript types for the onboarding conversational chat API.
 * Maps to the FastAPI Pydantic models in backend/app/models/onboarding.py
 */

// ---------------------------------------------------------------------------
// 15 Learner Profile Entities
// ---------------------------------------------------------------------------

export interface ExtractedEntities {
  // 1. Education Details
  education_degree?: string | null;
  education_major?: string | null;
  graduation_year?: string | null;

  // 2. Professional Profiles
  github_url?: string | null;
  linkedin_url?: string | null;

  // 3. Industry Experience Status
  industry_experience_type?: 'fresher' | 'intern' | 'working_professional' | string | null;
  years_experience?: string | null;

  // 4. Known Tech Stack
  known_skills?: string[] | null;

  // 5. Projects Portfolio
  current_projects?: string | null;

  // 6. Past Courses & Certifications
  completed_learning?: string | null;

  // 7. Personal Interests
  technical_interests?: string[] | null;

  // 8. Target Role
  target_goal?: string | null;
  job_specialization?: string | null;

  // 9. Target Timeline
  target_completion_months?: string | null;

  // 10. Target Benchmark / Salary
  salary_placement_goal?: string | null;

  // 11. Weekly Commitment
  weekly_hours?: number | null;

  // 12. Learning Format Preference
  learning_preferences?: string[] | null;

  // 13. Budget Constraints
  resource_budget?: string | null;

  // 14. Immediate Motivation / Trigger
  immediate_motivation?: string | null;

  // 15. Language Preference
  language_preference?: string | null;

  // Derived
  experience_level?: 'beginner' | 'intermediate' | 'advanced' | string | null;
}

// ---------------------------------------------------------------------------
// Chat Message (for conversation history)
// ---------------------------------------------------------------------------

export interface ChatMessagePayload {
  role: 'user' | 'assistant';
  content: string;
}

// ---------------------------------------------------------------------------
// API Request / Response — POST /api/v1/onboarding/chat
// ---------------------------------------------------------------------------

export interface OnboardingChatRequest {
  conversation_history: ChatMessagePayload[];
  extracted_entities: Record<string, unknown>;
}

export interface OnboardingChatResponse {
  assistant_message: string;
  quick_reply_chips: string[];
  extracted_entities: Record<string, unknown>;
  completed_categories: string[];
  is_profile_complete: boolean;
}

// ---------------------------------------------------------------------------
// API Request / Response — POST /api/v1/profile/save
// ---------------------------------------------------------------------------

export interface ProfileSaveRequest {
  profile_metadata: Record<string, unknown>;
  completed_categories: string[];
}

export interface ProfileSaveResponse {
  success: boolean;
  message: string;
}

// ---------------------------------------------------------------------------
// UI Chat Message (extended for rendering)
// ---------------------------------------------------------------------------

export interface OnboardingChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  quickReplyChips?: string[];
  extractedChips?: { label: string; value: string; type: string }[];
  isCompletePrompt?: boolean;
}
