'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Brain,
  Droplets,
  HeartPulse,
  Salad,
  Sparkles,
  Syringe,
  TrendingDown,
  TrendingUp,
  Minus,
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { summarizeGlucose, getLatestTrend, getTrendLabel } from '@/lib/glucose';
import { getFlareRisk } from '@/lib/mockAI';
import { storage, GlucoseEntry, MealEntry, subscribeToStorageChanges, UricAcidEntry } from '@/lib/storage';
import { loadDemoData } from '@/lib/demo-data';

export default function HomePage() {
  const [ready, setReady] = useState(false);
  const [name, setName] = useState('');
  const [latestUric, setLatestUric] = useState<UricAcidEntry | null>(null);
  const [glucoseEntries, setGlucoseEntries] = useState<GlucoseEntry[]>([]);
  const [todayMeals, setTodayMeals] = useState<MealEntry[]>([]);

  useEffect(() => {
    const load = () => {
      const profile = storage.getProfile();
      
      if (!profile.onboardingComplete) {
        loadDemoData();
      } else if (storage.getUricAcid().length === 0) {
        storage.seedMockData();
      }
      
      const updatedProfile = storage.getProfile();

      const uric = storage.getUricAcid();
      const glucose = storage.getGlucose();
      const meals = storage.getMeals();
      const today = new Date().toISOString().split('T')[0];

      setName(updatedProfile.name);
      setLatestUric(uric.at(-1) ?? null);
      setGlucoseEntries(glucose);
      setTodayMeals(meals.filter((meal) => meal.date === today));
      setReady(true);
    };

    load();
    return subscribeToStorageChanges(load);
  }, []);

  const glucoseSummary = useMemo(() => summarizeGlucose(glucoseEntries), [glucoseEntries]);
  const latestGlucose = glucoseEntries.at(-1) ?? null;
  const latestTrend = useMemo(() => getLatestTrend(glucoseEntries), [glucoseEntries]);
  const flareRisk = useMemo(() => {
    const uricValue = latestUric?.value ?? 5.8;
    return getFlareRisk(uricValue, todayMeals.map((meal) => meal.name));
  }, [latestUric, todayMeals]);

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="neo-spinner neo-spinner-lg mx-auto mb-4" />
          <p className="font-semibold text-slate-600">데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  const getTrendIcon = () => {
    if (latestTrend === 'rising' || latestTrend === 'rising_fast') 
      return <TrendingUp size={24} className="text-orange-500" />;
    if (latestTrend === 'falling' || latestTrend === 'falling_fast') 
      return <TrendingDown size={24} className="text-cyan-500" />;
    return <Minus size={24} className="text-slate-400" />;
  };

  const getRiskColor = () => {
    if (flareRisk.level === 'high') return 'bg-rose-100 border-rose-300 text-rose-700';
    if (flareRisk.level === 'medium') return 'bg-orange-100 border-orange-300 text-orange-700';
    return 'bg-lime-100 border-lime-300 text-lime-700';
  };

  return (
    <div className="pb-28 lg:pb-0">
      <div className="mb-8">
        <p className="text-sm font-semibold text-slate-500">안녕하세요,</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight lg:text-4xl">
          {name}님의 건강 대시보드
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="neo-card-dark p-6 lg:p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">현재 혈당</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-5xl font-black text-white lg:text-6xl">
                  {latestGlucose?.value ?? '--'}
                </span>
                <span className="mb-2 text-lg text-slate-400">mg/dL</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {getTrendIcon()}
                <span className="text-sm font-semibold text-slate-300">
                  {getTrendLabel(latestTrend)}
                </span>
              </div>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-lime-400 bg-slate-800">
              <HeartPulse size={28} className="text-lime-400" />
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-700 pt-6">
            <div>
              <p className="text-xs text-slate-500">TIR</p>
              <p className="mt-1 text-xl font-bold text-white">{glucoseSummary.timeInRange}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">평균</p>
              <p className="mt-1 text-xl font-bold text-white">{glucoseSummary.average || '--'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">GMI</p>
              <p className="mt-1 text-xl font-bold text-white">{glucoseSummary.gmi || '--'}%</p>
            </div>
          </div>
        </div>

        <div className="neo-card p-6 lg:p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">최근 요산</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-5xl font-black lg:text-6xl">
                  {latestUric?.value.toFixed(1) ?? '--'}
                </span>
                <span className="mb-2 text-lg text-slate-400">mg/dL</span>
              </div>
              <p className="mt-3 text-sm text-slate-500">
                {latestUric?.date ? `${latestUric.date} 측정` : '데이터 없음'}
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-black bg-violet-200">
              <Droplets size={28} />
            </div>
          </div>

          <div className={`mt-6 rounded-xl border-2 p-4 ${getRiskColor()}`}>
            <p className="text-sm font-bold">
              {flareRisk.level === 'high' ? '⚠️ 주의 필요' : 
               flareRisk.level === 'medium' ? '📊 보통' : '✅ 안정'}
            </p>
            <p className="mt-1 text-sm">{flareRisk.message}</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-bold">빠른 액션</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Libre 업로드', href: '/record?tab=glucose', icon: Activity, color: 'neo-card-cyan' },
            { label: '요산 기록', href: '/record?tab=uric', icon: Droplets, color: 'neo-card-violet' },
            { label: '식사 기록', href: '/record?tab=meal', icon: Salad, color: 'neo-card-orange' },
            { label: 'AI 코치', href: '/coach', icon: Brain, color: 'neo-card-lime' },
          ].map(({ label, href, icon: Icon, color }) => (
            <Link 
              key={href} 
              href={href} 
              className={`${color} flex flex-col items-center p-5 text-center transition-all hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)]`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black bg-white">
                <Icon size={24} />
              </div>
              <p className="mt-3 text-sm font-bold">{label}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-bold">오늘의 요약</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="neo-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-orange-200">
                <Salad size={20} />
              </div>
              <div>
                <p className="text-2xl font-black">{todayMeals.length}</p>
                <p className="text-sm text-slate-500">오늘 식사</p>
              </div>
            </div>
          </div>
          <div className="neo-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-cyan-200">
                <Activity size={20} />
              </div>
              <div>
                <p className="text-2xl font-black">{glucoseSummary.totalCount}</p>
                <p className="text-sm text-slate-500">혈당 기록</p>
              </div>
            </div>
          </div>
          <div className="neo-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-violet-200">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-2xl font-black">{glucoseSummary.spikeCount}</p>
                <p className="text-sm text-slate-500">혈당 스파이크</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 hidden lg:block">
        <Link href="/report" className="neo-btn neo-btn-dark w-full justify-center py-4">
          주간 리포트 보기
          <ArrowRight size={18} />
        </Link>
      </div>

      <BottomNav />
    </div>
  );
}
