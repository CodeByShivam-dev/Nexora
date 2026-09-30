import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart2,
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  ArrowUpRight,
  Calendar,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const InsightsPage: React.FC = () => {
  const { theme } = useApp();
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('7d');

  const followerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const engagementCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const followerChartInstance = useRef<ChartJS | null>(null);
  const engagementChartInstance = useRef<ChartJS | null>(null);

  const isDark = theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';

  // Chart data based on range
  const chartLabels =
    range === '7d'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : range === '30d'
      ? ['W1', 'W2', 'W3', 'W4', 'W5', 'W6']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  const followerData =
    range === '7d'
      ? [1380, 1392, 1400, 1406, 1412, 1416, 1420]
      : range === '30d'
      ? [1210, 1260, 1315, 1370, 1405, 1420]
      : [890, 980, 1120, 1240, 1350, 1420];

  const engagementData =
    range === '7d'
      ? [42, 68, 55, 94, 82, 110, 148]
      : range === '30d'
      ? [240, 310, 280, 420, 390, 510]
      : [680, 890, 1150, 1420, 1780, 2190];

  useEffect(() => {
    // 1. Follower Chart
    if (followerCanvasRef.current) {
      if (followerChartInstance.current) {
        followerChartInstance.current.destroy();
      }

      followerChartInstance.current = new ChartJS(followerCanvasRef.current, {
        type: 'line',
        data: {
          labels: chartLabels,
          datasets: [
            {
              label: 'Followers',
              data: followerData,
              borderColor: '#4f46e5',
              backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(79, 70, 229, 0.08)',
              fill: true,
              tension: 0.35,
              pointRadius: 4,
              pointBackgroundColor: '#4f46e5',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              titleColor: isDark ? '#f8fafc' : '#0f172a',
              bodyColor: isDark ? '#cbd5e1' : '#475569',
              borderColor: isDark ? '#374151' : '#e2e8f0',
              borderWidth: 1,
              padding: 10,
              displayColors: false,
            },
          },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: { color: textColor, font: { size: 11 } },
            },
            y: {
              grid: { color: gridColor },
              ticks: { color: textColor, font: { size: 11 } },
            },
          },
        },
      });
    }

    // 2. Engagement Chart
    if (engagementCanvasRef.current) {
      if (engagementChartInstance.current) {
        engagementChartInstance.current.destroy();
      }

      engagementChartInstance.current = new ChartJS(engagementCanvasRef.current, {
        type: 'bar',
        data: {
          labels: chartLabels,
          datasets: [
            {
              label: 'Interactions',
              data: engagementData,
              backgroundColor: isDark ? '#38bdf8' : '#0ea5e9',
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              titleColor: isDark ? '#f8fafc' : '#0f172a',
              bodyColor: isDark ? '#cbd5e1' : '#475569',
              borderColor: isDark ? '#374151' : '#e2e8f0',
              borderWidth: 1,
              padding: 10,
              displayColors: false,
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: textColor, font: { size: 11 } },
            },
            y: {
              grid: { color: gridColor },
              ticks: { color: textColor, font: { size: 11 } },
            },
          },
        },
      });
    }

    return () => {
      followerChartInstance.current?.destroy();
      engagementChartInstance.current?.destroy();
    };
  }, [range, theme]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-[var(--primary)]" />
            <h1 className="text-xl font-bold text-[var(--text)] tracking-tight">
              Insights & Analytics
            </h1>
          </div>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Real-time telemetry on follower growth, post reach, and audience engagement.
          </p>
        </div>

        {/* Time filters */}
        <div className="flex items-center gap-1 p-1 bg-[var(--surface-secondary)] rounded-xl self-start sm:self-auto">
          {(['7d', '30d', '90d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg uppercase transition-all ${
                range === r
                  ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Metric KPI Cards (Section 28) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[
          { label: 'Profile Views', value: '3,840', delta: '+18.4%', icon: Eye, color: 'text-indigo-500' },
          { label: 'Post Reach', value: '14,290', delta: '+24.1%', icon: TrendingUp, color: 'text-sky-500' },
          { label: 'Total Likes', value: '1,480', delta: '+12.0%', icon: Heart, color: 'text-rose-500' },
          { label: 'Comments', value: '312', delta: '+8.6%', icon: MessageCircle, color: 'text-amber-500' },
          { label: 'Shares', value: '184', delta: '+15.2%', icon: Share2, color: 'text-emerald-500' },
          { label: 'Followers', value: '1,420', delta: '+4.8%', icon: Users, color: 'text-violet-500' },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5 shadow-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[var(--muted)] font-medium truncate">{card.label}</span>
                <Icon className={`h-3.5 w-3.5 ${card.color}`} />
              </div>
              <div className="text-lg font-bold text-[var(--text)] tabular-nums">{card.value}</div>
              <div className="text-[10px] text-emerald-600 font-semibold tabular-nums">{card.delta}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Follower Growth */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--text)]">Follower Trajectory</h3>
              <p className="text-[11px] text-[var(--muted)]">Net new audience connections over time</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 tabular-nums">+40 Net Gain</span>
          </div>

          <div className="h-64 w-full">
            <canvas ref={followerCanvasRef} />
          </div>
        </div>

        {/* Chart 2: Engagement Activity */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--text)]">Engagement Volume</h3>
              <p className="text-[11px] text-[var(--muted)]">Daily interactions, comments, and shares</p>
            </div>
            <span className="text-xs font-bold text-sky-600 tabular-nums">4.8% Avg. Rate</span>
          </div>

          <div className="h-64 w-full">
            <canvas ref={engagementCanvasRef} />
          </div>
        </div>
      </div>
    </div>
  );
};
