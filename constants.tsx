
import React from 'react';

export const SUBJECTS = ['國文', '英文', '數學', '社會', '自然', '藝術', '體育', '科技', '綜合'];

export const INITIAL_MODES = [
  { id: 'lecture', name: '講述教學', active: false, totalSeconds: 0 },
  { id: 'group', name: '小組討論', active: false, totalSeconds: 0 },
  { id: 'practice', name: '實作/演算', active: false, totalSeconds: 0 },
  { id: 'digital', name: '數位運用', active: false, totalSeconds: 0 },
];

export const INITIAL_ACTIONS = [
  { id: 'praise', name: '正向鼓勵', count: 0 },
  { id: 'correct', name: '糾正規範', count: 0 },
  { id: 'open_q', name: '開放提問', count: 0 },
  { id: 'closed_q', name: '封閉提問', count: 0 },
  { id: 'patrol', name: '巡視走動', count: 0 },
];

// Custom Icons with Klimt geometry
export const StartIcon = () => (
  <svg width="64" height="64" viewBox="0 0 100 100" className="relative">
    <circle cx="50" cy="50" r="45" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 4" className="animate-rotate origin-center" />
    <defs>
      <linearGradient id="amber-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#b45309', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path d="M40 30 L70 50 L40 70 Z" fill="url(#amber-grad)" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

export const StopIcon = () => (
  <svg width="64" height="64" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="rust-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#7f1d1d', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#ef4444', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <rect x="30" y="30" width="40" height="40" rx="4" fill="url(#rust-grad)" stroke="#991b1b" strokeWidth="2" />
    <circle cx="50" cy="50" r="48" fill="none" stroke="#991b1b" strokeWidth="0.5" strokeDasharray="1 3" />
  </svg>
);

export const LogoIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" className="mr-2">
    <circle cx="16" cy="16" r="14" fill="none" stroke="#f59e0b" strokeWidth="1" />
    <path d="M16 6 V16 L22 22" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" fill="none" />
    <rect x="10" y="10" width="12" height="12" fill="none" stroke="#f59e0b" strokeWidth="0.5" transform="rotate(45 16 16)" />
  </svg>
);
