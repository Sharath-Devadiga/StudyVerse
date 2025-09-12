'use client';

import { useState } from 'react';
import { useUserStore } from '../../../stores/useUserStore';
import { SemesterList } from './SemesterList';
import { ChatContainer } from './ChatContainer';

export function Dashboard() {
  const { user } = useUserStore();
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);

  if (!user || !user.department) {
    // This should ideally not be seen due to the gatekeeper page
    return <div>Loading user data...</div>;
  }
  
  const { department } = user;

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left Column: Chat Area */}
      <main className="flex-1 flex flex-col">
        <header className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">{department.university.name}</h1>
          <p className="text-sm text-gray-400">{department.name}</p>
        </header>
        <div className="flex-1 p-4 overflow-y-auto">
          <ChatContainer semesterId={selectedSemesterId} />
        </div>
      </main>

      {/* Right Column: Semester Selection */}
      <aside className="w-64 bg-gray-800 border-l border-gray-700">
        <SemesterList 
          departmentId={department.id} 
          onSelectSemester={setSelectedSemesterId} 
          selectedSemesterId={selectedSemesterId}
        />
      </aside>
    </div>
  );
}
