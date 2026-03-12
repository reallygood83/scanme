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
  Syringe,
  TrendingDown,
  TrendingUp,
  Minus,
  BarChart3,
  Users,
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
  const [familyCount, setFamilyCount] = useState(0);

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
      const family = storage.getFamily();
      const today = new Date().toISOString().split('T')[0];

      setName(updatedProfile.name);
      setLatestUric(uric.at(-1) ?? null);
      setGlucoseEntries(glucose);
      setTodayMeals(meals.filter((meal) => meal.date === today));
      setFamilyCount(family.length + 1);
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
        <div className="neo-spinner neo-spinner-lg" />
      </div>
    );
  }

  const getTrendIcon = () => {
    if (latestTrend === 'rising' || latestTrend === 'rising_fast') 
      return <TrendingUp size={20} className="text-orange-500" />;
    if (latestTrend === 'falling' || latestTrend === 'falling_fast') 
      return <TrendingDown size={20} className="text-cyan-500" />;
    return <Minus size={20} className="text-slate-400" />;
  };

  const getRiskBadge = () => {
    if (flareRisk.level === 'high') return { bg: 'bg-rose-100 border-rose-300', text: 'text-rose-700', label: '⚠️ 주의' };
    if (flareRisk.level === 'medium') return { bg: 'bg-orange-100 border-orange-300', text: 'text-orange-700', label: '📊 보통' };
    return { bg: 'bg-lime-100 border-lime-300', text: 'text-lime-700', label: '✅ 안정' };
  };

  const risk = getRiskBadge();

  return (
    <div className="pb-28 lg:pb-0">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">안녕하세요, {name}님</p>
          <h1 className="mt-1 text-3xl font-black">건강 대시보드</h1>
        </div>
        <div className={`rounded-full border-2 px-4 py-1.5 text-sm font-bold ${risk.bg} ${risk.text}`}>
          {risk.label}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="neo-card-dark p-6 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400">현재 혈당</p>
              <div className="mt-1 flex items-end gap-2">
                <span className="text-5xl font-black text-white">{latestGlucose?.value ?? '--'}</span>
                <span className="mb-1 text-slate-400">mg/dL</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                {getTrendIcon()}
                <span>{getTrendLabel(latestTrend)}</span>
              </div>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-lime-400 bg-slate-800">
              <HeartPulse size={28} className="text-lime-400" />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-700 pt-5">
            <div>
              <p className="text-xs text-slate-500">TIR</p>
              <p className="text-xl font-bold text-white">{glucoseSummary.timeInRange}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">평균</p>
              <p className="text-xl font-bold text-white">{glucoseSummary.average || '--'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">GMI</p>
              <p className="text-xl font-bold text-white">{glucoseSummary.gmi || '--'}%</p>
            </div>
          </div>
        </div>

        <div className="neo-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">최근 요산</p>
              <div className="mt-1 flex items-end gap-1">
                <span className="text-4xl font-black">{latestUric?.value.toFixed(1) ?? '--'}</span>
                <span className="mb-1 text-slate-400">mg/dL</span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black bg-violet-200">
              <Droplets size={24} />
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-500">{flareRisk.message}</p>
        </div>

        <div className="neo-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">오늘 식사</p>
              <div className="mt-1 flex items-end gap-1">
                <span className="text-4xl font-black">{todayMeals.length}</span>
                <span className="mb-1 text-slate-400">끼</span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black bg-orange-200">
              <Salad size={24} />
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            {todayMeals.reduce((sum, m) => sum + m.calories, 0)} kcal 섭취
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {[
          { label: 'Libre 업로드', href: '/record?tab=glucose', icon: Activity, bg: 'bg-cyan-200' },
          { label: '요산 기록', href: '/record?tab=uric', icon: Droplets, bg: 'bg-violet-200' },
          { label: '식사 기록', href: '/record?tab=meal', icon: Salad, bg: 'bg-orange-200' },
          { label: 'AI 코치', href: '/coach', icon: Brain, bg: 'bg-lime-200' },
          { label: 'GLP-1', href: '/glp1', icon: Syringe, bg: 'bg-rose-200' },
          { label: '주간 리포트', href: '/report', icon: BarChart3, bg: 'bg-slate-200' },
        ].map(({ label, href, icon: Icon, bg }) => (
          <Link 
            key={href} 
            href={href} 
            className="neo-card flex items-center gap-3 p-4 transition-all hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)]"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black ${bg}`}>
              <Icon size={20} />
            </div>
            <span className="font-bold">{label}</span>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="neo-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">혈당 추이</h2>
            <Link href="/report" className="text-sm font-semibold text-slate-500 hover:text-black">
              자세히 보기 →
            </Link>
          </div>
          <div className="flex h-32 items-end gap-2">
            {Array.from({ length: 14 }).map((_, i) => {
              const height = 30 + Math.random() * 70;
              const isHigh = height > 70;
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div 
                    className={`w-full rounded-t-md border-2 border-black ${isHigh ? 'bg-orange-300' : 'bg-lime-300'}`}
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[10px] text-slate-400">{i + 1}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="neo-card-lime p-6">
          <h2 className="text-lg font-bold">가족 관리</h2>
          <p className="mt-2 text-sm text-slate-700">
            {familyCount}명의 가족 구성원과 함께 건강을 관리하세요.
          </p>
          <Link href="/family" className="neo-btn neo-btn-dark mt-4 w-full">
            <Users size={18} />
            가족 보기
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
