// seed/experiences.js — work experience entries
import { uid } from './helpers.js';

export const buildExperiences = () => [
  {
    id: uid(),
    company: 'NeoSoft Technologies',
    title: 'Senior Software Engineer',
    location: 'Mumbai, India',
    period: 'Jun 2025 – Present',
    responsibilities: [
      'Drove technical vision for front-end team across 5+ enterprise React apps',
      'Led perf optimization — 3x improvement on Option Chain',
      'Code reviews and mentoring 3+ juniors/interns',
      'Sprint planning, effort estimations, architecture discussions',
      'Introduced Agentic AI tools (Claude Code, Codex)',
      'Built reusable component libraries; WebSocket dashboards',
      'Custom D3.js visualizations',
    ],
  },
  {
    id: uid(),
    company: 'Netcore Cloud',
    title: 'Senior React Developer',
    location: 'Thane, India',
    period: 'Feb 2024 – Mar 2025',
    responsibilities: [
      'Revamped legacy React app — 90% UI consistency improvement',
      'Resolved critical legacy bugs via root-cause analysis',
      'Delivered Undo/Redo, Version Management, Click Tracking',
    ],
  },
  {
    id: uid(),
    company: 'Shifa Infotech',
    title: 'Software React Native Developer',
    location: 'Jogeshwari, Mumbai',
    period: 'Apr 2023 – Jan 2024',
    responsibilities: ['Quarterly delivery planning', 'Timely delivery of prioritized tasks'],
  },
  {
    id: uid(),
    company: 'Mypcot Infotech',
    title: 'Senior React Native Developer',
    location: 'Mumbai, India',
    period: 'Feb 2021 – Mar 2023',
    responsibilities: [
      'Pixel-perfect React Native UIs for iOS and Android',
      'Custom reusable components across both platforms',
      'Integrated Firebase, Razorpay, CCAvenue, GPS, Camera, Biometrics',
      'Built and deployed iOS/Android binaries',
      'Mentored junior developers',
    ],
  },
  {
    id: uid(),
    company: 'Blocklogy',
    title: 'Software Developer',
    location: 'Navi Mumbai, India',
    period: 'Mar 2020 – Jan 2021',
    responsibilities: [
      'Built blockchain DApps on Ethereum (v4 & v5)',
      'Reusable React components',
      'Third-party API integration',
    ],
  },
  {
    id: uid(),
    company: 'Tantra-Gyan',
    title: 'Software Solution Developer',
    location: 'Mumbai, India',
    period: 'Feb 2019 – Mar 2020',
    responsibilities: [
      'Built UI components in React.js + Laravel Blade',
      'Integrated Camera and Location APIs',
    ],
  },
];
