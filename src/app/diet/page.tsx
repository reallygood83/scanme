'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import { storage } from '@/lib/storage';
import { Flame, Timer, Utensils, TrendingDown, Apple, Beef, Droplet } from 'lucide-react';
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
    color: 'bg-lime-200',
  },
  {
    name: '연어 샐러드',
    calories: 320,
    protein: 28,
    carbs: 15,
    fat: 18,
    desc: '오메가3 풍부',
    color: 'bg-cyan-200',
  },
  {
    name: '퀴노아 볼',
    calories: 350,
    protein: 14,
    carbs: 48,
    fat: 10,
    desc: '완전 단백질 곡물',
    color: 'bg-orange-200',
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

  const chartData = weightData.slice(-7).map((w) => ({
    date: w.date.slice(5),
    체중: w.value,
  }));

  const caloriePercent = Math.min((totalCalories / TARGET_CALORIES) * 100, 100);
  const isOverCalorie = totalCalories > TARGET_CALORIES;

  return (
    <div className="flex flex-col min-h-screen bg-neo-bg max-w-[430px] mx-auto">
      <Header title="다이어트 코치" showBack />

      <main className="flex-1 overflow-y-auto px-4 pb-8 space-y-4">
        <div className="neo-card-orange">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-400 border-2 border-black flex items-center justify-center">
              <Flame size={16} />
            </div>
            <h3 className="font-black">오늘의 칼로리</h3>
          </div>
          
          <div className="flex items-baseline gap-2 mb-4">
            <span className={`text-4xl font-black ${isOverCalorie ? 'text-red-600' : 'text-gray-900'}`}>
              {totalCalories}
            </span>
            <span className="text-sm font-bold text-gray-500">/ {TARGET_CALORIES} kcal</span>
          </div>
          
          <div className="w-full h-4 bg-white rounded-lg border-3 border-black overflow-hidden mb-6">
            <div
              className={`h-full transition-all ${isOverCalorie ? 'bg-red-400' : 'bg-lime-400'}`}
              style={{ width: `${caloriePercent}%` }}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-cyan-200 rounded-xl p-3 border-2 border-black text-center">
              <Beef size={16} className="mx-auto mb-1" />
              <p className="text-xs font-bold text-gray-600">단백질</p>
              <p className="text-lg font-black">{totalProtein}g</p>
            </div>
            <div className="bg-yellow-200 rounded-xl p-3 border-2 border-black text-center">
              <Apple size={16} className="mx-auto mb-1" />
              <p className="text-xs font-bold text-gray-600">탄수화물</p>
              <p className="text-lg font-black">{totalCarbs}g</p>
            </div>
            <div className="bg-pink-200 rounded-xl p-3 border-2 border-black text-center">
              <Droplet size={16} className="mx-auto mb-1" />
              <p className="text-xs font-bold text-gray-600">지방</p>
              <p className="text-lg font-black">{totalFat}g</p>
            </div>
          </div>
        </div>

        {chartData.length >= 2 && (
          <div className="neo-card">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-lime-400 border-2 border-black flex items-center justify-center">
                <TrendingDown size={16} />
              </div>
              <h3 className="font-black">체중 변화 (최근 7일)</h3>
            </div>
            <div className="bg-white rounded-xl border-2 border-black p-2">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fontWeight: 600 }} />
                  <YAxis tick={{ fontSize: 11, fontWeight: 600 }} domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                  <Tooltip 
                    contentStyle={{ 
                      border: '2px solid black', 
                      borderRadius: '8px',
                      fontWeight: 600 
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="체중" 
                    stroke="#000" 
                    strokeWidth={3} 
                    dot={{ r: 5, fill: '#a3e635', stroke: '#000', strokeWidth: 2 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="neo-card-violet">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-violet-400 border-2 border-black flex items-center justify-center">
              <Timer size={16} />
            </div>
            <h3 className="font-black">간헐적 단식 (16:8)</h3>
          </div>

          <div className="text-center mb-4">
            <span
              className={`neo-badge ${
                isFasting
                  ? fastingComplete
                    ? 'neo-badge-lime'
                    : 'neo-badge-orange'
                  : ''
              }`}
            >
              {isFasting ? (fastingComplete ? '✓ 식사 가능' : '⏱ 단식 중') : '대기 중'}
            </span>
          </div>

          <div className="text-center mb-4">
            <p className="text-5xl font-black font-mono tracking-wider">
              {isFasting ? formatTime(fastingComplete ? elapsed : remaining) : '00:00:00'}
            </p>
            <p className="text-xs font-bold text-gray-500 mt-2">
              {isFasting
                ? fastingComplete
                  ? '단식 완료 - 경과 시간'
                  : '남은 시간'
                : '단식을 시작하세요'}
            </p>
          </div>

          {isFasting && (
            <div className="w-full h-3 bg-white rounded-lg border-2 border-black overflow-hidden mb-4">
              <div
                className="h-full bg-violet-400 transition-all"
                style={{ width: `${fastingProgress}%` }}
              />
            </div>
          )}

          <button
            onClick={toggleFasting}
            className={`w-full py-3 rounded-xl text-sm font-black border-3 border-black transition-all ${
              isFasting
                ? 'bg-red-300 hover:bg-red-400 shadow-neo-sm hover:shadow-neo'
                : 'bg-violet-400 hover:bg-violet-300 shadow-neo-sm hover:shadow-neo'
            }`}
          >
            {isFasting ? '단식 종료' : '단식 시작'}
          </button>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-8 h-8 rounded-lg bg-cyan-300 border-2 border-black flex items-center justify-center">
              <Utensils size={16} />
            </div>
            <h3 className="font-black">추천 식단</h3>
          </div>
          <div className="space-y-3">
            {mealSuggestions.map((meal) => (
              <div key={meal.name} className={`neo-card ${meal.color} hover:-translate-y-1 transition-transform cursor-pointer`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-black text-base">{meal.name}</h4>
                  <span className="neo-badge">{meal.calories} kcal</span>
                </div>
                <p className="text-xs font-bold text-gray-600 mb-3">{meal.desc}</p>
                <div className="flex gap-4 text-xs font-bold text-gray-500">
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
