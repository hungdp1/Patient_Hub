import React from 'react';
import { CircleCheck, CircleDashed, WifiOff } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';

export default function RealtimeStatus() {
  const { connected } = useSocket();

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-full bg-slate-900/95 px-4 py-2 text-xs text-white shadow-lg shadow-slate-900/30">
      {connected ? (
        <>
          <CircleCheck size={16} className="text-emerald-400" />
          <span>Đã kết nối thời gian thực</span>
        </>
      ) : (
        <>
          <WifiOff size={16} className="text-rose-400" />
          <span>Chưa kết nối realtime</span>
        </>
      )}
    </div>
  );
}
