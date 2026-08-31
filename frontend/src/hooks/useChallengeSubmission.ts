import { useState } from "react";
import { submitChallengeCode, SubmissionResult } from "../api/challenges.api";

export function useChallengeSubmission(onSuccess?: (result: SubmissionResult) => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (challengeId: string, code: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await submitChallengeCode(challengeId, code);
      setSubmissionResult(res);
      if (onSuccess) {
        onSuccess(res);
      }
      return res;
    } catch (err: any) {
      setError(err.message || "Failed to submit challenge");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, submissionResult, error, submit, setSubmissionResult };
}
