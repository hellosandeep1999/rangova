import React, { useState, useEffect, useMemo } from 'react';
import { getActivityLogs } from '../../lib/api';

export default function AdminActivity({ triggerNotification, onRefresh, loading }) {
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);

  const fetchLogs = async () => {
    try {
      setLocalLoading(true);
      const data = await getActivityLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      triggerNotification(`Error loading activity logs: ${err.message || err}`);
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRefresh = async () => {
    await fetchLogs();
    if (onRefresh) onRefresh();
    triggerNotification('Activity logs refreshed');
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const query = searchQuery.toLowerCase();
      return (
        (log.action && log.action.toLowerCase().includes(query)) ||
        (log.details && log.details.toLowerCase().includes(query)) ||
        (log.admin_user && log.admin_user.toLowerCase().includes(query))
      );
    });
  }, [logs, searchQuery]);

  React.useEffect(() => {
    setVisibleCount(20);
  }, [searchQuery]);

  const displayedLogs = useMemo(() => filteredLogs.slice(0, visibleCount), [filteredLogs, visibleCount]);

  const loadMoreRef = React.useRef(null);
  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && visibleCount < filteredLogs.length) {
        setVisibleCount(prev => prev + 20);
      }
    });
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [visibleCount, filteredLogs.length]);

  return (
    <div className="flex-grow flex flex-col bg-white border border-outline-variant/30 rounded-lg shadow-sm overflow-hidden text-left">
      <div className="p-4 md:p-6 border-b border-outline-variant/20 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="font-headline-sm text-xl font-bold text-primary">Activity Log</h2>
          <button 
            onClick={handleRefresh}
            disabled={localLoading || loading}
            className="p-2 text-secondary hover:text-primary hover:bg-surface-container rounded-full transition-colors cursor-pointer bg-transparent border-none"
            title="Refresh Logs"
          >
            <span className={`material-symbols-outlined ${(localLoading || loading) ? 'animate-spin' : ''}`}>refresh</span>
          </button>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-secondary text-lg">search</span>
          <input
            type="text"
            placeholder="Search activity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-outline-variant/50 focus:border-primary outline-none w-full sm:w-64"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {localLoading && logs.length === 0 ? (
          <div className="p-12 text-center text-secondary">Loading logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-secondary">No activity logs found.</div>
        ) : (
          <div className="divide-y divide-outline-variant/10">
            {displayedLogs.map(log => (
              <div key={log.id} className="p-4 md:p-6 hover:bg-surface-container-low transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-label-caps tracking-widest uppercase font-bold bg-surface-container text-primary">
                      {log.action}
                    </span>
                    <span className="text-xs text-secondary font-medium">by {log.admin_user}</span>
                  </div>
                  <p className="text-sm text-primary leading-relaxed">{log.details}</p>
                </div>
                <div className="text-right text-xs text-secondary font-mono flex-shrink-0">
                  {new Date(log.created_at).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </div>
              </div>
            ))}
            {visibleCount < filteredLogs.length && (
              <div ref={loadMoreRef} className="p-4 text-center text-secondary text-sm">
                Loading more...
              </div>
            )}
          </div>
        )}
      </div>
      <div className="p-2 text-xs text-secondary border-t border-outline-variant/20 bg-surface-container-low">
        Showing {displayedLogs.length} of {filteredLogs.length} log{filteredLogs.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
