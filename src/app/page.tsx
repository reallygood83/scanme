'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Droplets,
  Activity,
  Utensils,
  Brain,
  ArrowDown,
  ArrowUp,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { storage, UricAcidEntry, GlucoseEntry, MealEntry } from '@/lib/storage';
import { getFlareRisk } from '@/lib/mockAI';
import BottomNav from '@/components/BottomNav';

export default function HomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [name, setName] = useState('');
  const [latestUric, setLatestUric] = useState<UricAcidEntry | null>(null);
  const [prevUric, setPrevUric] = useState<UricAcidEntry | null>(null);
  const [latestGlucose, setLatestGlucose] = useState<GlucoseEntry | null>(null);
  const [prevGlucose, setPrevGlucose] = useState<GlucoseEntry | null>(null);
  const [todayMeals, setTodayMeals] = useState<MealEntry[]>([]);
  const [flareRisk, setFlareRisk] = useState<{ level: 'low' | 'medium' | 'high'; message: string }>({
    level: 'low',
    message: '',
  });

  useEffect(() => {
    const profile = storage.getProfile();
    if (!profile.onboardingComplete) {
      router.replace('/onboarding');
      return;
    }

    // Seed mock data if no data exists
    const uricData = storage.getUricAcid();
    if (uricData.length === 0) {
      storage.seedMockData();
    }

    // Load data
    const uric = storage.getUricAcid();
    const glucose = storage.getGlucose();
    const meals = storage.getMeals();
    const today = new Date().toISOString().split('T')[0];

    setName(profile.name);

    if (uric.length > 0) {
      setLatestUric(uric[uric.length - 1]);
      if (uric.length > 1) setPrevUric(uric[uric.length - 2]);
    }

    if (glucose.length > 0) {
      setLatestGlucose(glucose[glucose.length - 1]);
      if (glucose.length > 1) setPrevGlucose(glucose[glucose.length - 2]);
    }

    setTodayMeals(meals.filter((m) => m.date === today));

    const latestUricValue = uric.length > 0 ? uric[uric.length - 1].value : 5.0;
    const recentMealNames = meals.slice(-5).map((m) => m.name);
    setFlareRisk(getFlareRisk(latestUricValue, recentMealNames));

    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-gray-400 text-sm">로딩 중...</div>
      </div>
    );
  }

  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  const uricColor =
    latestUric && latestUric.value >= 7.0
      ? 'text-red-500'
      : latestUric && latestUric.value >= 6.0
      ? 'text-yellow-500'
      : 'text-green-500';

  const uricBg =
    latestUric && latestUric.value >= 7.0
      ? 'bg-red-50'
      : latestUric && latestUric.value >= 6.0
      ? 'bg-yellow-50'
      : 'bg-green-50';

  const uricTrend =
    latestUric && prevUric
      ? latestUric.value < prevUric.value
        ? 'down'
        : latestUric.value > prevUric.value
        ? 'up'
        : 'same'
      : null;

  const glucoseTrend =
    latestGlucose && prevGlucose
      ? latestGlucose.value < prevGlucose.value
        ? 'down'
        : latestGlucose.value > prevGlucose.value
        ? 'up'
        : 'same'
      : null;

  const mealContextLabel: Record<string, string> = {
    fasting: '공복',
    before_meal: '식전',
    after_meal: '식후',
    bedtime: '취침 전',
  };

  const totalCalories = todayMeals.reduce((sum, m) => sum + m.calories, 0);

  const flareColor =
    flareRisk.level === 'high'
      ? 'bg-red-100 text-red-700'
      : flareRisk.level === 'medium'
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-green-100 text-green-700';

  const flareBadge =
    flareRisk.level === 'high'
      ? '높음'
      : flareRisk.level === 'medium'
      ? '보통'
      : '낮음';

  const quickActions = [
    { label: '요산 기록', href: '/record?tab=uric', icon: Droplets, color: 'text-blue-500 bg-blue-50' },
    { label: '혈당 기록', href: '/record?tab=glucose', icon: Activity, color: 'text-purple-500 bg-purple-50' },
    { label: '식사 기록', href: '/record?tab=meal', icon: Utensils, color: 'text-orange-500 bg-orange-50' },
    { label: 'AI 코치', href: '/coach', icon: Brain, color: 'text-emerald-500 bg-emerald-50' },
  ];

  const mealTypeIcon: Record<string, string> = {
    breakfast: '🍳',
    lunch: '🍱',
    dinner: '🍽️',
    snack: '🍪',
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-[430px] mx-auto px-4 pt-6 flex flex-col gap-4">
        {/* Top Greeting */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            안녕하세요, {name}님 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{dateStr}</p>
        </div>

        {/* Uric Acid Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full ${uricBg} flex items-center justify-center`}>
                <Droplets size={18} className={uricColor} />
              </div>
              <span className="text-sm font-medium text-gray-700">요산 수치</span>
            </div>
            {uricTrend && (
              <div className="flex items-center gap-1">
                {uricTrend === 'down' ? (
                  <ArrowDown size={14} className="text-green-500" />
                ) : uricTrend === 'up' ? (
                  <ArrowUp size={14} className="text-red-500" />
                ) : null}
                <span className="text-xs text-gray-400">
                  이전 대비
                </span>
              </div>
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-bold ${uricColor}`}>
              {latestUric ? latestUric.value.toFixed(1) : '--'}
            </span>
            <span className="text-sm text-gray-400">mg/dL</span>
          </div>
        </div>

        {/* Blood Glucose Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                <Activity size={18} className="text-purple-500" />
              </div>
              <span className="text-sm font-medium text-gray-700">혈당</span>
            </div>
            {glucoseTrend && (
              <div className="flex items-center gap-1">
                {glucoseTrend === 'down' ? (
                  <ArrowDown size={14} className="text-green-500" />
                ) : glucoseTrend === 'up' ? (
                  <ArrowUp size={14} className="text-red-500" />
                ) : null}
                <span className="text-xs text-gray-400">이전 대비</span>
              </div>
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-purple-600">
              {latestGlucose ? latestGlucose.value : '--'}
            </span>
            <span className="text-sm text-gray-400">mg/dL</span>
          </div>
          {latestGlucose && (
            <span className="text-xs text-gray-400 mt-1 inline-block">
              {mealContextLabel[latestGlucose.mealContext] || latestGlucose.mealContext}
            </span>
          )}
        </div>

        {/* Today Meals Summary */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
              <Utensils size={18} className="text-orange-500" />
            </div>
            <span className="text-sm font-medium text-gray-700">오늘의 식사</span>
          </div>
          {todayMeals.length > 0 ? (
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {todayMeals.map((meal) => (
                  <span key={meal.id} className="text-xl" title={meal.name}>
                    {mealTypeIcon[meal.type] || '🍽️'}
                  </span>
                ))}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">{todayMeals.length}</span>끼 기록
                </p>
                <p className="text-xs text-gray-400">총 {totalCalories} kcal</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">아직 기록된 식사가 없습니다</p>
          )}
        </div>

        {/* Flare Risk Indicator */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <AlertTriangle size={18} className="text-gray-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">통풍 발작 위험도</span>
            <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${flareColor}`}>
              {flareBadge}
            </span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{flareRisk.message}</p>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map(({ label, href, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-transform"
            >
              <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center`}>
                <Icon size={20} />
              </div>
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
