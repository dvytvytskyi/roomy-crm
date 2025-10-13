'use client';

import { Suspense } from 'react';
import TopNavigation from '@/components/TopNavigation';
import GanttScheduler from '@/components/scheduler/GanttScheduler';
import { getGanttData } from '@/lib/data/ganttData';

export default function SchedulerPage() {
  const tasks = getGanttData();

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <TopNavigation />
      
      <div className="flex-1 flex flex-col min-h-0" style={{ marginTop: '64px' }}>
        {/* Gantt Chart Container */}
        <div className="p-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Завантаження планувальника...</p>
              </div>
            </div>
          }>
            <GanttScheduler tasks={tasks} />
          </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

