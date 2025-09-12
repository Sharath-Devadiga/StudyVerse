'use client';

import { useEffect } from 'react';
import { useUserStore } from '../../../stores/useUserStore';
import { OnboardingFlow } from '../../../components/features/onboarding/onBoardingFlow';
import { Dashboard } from '../../../components/features/dashboard/Dashboard';
import { AnimatePresence, motion } from 'framer-motion';

export default function MainPage() {
  const { user, isLoading, fetchUser } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        Loading Your StudyVerse...
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {user && !user.department ? (
        <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <OnboardingFlow />
        </motion.div>
      ) : (
        <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Dashboard />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
