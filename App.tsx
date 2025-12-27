
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  TeachingMode, 
  TeachingAction, 
  LogEntry, 
  SessionState, 
  EngagementLevel 
} from './types';
import { 
  SUBJECTS, 
  INITIAL_MODES, 
  INITIAL_ACTIONS, 
  StartIcon, 
  StopIcon, 
  LogoIcon 
} from './constants';

const App: React.FC = () => {
  // Session State
  const [session, setSession] = useState<SessionState>({
    isActive: false,
    startTime: null,
    endTime: null,
    subject: SUBJECTS[0],
  });

  const [modes, setModes] = useState<TeachingMode[]>(INITIAL_MODES);
  const [actions, setActions] = useState<TeachingAction[]>(INITIAL_ACTIONS);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [engagement, setEngagement] = useState<EngagementLevel>('high');
  const [note, setNote] = useState('');
  
  // Timers and UI Helpers
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  const [showEngagementReminder, setShowEngagementReminder] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Interval for system clock and mode timing
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      if (session.isActive) {
        setModes(prev => prev.map(m => m.active ? { ...m, totalSeconds: m.totalSeconds + 1 } : m));
      }

      // 5-minute inactivity check (300,000 ms)
      if (session.isActive && Date.now() - lastInteractionTime > 300000) {
        setShowEngagementReminder(true);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [session.isActive, lastInteractionTime]);

  const recordInteraction = useCallback(() => {
    setLastInteractionTime(Date.now());
    setShowEngagementReminder(false);
  }, []);

  const addLog = useCallback((type: LogEntry['type'], label: string, value?: string | number) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
      type,
      label,
      value,
    };
    setLogs(prev => [newLog, ...prev]);
  }, []);

  const toggleSession = () => {
    recordInteraction();
    if (!session.isActive) {
      setSession(prev => ({ ...prev, isActive: true, startTime: new Date(), endTime: null }));
      addLog('note', '課程開始', session.subject);
    } else {
      setSession(prev => ({ ...prev, isActive: false, endTime: new Date() }));
      setModes(prev => prev.map(m => ({ ...m, active: false })));
      addLog('note', '課程結束');
      setShowSummary(true);
    }
  };

  const toggleMode = (id: string) => {
    if (!session.isActive) return;
    recordInteraction();
    setModes(prev => {
      const updated = prev.map(m => {
        if (m.id === id) {
          const newState = !m.active;
          addLog('mode', `${newState ? '啟動' : '停用'} ${m.name}`);
          return { ...m, active: newState };
        }
        return m;
      });
      return updated;
    });
  };

  const incrementAction = (id: string) => {
    if (!session.isActive) return;
    recordInteraction();
    setActions(prev => prev.map(a => {
      if (a.id === id) {
        addLog('action', a.name, a.count + 1);
        return { ...a, count: a.count + 1 };
      }
      return a;
    }));
  };

  const handleEngagementChange = (level: EngagementLevel) => {
    recordInteraction();
    setEngagement(level);
    addLog('engagement', '切換專注度', level === 'high' ? '高' : level === 'medium' ? '中' : '低');
  };

  const sendNote = () => {
    if (!note.trim()) return;
    recordInteraction();
    addLog('note', '質性紀錄', note);
    setNote('');
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = () => {
    const text = generateReportText();
    navigator.clipboard.writeText(text);
    alert('已複製到剪貼簿');
  };

  const downloadTxt = () => {
    const text = generateReportText();
    const blob = new Blob(["\ufeff" + text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `觀課紀錄_${session.subject}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateReportText = () => {
    let report = `Chronos 數位觀課報告\n`;
    report += `====================\n`;
    report += `科目: ${session.subject}\n`;
    report += `開始時間: ${session.startTime?.toLocaleString('zh-TW')}\n`;
    report += `結束時間: ${session.endTime?.toLocaleString('zh-TW')}\n\n`;
    
    report += `[教學模式總覽]\n`;
    modes.forEach(m => {
      report += `- ${m.name}: ${formatTime(m.totalSeconds)}\n`;
    });
    
    report += `\n[教學行為計數]\n`;
    actions.forEach(a => {
      report += `- ${a.name}: ${a.count} 次\n`;
    });
    
    report += `\n[詳細紀錄流]\n`;
    logs.slice().reverse().forEach(l => {
      report += `${l.timestamp} [${l.label}] ${l.value || ''}\n`;
    });
    
    return report;
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 p-2 md:p-4 overflow-hidden select-none">
      
      {/* Header */}
      <header className="glass gold-border rounded-xl h-20 md:h-24 flex items-center justify-between px-4 md:px-8 mb-4">
        <div className="flex items-center gap-4">
          <LogoIcon />
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-amber-500 tracking-widest">CHRONOS</h1>
            <p className="text-[10px] text-amber-700/60 font-medium">DIGITAL OBSERVATION</p>
          </div>
          <div className="ml-4 md:ml-8">
            <select 
              className="bg-slate-900 border border-amber-900/50 text-amber-400 rounded-lg px-3 py-1 outline-none focus:ring-1 focus:ring-amber-500 text-sm md:text-base"
              value={session.subject}
              onChange={(e) => setSession(prev => ({ ...prev, subject: e.target.value }))}
              disabled={session.isActive}
            >
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center">
          <span className="text-2xl md:text-4xl font-mono text-amber-500/80 drop-shadow-lg">
            {currentTime.toLocaleTimeString('zh-TW', { hour12: false })}
          </span>
          <span className="text-[10px] uppercase text-amber-700 font-bold tracking-[0.2em]">System Time</span>
        </div>

        <button 
          onClick={toggleSession}
          className="group focus:outline-none flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        >
          {session.isActive ? <StopIcon /> : <StartIcon />}
        </button>
      </header>

      {/* Main Dashboard */}
      <main className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden min-h-0">
        
        {/* Left - Teaching States */}
        <section className="w-full md:w-1/3 flex flex-col gap-3">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold text-amber-700 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
              教學模式 (STATES)
            </h2>
            <span className="text-[10px] text-amber-900 font-mono">Real-time Timers</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-3 flex-1 overflow-y-auto pr-1">
            {modes.map(mode => (
              <button
                key={mode.id}
                onClick={() => toggleMode(mode.id)}
                disabled={!session.isActive}
                className={`
                  relative overflow-hidden p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between h-28 md:h-auto md:aspect-[3/1]
                  ${mode.active 
                    ? 'glass gold-border active-glow bg-amber-500/10' 
                    : 'bg-slate-900/50 border-slate-800 opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0'}
                  ${!session.isActive && 'cursor-not-allowed'}
                `}
              >
                {mode.active && (
                  <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,1)]"></div>
                  </div>
                )}
                <span className={`text-base font-bold ${mode.active ? 'text-amber-400' : 'text-slate-400'}`}>
                  {mode.name}
                </span>
                <span className={`text-2xl font-mono ${mode.active ? 'text-amber-500' : 'text-slate-600'}`}>
                  {formatTime(mode.totalSeconds)}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Right - Teaching Actions & Log */}
        <section className="w-full md:w-2/3 flex flex-col gap-4 min-h-0">
          
          {/* Action Grid */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-amber-700 px-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
              教學行為 (ACTIONS)
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {actions.map(action => (
                <button
                  key={action.id}
                  onClick={() => incrementAction(action.id)}
                  disabled={!session.isActive}
                  className={`
                    group p-3 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 active:bg-amber-900/20 transition-all text-center
                    ${!session.isActive && 'opacity-40 cursor-not-allowed'}
                  `}
                >
                  <div className="text-xs text-slate-400 mb-1 group-hover:text-amber-500 transition-colors">{action.name}</div>
                  <div className="text-xl font-bold text-amber-600 font-mono">{action.count}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Log Stream */}
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            <h2 className="text-sm font-bold text-amber-700 px-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
              紀錄流 (LIVE LOG)
            </h2>
            <div className="flex-1 bg-slate-900/30 border border-slate-900 rounded-xl overflow-y-auto p-4 font-mono text-xs md:text-sm">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-700 italic">等待數據輸入...</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {logs.map(log => (
                    <div key={log.id} className="flex items-start gap-4 animate-in fade-in slide-in-from-left duration-300">
                      <span className="text-amber-900/80 font-bold shrink-0">{log.timestamp}</span>
                      <span className={`
                        px-1.5 rounded text-[10px] shrink-0 uppercase font-black tracking-tighter
                        ${log.type === 'mode' ? 'bg-amber-900/40 text-amber-500' : 
                          log.type === 'action' ? 'bg-sky-900/40 text-sky-500' : 
                          log.type === 'engagement' ? 'bg-emerald-900/40 text-emerald-500' :
                          'bg-slate-800 text-slate-400'}
                      `}>
                        {log.type}
                      </span>
                      <span className="text-slate-300">
                        {log.label} {log.value !== undefined && <span className="text-amber-500 ml-1">[{log.value}]</span>}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer Controls */}
      <footer className={`
        glass gold-border rounded-xl mt-4 px-4 py-3 flex flex-col md:flex-row items-center gap-6 transition-colors duration-500
        ${showEngagementReminder ? 'engagement-warning' : ''}
      `}>
        {/* Engagement Slider */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <label className="text-xs font-bold text-amber-700 shrink-0">學生專注度</label>
          <div className="flex gap-2 flex-1 md:w-48">
            <button 
              onClick={() => handleEngagementChange('high')}
              className={`flex-1 h-8 rounded-md text-[10px] font-bold transition-all ${engagement === 'high' ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
            >
              高
            </button>
            <button 
              onClick={() => handleEngagementChange('medium')}
              className={`flex-1 h-8 rounded-md text-[10px] font-bold transition-all ${engagement === 'medium' ? 'bg-amber-600 text-white shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
            >
              中
            </button>
            <button 
              onClick={() => handleEngagementChange('low')}
              className={`flex-1 h-8 rounded-md text-[10px] font-bold transition-all ${engagement === 'low' ? 'bg-rose-600 text-white shadow-[0_0_10px_rgba(225,29,72,0.5)]' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
            >
              低
            </button>
          </div>
        </div>

        {/* Note Input */}
        <div className="flex-1 w-full flex items-center gap-2">
          <input 
            type="text" 
            placeholder="輸入質性觀察筆記..."
            className="flex-1 bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:border-amber-500 outline-none placeholder:text-slate-700"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendNote()}
            disabled={!session.isActive}
          />
          <button 
            onClick={sendNote}
            disabled={!session.isActive || !note.trim()}
            className="p-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-30 disabled:hover:bg-amber-600 text-white rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
      </footer>

      {/* Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={() => setShowSummary(false)}></div>
          <div className="relative glass gold-border rounded-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="klimt-gradient h-2"></div>
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-amber-500">觀課總結報告</h3>
                <button onClick={() => setShowSummary(false)} className="text-slate-500 hover:text-white">&times;</button>
              </div>

              <div className="space-y-6 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-amber-900 font-bold uppercase mb-1">觀察科目</p>
                    <p className="text-lg font-bold text-slate-200">{session.subject}</p>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-amber-900 font-bold uppercase mb-1">開始時間</p>
                    <p className="text-lg font-bold text-slate-200">{session.startTime?.toLocaleTimeString('zh-TW', {hour12: false})}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-amber-700 font-bold text-xs uppercase tracking-widest mb-3 border-b border-amber-900/30 pb-1">教學模式分佈</h4>
                  <div className="space-y-3">
                    {modes.map(m => {
                      const totalSecs = modes.reduce((acc, curr) => acc + curr.totalSeconds, 0);
                      const percent = totalSecs > 0 ? (m.totalSeconds / totalSecs * 100).toFixed(1) : 0;
                      return (
                        <div key={m.id} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">{m.name}</span>
                            <span className="text-amber-500 font-mono">{formatTime(m.totalSeconds)} ({percent}%)</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="text-amber-700 font-bold text-xs uppercase tracking-widest mb-3 border-b border-amber-900/30 pb-1">行為次數統計</h4>
                  <div className="flex flex-wrap gap-2">
                    {actions.map(a => (
                      <div key={a.id} className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full flex gap-2 items-center">
                        <span className="text-[10px] text-slate-500">{a.name}</span>
                        <span className="text-sm font-bold text-amber-500">{a.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  onClick={copyToClipboard}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold transition-all border border-slate-700"
                >
                  複製紀錄
                </button>
                <button 
                  onClick={downloadTxt}
                  className="flex-1 klimt-gradient hover:opacity-90 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-amber-900/20"
                >
                  下載 TXT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
