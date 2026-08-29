import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowIncompleteOnboarding?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowIncompleteOnboarding = false,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] dark:bg-[#111113]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-stone-300 border-t-[#FF4D36] rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-stone-500 tracking-wide">Syncing PathAI session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!user.onboardingCompleted && !allowIncompleteOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
