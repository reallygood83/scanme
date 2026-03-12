'use client';

import { useState, useEffect } from 'react';
import {
  TrendingDown,
  TrendingUp,
  Minus,
  FileDown,
  Droplets,
  Activity,
  Flame,
  Weight,
  Lightbulb,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import BottomNav from '@/components/BottomNav';
import { storage, UricAcidEntry, GlucoseEntry, MealEntry, WeightEntry } from '@/lib/storage';

interface SummaryCard {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'flat';
  trendLabel: string;
  icon: React.ReactNode;
  color: string;
}

export default function ReportPage() {
  const [uricData, setUricData] = useState<UricAcidEntry[]>([]);
  const [glucoseData, setGlucoseData] = useState<GlucoseEntry[]>([]);
  const [mealData, setMealData] = useState<MealEntry[]>([]);
  const [weightData, setWeightData] = useState<WeightEntry[]>([]);

  useEffect(() => {
    setUricData(storage.getUricAcid());
    setGlucoseData(storage.getGlucose());
    setMealData(storage.getMeals());
    setWeightData(storage.getWeight());
  }, []);

  // Compute date range (this week)
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - 6);
  const formatShort = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  const dateRange = `${formatShort(weekStart)} ~ ${formatShort(today)}`;

  // Compute summary values
  const avgUric =
    uricData.length > 0
      ? (uricData.reduce((s, e) => s + e.value, 0) / uricData.length).toFixed(1)
      : '-';
  const avgGlucose =
    glucoseData.length > 0
      ? Math.round(glucoseData.reduce((s, e) => s + e.value, 0) / glucoseData.length)
      : '-';
  const totalCalories =
    mealData.length > 0
      ? mealData.reduce((s, e) => s + e.calories, 0).toLocaleString()
      : '-';

  const weightDelta =
    weightData.length >= 2
      ? (weightData[weightData.length - 1].value - weightData[0].value).toFixed(1)
      : '-';

  const uricTrend: 'up' | 'down' | 'flat' =
    uricData.length >= 2
      ? uricData[uricData.length - 1].value < uricData[0].value
        ? 'down'
        : uricData[uricData.length - 1].value > uricData[0].value
          ? 'up'
          : 'flat'
      : 'flat';

  const glucoseTrend: 'up' | 'down' | 'flat' = 'flat';

  const weightTrendDir: 'up' | 'down' | 'flat' =
    weightData.length >= 2
      ? weightData[weightData.length - 1].value < weightData[0].value
        ? 'down'
        : weightData[weightData.length - 1].value > weightData[0].value
          ? 'up'
          : 'flat'
      : 'flat';

  const summaryCards: SummaryCard[] = [
    {
      label: '평균 요산',
      value: avgUric !== '-' ? `${avgUric} mg/dL` : '-',
      trend: uricTrend,
      trendLabel: uricTrend === 'down' ? '개선' : uricTrend === 'up' ? '상승' : '유지',
      icon: <Droplets size={20} />,
      color: 'text-red-500',
    },
    {
      label: '평균 혈당',
      value: avgGlucose !== '-' ? `${avgGlucose} mg/dL` : '-',
      trend: glucoseTrend,
      trendLabel: '안정',
      icon: <Activity size={20} />,
      color: 'text-blue-500',
    },
    {
      label: '총 칼로리',
      value: totalCalories !== '-' ? `${totalCalories} kcal` : '-',
      trend: 'flat',
      trendLabel: '이번 주',
      icon: <Flame size={20} />,
      color: 'text-orange-500',
    },
    {
      label: '체중 변화',
      value: weightDelta !== '-' ? `${Number(weightDelta) > 0 ? '+' : ''}${weightDelta} kg` : '-',
      trend: weightTrendDir,
      trendLabel: weightTrendDir === 'down' ? '감소' : weightTrendDir === 'up' ? '증가' : '유지',
      icon: <Weight size={20} />,
      color: 'text-green-500',
    },
  ];

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'flat' }) => {
    if (trend === 'down') return <TrendingDown size={16} className="text-green-500" />;
    if (trend === 'up') return <TrendingUp size={16} className="text-red-500" />;
    return <Minus size={16} className="text-gray-400" />;
  };

  // Uric Acid chart data
  const uricChartData = uricData.map((e) => ({
    date: e.date.slice(5).replace('-', '/'),
    value: e.value,
  }));

  // Glucose chart data: average per day
  const glucoseByDay = glucoseData.reduce<Record<string, number[]>>((acc, e) => {
    const key = e.date.slice(5).replace('-', '/');
    if (!acc[key]) acc[key] = [];
    acc[key].push(e.value);
    return acc;
  }, {});
  const glucoseChartData = Object.entries(glucoseByDay).map(([date, values]) => ({
    date,
    value: Math.round(values.reduce((s, v) => s + v, 0) / values.length),
  }));

  const insights = [
    '요산 수치가 7.2에서 6.1로 개선되었습니다!',
    '식후 혈당 스파이크가 3회 감지되었습니다.',
    '체중이 1.5kg 감소했습니다. 목표까지 3.5kg 남았습니다.',
  ];

  const handlePdfDownload = () => {
    alert('Pro 플랜에서 이용 가능합니다');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="flex items-center justify-center h-14 px-4 bg-white border-b border-gray-100">
        <h1 className="text-lg font-semibold">주간 리포트</h1>
      </header>

      <div className="px-4 py-4 space-y-5">
        {/* Date Range */}
        <div className="text-center">
          <span className="text-sm text-gray-500">이번 주: </span>
          <span className="text-sm font-medium text-gray-800">{dateRange}</span>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={card.color}>{card.icon}</span>
                <span className="text-xs text-gray-500">{card.label}</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{card.value}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendIcon trend={card.trend} />
                <span className="text-xs text-gray-500">{card.trendLabel}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Uric Acid Chart */}
        {uricChartData.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">요산 수치 추이</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={uricChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[5, 9]} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v: number) => [`${v} mg/dL`, '요산']}
                  contentStyle={{ fontSize: 12 }}
                />
                <ReferenceLine y={7.0} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '위험', fontSize: 10, fill: '#ef4444' }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#8b5cf6' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Glucose Chart */}
        {glucoseChartData.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">혈당 추이 (일 평균)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={glucoseChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[70, 180]} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v: number) => [`${v} mg/dL`, '혈당']}
                  contentStyle={{ fontSize: 12 }}
                />
                <ReferenceLine y={140} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: '주의', fontSize: 10, fill: '#f59e0b' }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#3b82f6' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* AI Insights */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={18} className="text-yellow-500" />
            <h2 className="text-sm font-semibold text-gray-700">AI 인사이트</h2>
          </div>
          <ul className="space-y-2">
            {insights.map((text, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* PDF Download Button */}
        <button
          type="button"
          onClick={handlePdfDownload}
          className="w-full flex items-center justify-center gap-2 h-12 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors"
        >
          <FileDown size={18} />
          PDF 다운로드
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
