import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { InterestsModal } from './InterestsModal';
import api from '../utils/api';

export function InterestsModalWrapper({ children }: { children: React.ReactNode }) {
  const { user, checkAuthStatus } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const checkInterests = async () => {
      // Reset hasChecked when user changes (e.g., logout/login)
      if (!user) {
        setHasChecked(false);
        setShowModal(false);
        return;
      }

      if (hasChecked) return;

      // Small delay to ensure user data is fully loaded
      await new Promise(resolve => setTimeout(resolve, 500));

      // Only show modal for job seekers who haven't selected interests
      if (user.role === 'job_seeker') {
        // Always fetch fresh user data to ensure we have the latest interests_selected status
        try {
          const response = await api.get('/auth/me');
          const userData = response.data;
          
          // Show modal if user is a job seeker and hasn't selected interests
          if (userData.role === 'job_seeker' && !userData.interests_selected) {
            setShowModal(true);
          }
        } catch (error) {
          console.error('Failed to check user interests:', error);
        }
      }
      
      setHasChecked(true);
    };

    checkInterests();
  }, [user, hasChecked]);

  const handleClose = () => {
    // Modal cannot be closed - interests selection is mandatory
    // Only close after saving
  };

  const handleSave = async () => {
    // Refresh user data after saving interests
    await checkAuthStatus();
    setShowModal(false);
    // Don't reset hasChecked here since interests are now saved
  };

  return (
    <>
      {children}
      <InterestsModal
        isOpen={showModal}
        onClose={handleClose}
        onSave={handleSave}
      />
    </>
  );
}

