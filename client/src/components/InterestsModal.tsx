import React, { useState } from 'react';
import { Card } from './UI/Card';
import { Button } from './UI/Button';
import { MultiSelect } from './UI/MultiSelect';
import { industryOptions } from '../utils/options';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface InterestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function InterestsModal({ isOpen, onClose, onSave }: InterestsModalProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (selectedInterests.length === 0) {
      toast.error('Please select at least one interest');
      return;
    }

    setLoading(true);
    try {
      const response = await api.patch('/auth/update-interests', { interests: selectedInterests });
      toast.success('Interests saved successfully!');
      onSave();
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save interests';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 sm:p-6"
      onClick={(e) => {
        // Prevent closing by clicking outside - mandatory selection
        e.stopPropagation();
      }}
    >
      <Card 
        className="relative z-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Select Your Job Interests</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Required to continue</p>
          </div>

          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            To help us send you relevant job notifications, please select the industries you're interested in.
            You can update these anytime from your profile.
          </p>

          <div className="mb-4 sm:mb-6">
            <MultiSelect
              label="Job Interests"
              options={industryOptions}
              value={selectedInterests}
              onChange={setSelectedInterests}
              placeholder="Select industries you're interested in..."
              required
              maxHeight="250px"
            />
          </div>

          {selectedInterests.length === 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                <strong>Required:</strong> Please select at least one interest to continue.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <Button
              onClick={handleSave}
              disabled={loading || selectedInterests.length === 0}
              className="w-full sm:w-auto min-w-[180px]"
            >
              {loading ? 'Saving...' : 'Save Interests & Continue'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

