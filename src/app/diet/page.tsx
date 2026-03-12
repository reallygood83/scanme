'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import { storage } from '@/lib/storage';
import { Flame, Timer, Utensils, TrendingDown } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const TARGET_CALORIES = 1800;
const FASTING_HOURS = 16;
const FASTING_MS = FASTING_HOURS * 60 * 60 * 1000;

const mealSuggestions = [
  {
    name: '두부 스테이크',
    calories: 280,
    protein: 22,
    carbs: 12,
    fat: 16,
    desc: '고단백 저퓨린 메뉴',
  },
  {
    name: '연어 샐러드',
    calories: 320,
    protein: 28,
    carbs: 15,
    fat: 18,
    desc: '오메가3 풍부',
  },
  {
    name: '퀴노아 볼',
    calories: 350,
    protein: 14,
    carbs: 48,
    fat: 10,
    desc: '완전 단백질 곡물',
  },
];

export default function DietPage() {
  const [meals, setMeals] = useState(storage.getMeals());
  const [weightData, setWeightData] = useState(storage.getWeight());
  const [fastingStart, setFastingStart] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setMeals(storage.getMeals());
    setWeightData(storage.getWeight());
    setFastingStart(storage.getFastingStart());
  }, []);

  // Timer tick
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
      if (fastingStart) {
        setElapsed(Date.now() - new Date(fastingStart).getTime());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [fastingStart]);

  const today = new Date().toISOString().split('T')[0];
  const todayMeals = meals.filter((m) => m.date === today);
  const totalCalories = todayMeals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = todayMeals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = todayMeals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFat = todayMeals.reduce((sum, m) => sum + m.fat, 0);
  const totalMacro = totalProtein + totalCarbs + totalFat || 1;

  const isFasting = !!fastingStart;
  const fastingProgress = isFasting
    ? Math.min((elapsed / FASTING_MS) * 100, 100)
    : 0;
  const fastingComplete = elapsed >= FASTING_MS;

  const formatTime = useCallback((ms: number) => {
    const totalSec = Math.floor(Math.abs(ms) / 1000);
    const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }, []);

  const toggleFasting = () => {
    if (isFasting) {
      storage.setFastingStart(null);
      setFastingStart(null);
      setElapsed(0);
    } else {
      const start = new Date().toISOString();
      storage.setFastingStart(start);
      setFastingStart(start);
      setElapsed(0);
    }
  };

  const remaining = FASTING_MS - elapsed;

  // Weight chart
  const chartData = weightData.slice(-7).map((w) => ({
    date: w.date.slice(5),
    체중: w.value,
  }));

  const macroBar = (label: string, value: number, color: string) => {
    const pct = totalMacro > 0 ? Math.round((value / totalMacro) * 100) : 0;
    return (
      <div key={label} className="flex items-center gap-2">
        <span className="text-xs text-gray-500 w-10">{label}</span>
        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs text-gray-600 w-16 text-right">{value}g ({pct}%)</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-[430px] mx-auto">
      <Header title="다이어트 코치" showBack />

      <main className="flex-1 overflow-y-auto px-4 pb-8 space-y-4">
        {/* Today's Summary */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
            <Flame size={16} className="text-orange-500" />
            오늘의 칼로리
          </h3>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-3xl font-bold text-gray-800">{totalCalories}</span>
            <span className="text-sm text-gray-400 mb-1">/ {TARGET_CALORIES} kcal</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div
              className={`h-full rounded-full transition-all ${
                totalCalories > TARGET_CALORIES ? 'bg-red-400' : 'bg-blue-400'
              }`}
              style={{ width: `${Math.min((totalCalories / TARGET_CALORIES) * 100, 100)}%` }}
            />
          </div>
          <div className="space-y-2">
            {macroBar('단백질', totalProtein, 'bg-blue-400')}
            {macroBar('탄수화물', totalCarbs, 'bg-yellow-400')}
            {macroBar('지방', totalFat, 'bg-red-400')}
          </div>
        </div>

        {/* Weight Trend */}
        {chartData.length >= 2 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
              <TrendingDown size={16} className="text-green-500" />
              체중 변화 (최근 7일)
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                <Tooltip />
                <Line type="monotone" dataKey="체중" stroke="#14b8a6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Intermittent Fasting Timer */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
            <Timer size={16} className="text-purple-500" />
            간헐적 단식 (16:8)
          </h3>

          <div className="text-center mb-4">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                isFasting
                  ? fastingComplete
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {isFasting ? (fastingComplete ? '식사 가능' : '단식 중') : '대기 중'}
            </span>
          </div>

          <div className="text-center mb-3">
            <p className="text-4xl font-mono font-bold text-gray-800">
              {isFasting ? formatTime(fastingComplete ? elapsed : remaining) : '00:00:00'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {isFasting
                ? fastingComplete
                  ? '단식 완료 - 경과 시간'
                  : '남은 시간'
                : '단식을 시작하세요'}
            </p>
          </div>

          {isFasting && (
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${fastingProgress}%` }}
              />
            </div>
          )}

          <button
            onClick={toggleFasting}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              isFasting
                ? 'bg-red-100 text-red-600'
                : 'bg-purple-500 text-white'
            }`}
          >
            {isFasting ? '단식 종료' : '단식 시작'}
          </button>
        </div>

        {/* Meal Suggestions */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1 px-1">
            <Utensils size={16} className="text-blue-500" />
            추천 식단
          </h3>
          <div className="space-y-3">
            {mealSuggestions.map((meal) => (
              <div key={meal.name} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-sm">{meal.name}</h4>
                  <span className="text-xs text-gray-400">{meal.calories} kcal</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{meal.desc}</p>
                <div className="flex gap-3 text-[10px] text-gray-400">
                  <span>단백질 {meal.protein}g</span>
                  <span>탄수화물 {meal.carbs}g</span>
                  <span>지방 {meal.fat}g</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
