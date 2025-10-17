'use client';

import { Suspense, useEffect, useState } from 'react';
import TopNavigation from '@/components/TopNavigation';
import GanttScheduler from '@/components/scheduler/GanttScheduler';
import { getSchedulerData, convertToGanttData, SchedulerData } from '@/lib/api/services/schedulerService';

export default function SchedulerPage() {
  const [schedulerData, setSchedulerData] = useState<SchedulerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching scheduler data...');
        const data = await getSchedulerData();
        console.log('📊 Scheduler data received:', data);
        setSchedulerData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching scheduler data:', err);
        setError('Помилка завантаження даних планувальника');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const tasks = schedulerData ? convertToGanttData(schedulerData) : null;

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
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Завантаження даних...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-red-500 text-xl mb-4">⚠️</div>
                  <p className="text-red-600">{error}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Спробувати знову
                  </button>
                </div>
              </div>
            ) : tasks ? (
              <GanttScheduler tasks={tasks} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-gray-600">Немає даних для відображення</p>
                </div>
              </div>
            )}
          </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

