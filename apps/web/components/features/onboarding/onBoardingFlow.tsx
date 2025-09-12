'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '../../../stores/useUserStore';
import * as api from '../../../app/lib/api';
import { Select } from '../../../components/ui/select';
import { Button } from '../../../components/ui/button';
import { University, Department } from '../../../app/types';
import { motion } from 'framer-motion';

export function OnboardingFlow() {
  const { fetchUser } = useUserStore();

  // State for the lists of options
  const [universities, setUniversities] = useState<University[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // State for the user's selections
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // State for loading and errors
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- THIS IS THE MISSING LOGIC ---
  // Fetch initial universities on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const univData = await api.getUniversities();
        setUniversities(univData);
      } catch (err) {
        console.error(err);
        setError('Could not load universities. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch departments when a university is selected
  useEffect(() => {
    if (selectedUniversity) {
      const fetchDepartments = async () => {
        setIsLoading(true);
        setError(null);
        // Reset selections when university changes
        setDepartments([]);
        setSelectedDepartment('');
        try {
          const deptData = await api.getDepartments(selectedUniversity);
          setDepartments(deptData);
        } catch (err) {
          console.error(err);
          setError('Could not load departments for this university.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchDepartments();
    }
  }, [selectedUniversity]);

  const handleSaveChoice = async () => {
    if (!selectedDepartment) return;
    setIsLoading(true);
    setError(null);
    try {
      // Save the user's choice to the backend
      await api.updateUserProfile(selectedDepartment);
      // Re-fetch the user data in our global store. This will cause the
      // main page to automatically switch from Onboarding to the Dashboard.
      await fetchUser();
    } catch (err) {
      setError("Failed to save selection. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg p-8 space-y-6 bg-gray-800 rounded-xl shadow-2xl"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Welcome to StudyVerse!</h1>
          <p className="text-gray-400 mt-2">Let's set up your academic profile. This can't be changed later.</p>
        </div>
        
        {error && <p className="text-red-400 text-center text-sm">{error}</p>}

        <div className="space-y-4">
          <Select
            label="University"
            options={universities}
            value={selectedUniversity}
            onChange={(e) => setSelectedUniversity(e.target.value)}
            placeholder="Select your university"
            disabled={isLoading || universities.length === 0}
          />

          {selectedUniversity && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Select
                label="Department"
                options={departments}
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                placeholder="Select your department"
                disabled={isLoading || departments.length === 0}
              />
            </motion.div>
          )}
        </div>

        <Button onClick={handleSaveChoice} disabled={!selectedDepartment || isLoading} className="w-full !mt-8">
          {isLoading ? 'Saving...' : 'Confirm and Enter'}
        </Button>
      </motion.div>
    </div>
  );
}

