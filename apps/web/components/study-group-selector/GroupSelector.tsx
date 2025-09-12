'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { University, Department, Semester } from '../../app/types';
import * as api from '../../app/lib/api';
import { Select } from '../ui/select';
import { Button } from '../ui/button';

export function GroupSelector() {
  const router = useRouter();
  
  // State for the lists of options
  const [universities, setUniversities] = useState<University[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  // CORRECTED: The state now matches the format needed by the Select component
  const [semesters, setSemesters] = useState<{ id: string; name: string | number }[]>([]);

  // State for the user's selections
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  
  // State for loading and errors
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial universities on component mount
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setIsLoading(true);
        const data = await api.getUniversities();
        setUniversities(data);
        setError(null);
      } catch (err) {
        setError("Could not load universities. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUniversities();
  }, []);

  // Fetch departments when a university is selected
  useEffect(() => {
    if (selectedUniversity) {
      const fetchDepartments = async () => {
        try {
          setIsLoading(true);
          const data = await api.getDepartments(selectedUniversity);
          setDepartments(data);
          setSelectedDepartment(''); 
          setSemesters([]);
          setSelectedSemester('');
          setError(null);
        } catch (err) {
          setError("Could not load departments.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchDepartments();
    }
  }, [selectedUniversity]);

  // Fetch semesters when a department is selected
   useEffect(() => {
    if (selectedDepartment) {
      const fetchSemesters = async () => {
        try {
          setIsLoading(true);
          // This fetches data with type: Semester[]
          const data: Semester[] = await api.getSemesters(selectedDepartment);
          // We format it to match the state and the Select component's needs
          const formattedSemesters = data.map(s => ({ id: s.id, name: `Semester ${s.number}` }));
          // This is now type-safe
          setSemesters(formattedSemesters);
          setSelectedSemester('');
          setError(null);
        } catch (err) {
          setError("Could not load semesters.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchSemesters();
    }
  }, [selectedDepartment]);


  const handleJoinRoom = async () => {
    if (!selectedSemester) {
      setError("Please select a semester to join.");
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const room = await api.joinSemesterRoom(selectedSemester);
      router.push(`/rooms/${room.id}`); // Navigate to the chat room
    } catch (err) {
      setError("Failed to join the room. You may already be a member or an error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center text-white">Join Your Study Group</h2>
      {error && <p className="text-red-400 text-center">{error}</p>}
      
      <Select
        label="University"
        options={universities}
        value={selectedUniversity}
        onChange={(e) => setSelectedUniversity(e.target.value)}
        placeholder="Select a university"
        disabled={isLoading || universities.length === 0}
      />
      
      {selectedUniversity && (
        <Select
          label="Department"
          options={departments}
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          placeholder="Select a department"
          disabled={isLoading || departments.length === 0}
        />
      )}

      {selectedDepartment && (
         <Select
          label="Semester"
          // This now receives the correctly typed data
          options={semesters}
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          placeholder="Select a semester"
          disabled={isLoading || semesters.length === 0}
        />
      )}

      <Button 
        onClick={handleJoinRoom} 
        disabled={!selectedSemester || isLoading}
        className="w-full"
      >
        {isLoading ? 'Joining...' : 'Join Room'}
      </Button>
    </div>
  );
}

