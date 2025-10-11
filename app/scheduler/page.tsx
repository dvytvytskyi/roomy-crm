'use client';

import { Suspense } from 'react';
import GanttScheduler from '@/components/scheduler/GanttScheduler';
import { getGanttData } from '@/lib/data/ganttData';

export default function SchedulerPage() {
  const tasks = getGanttData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Планувальник проєктів
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Керуйте завданнями та проєктами вашої нерухомості
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Експортувати
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              + Новий проєкт
            </button>
          </div>
        </div>
      </div>

      {/* Gantt Chart Container */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
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
  );
}

