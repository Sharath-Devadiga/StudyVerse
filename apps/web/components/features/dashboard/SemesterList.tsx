'use client';

import { useState, useEffect } from 'react';
import * as api from '../../../app/lib/api';
import { Semester } from '../../../app/types';
import { motion } from 'framer-motion';

interface SemesterListProps {
  departmentId: string;
  onSelectSemester: (id: string) => void;
  selectedSemesterId: string | null;
}

export function SemesterList({ departmentId, onSelectSemester, selectedSemesterId }: SemesterListProps) {
  const [semesters, setSemesters] = useState<Semester[]>([]);

  useEffect(() => {
    api.getSemesters(departmentId).then(setSemesters);
  }, [departmentId]);

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Semesters</h3>
      <ul className="space-y-2">
        {semesters.map((sem, index) => (
          <motion.li 
            key={sem.id}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <button
              onClick={() => onSelectSemester(sem.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedSemesterId === sem.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Semester {sem.number}
            </button>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
