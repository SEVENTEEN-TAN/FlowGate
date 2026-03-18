import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, X, Bell, Info } from 'lucide-react';
import DOMPurify from 'dompurify';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';

interface Announcement {
  id: number;
  title: string;
  content: string;
  enabled: number;
  frequency: 'always' | 'daily' | 'once';
  style: 'top-right' | 'modal' | 'top-center';
}

export default function ClientLogin() {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [visibleIds, setVisibleIds] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch('/api/announcements');
        if (res.ok) {
          const data: Announcement[] = await res.json();
          setAnnouncements(data);
          
          const today = new Date().toDateString();
          const newVisibleIds = new Set<number>();
          
          data.forEach(ann => {
            let shouldShow = false;
            if (ann.frequency === 'always') {
              shouldShow = !sessionStorage.getItem(`ann_closed_${ann.id}`);
            } else if (ann.frequency === 'daily') {
              shouldShow = localStorage.getItem(`ann_closed_daily_${ann.id}`) !== today;
            } else if (ann.frequency === 'once') {
              shouldShow = !localStorage.getItem(`ann_closed_once_${ann.id}`);
            }
            
            if (shouldShow) {
              newVisibleIds.add(ann.id);
            }
          });
          
          setVisibleIds(newVisibleIds);
        }
      } catch (err) {
        console.error('Failed to fetch announcements', err);
      }
    };
    fetchAnnouncements();
  }, []);

  const handleClose = (ann: Announcement) => {
    const newVisible = new Set(visibleIds);
    newVisible.delete(ann.id);
    setVisibleIds(newVisible);
    
    if (ann.frequency === 'always') {
      sessionStorage.setItem(`ann_closed_${ann.id}`, 'true');
    } else if (ann.frequency === 'daily') {
      localStorage.setItem(`ann_closed_daily_${ann.id}`, new Date().toDateString());
    } else if (ann.frequency === 'once') {
      localStorage.setItem(`ann_closed_once_${ann.id}`, 'true');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('/api/client/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      
      const data = await res.json();
      if (data.token) {
        sessionStorage.setItem('clientToken', data.token);
        if (data.expires_at) {
          sessionStorage.setItem('clientTokenExpiresAt', data.expires_at);
        }
        if (data.app_id) {
          sessionStorage.setItem('clientAppId', String(data.app_id));
        }
        navigate('/app');
      } else {
        setError(data.error || '卡密验证失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    }
  };

  const topRightAnns = announcements.filter(a => visibleIds.has(a.id) && a.style === 'top-right');
  const modalAnns = announcements.filter(a => visibleIds.has(a.id) && a.style === 'modal');
  const topCenterAnns = announcements.filter(a => visibleIds.has(a.id) && a.style === 'top-center');

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 relative">
      {/* Top Center Banners */}
      <div className="absolute top-0 left-0 right-0 z-40 flex flex-col items-center pt-4 px-4 gap-3 pointer-events-none">
        <AnimatePresence>
          {topCenterAnns.map(ann => (
            <motion.div
              key={ann.id}
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="w-full max-w-3xl bg-indigo-600 text-white rounded-xl shadow-lg pointer-events-auto flex items-start overflow-hidden"
            >
              <div className="p-4 flex-1 flex items-start gap-3">
                <Info className="w-5 h-5 shrink-0 mt-0.5 opacity-80" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold mb-1">{ann.title}</h4>
                  <div 
                    className="prose prose-invert prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(ann.content) }}
                  />
                </div>
              </div>
              <button
                onClick={() => handleClose(ann)}
                className="p-4 opacity-70 hover:opacity-100 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="max-w-md w-full p-6 sm:p-8 bg-white rounded-2xl shadow-sm border border-zinc-100 z-10 mx-4">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Key className="w-10 h-10" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-center text-zinc-900 mb-2">输入卡密</h2>
        <p className="text-center text-zinc-500 mb-8">请输入您的卡密以进入主程序。</p>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              required
              value={key}
              onChange={e => setKey(e.target.value)}
              className="w-full px-4 py-3 text-center font-mono text-lg border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors uppercase"
              placeholder="XXXXXX-XXXXXX-XXXXXX"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors mt-6"
          >
            验证并进入
          </button>
        </form>
      </div>

      {/* Top Right Notifications */}
      <div className="fixed top-4 right-4 left-4 sm:left-auto sm:top-6 sm:right-6 z-50 flex flex-col gap-4 w-auto sm:w-full sm:max-w-sm pointer-events-none">
        <AnimatePresence>
          {topRightAnns.map(ann => (
            <motion.div 
              key={ann.id}
              initial={{ opacity: 0, x: 50, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden flex flex-col max-h-[60vh] pointer-events-auto"
            >
              <div className="px-4 py-3 border-b border-zinc-100 flex justify-between items-center shrink-0 bg-indigo-50/50">
                <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm">
                  <Bell className="w-4 h-4" />
                  {ann.title}
                </div>
                <button
                  onClick={() => handleClose(ann)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-white rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto">
                <div 
                  className="prose prose-zinc max-w-none prose-sm"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(ann.content) }}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Center Modals */}
      <AnimatePresence>
        {modalAnns.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            {/* We only show the first modal in the queue to avoid overlapping */}
            <motion.div 
              key={modalAnns[0].id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center shrink-0 bg-indigo-50/50">
                <div className="flex items-center gap-2 text-indigo-700 font-semibold">
                  <Bell className="w-5 h-5" />
                  {modalAnns[0].title}
                </div>
                <button
                  onClick={() => handleClose(modalAnns[0])}
                  className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div 
                  className="prose prose-zinc max-w-none prose-sm sm:prose-base"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(modalAnns[0].content) }}
                />
              </div>
              
              <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 shrink-0">
                <button
                  onClick={() => handleClose(modalAnns[0])}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                >
                  我知道了
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
