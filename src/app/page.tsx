'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity,
  ArrowRight,
  Brain,
  Cloud,
  Droplets,
  HeartPulse,
  Salad,
  Sparkles,
  Syringe,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useFirebaseStatus } from '@/components/FirebaseBootstrap';
import { summarizeGlucose, getLatestTrend, getTrendLabel } from '@/lib/glucose';
import { getFlareRisk } from '@/lib/mockAI';
import { storage, GlucoseEntry, MealEntry, subscribeToStorageChanges, UricAcidEntry } from '@/lib/storage';

const QUICK_ACTIONS = [
  { label: 'Libre 혈당', href: '/record?tab=glucose', icon: Activity, color: 'neo-card-cyan' },
  { label: '요산 기록', href: '/record?tab=uric', icon: Droplets, color: 'neo-card-violet' },
  { label: '식사 분석', href: '/record?tab=meal', icon: Salad, color: 'neo-card-orange' },
  { label: 'AI 코치', href: '/coach', icon: Brain, color: 'neo-card-lime' },
];

export default function HomePage() {
  const router = useRouter();
  const { status: cloud } = useFirebaseStatus();
  const [ready, setReady] = useState(false);
  const [name, setName] = useState('');
  const [latestUric, setLatestUric] = useState<UricAcidEntry | null>(null);
  const [glucoseEntries, setGlucoseEntries] = useState<GlucoseEntry[]>([]);
  const [todayMeals, setTodayMeals] = useState<MealEntry[]>([]);
  const [familyCount, setFamilyCount] = useState(0);
  const [libreMeta, setLibreMeta] = useState(storage.getLibreImportMeta());

  useEffect(() => {
    const load = () => {
      const profile = storage.getProfile();
      if (!profile.onboardingComplete) {
        router.replace('/onboarding');
        return;
      }

      if (storage.getUricAcid().length === 0) {
        storage.seedMockData();
      }

      const uric = storage.getUricAcid();
      const glucose = storage.getGlucose();
      const meals = storage.getMeals();
      const family = storage.getFamily();
      const today = new Date().toISOString().split('T')[0];

      setName(profile.name);
      setLatestUric(uric.at(-1) ?? null);
      setGlucoseEntries(glucose);
      setTodayMeals(meals.filter((meal) => meal.date === today));
      setFamilyCount(family.length + 1);
      setLibreMeta(storage.getLibreImportMeta());
      setReady(true);
    };

    load();
    return subscribeToStorageChanges(load);
  }, [router]);

  const glucoseSummary = useMemo(() => summarizeGlucose(glucoseEntries), [glucoseEntries]);
  const latestGlucose = glucoseEntries.at(-1) ?? null;
  const latestTrend = useMemo(() => getLatestTrend(glucoseEntries), [glucoseEntries]);
  const flareRisk = useMemo(() => {
    const uricValue = latestUric?.value ?? 5.8;
    return getFlareRisk(uricValue, todayMeals.map((meal) => meal.name));
  }, [latestUric, todayMeals]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="neo-card neo-animate-scale-in p-8 text-center">
          <div className="neo-spinner neo-spinner-lg mx-auto mb-4" />
          <p className="neo-subtitle">UricAI 준비 중...</p>
        </div>
      </div>
    );
  }

  const todayLabel = new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date());

  const getRiskBadge = () => {
    if (flareRisk.level === 'high') return 'neo-badge-rose';
    if (flareRisk.level === 'medium') return 'neo-badge-orange';
    return 'neo-badge-lime';
  };

  const getRiskLabel = () => {
    if (flareRisk.level === 'high') return '주의 필요';
    if (flareRisk.level === 'medium') return '보통';
    return '안정';
  };

  return (
    <div className="min-h-screen pb-28 lg:pb-8">
      <div className="neo-stagger mx-auto flex max-w-[500px] flex-col gap-5 px-4 py-6 lg:max-w-none lg:px-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <div className="neo-badge-dark mb-3">
              <Sparkles size={12} />
              FAMILY HEALTH
            </div>
            <h1 className="neo-title-lg">{name}님,<br />오늘도 건강하세요</h1>
            <p className="neo-body mt-3 text-slate-600">
              {todayLabel} · 요산, 혈당, 식사를 한 번에 확인하세요.
            </p>
          </div>
          <Link href="/family" className="neo-icon-btn">
            <Users size={22} />
          </Link>
        </header>

        <section className="neo-card-dark neo-animate-glow p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="neo-badge-lime mb-4">
                <Zap size={12} />
                {libreMeta ? 'LIBRE 연동' : '수동 모드'}
              </div>
              <p className="neo-caption text-slate-400">현재 혈당</p>
              <div className="mt-2 flex items-end gap-3">
                <span className="neo-stat-value">{latestGlucose?.value ?? '--'}</span>
                <span className="mb-2 text-lg font-semibold text-slate-400">mg/dL</span>
                {latestTrend === 'rising' && <TrendingUp size={28} className="mb-2 text-orange-400" />}
                {latestTrend === 'falling' && <TrendingDown size={28} className="mb-2 text-cyan-400" />}
              </div>
              <p className="neo-body mt-3 text-slate-300">
                {getTrendLabel(latestTrend)} · TIR {glucoseSummary.timeInRange}% · 평균 {glucoseSummary.average || '--'}mg/dL
              </p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-3 border-lime-400 bg-slate-800">
              <HeartPulse size={32} className="text-lime-400" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border-2 border-slate-700 bg-slate-800 p-4">
              <p className="text-xs font-semibold text-slate-400">최근 요산</p>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-2xl font-black">{latestUric ? latestUric.value.toFixed(1) : '--'}</span>
                <span className="mb-0.5 text-sm font-medium text-slate-400">mg/dL</span>
              </div>
            </div>
            <div className="rounded-xl border-2 border-slate-700 bg-slate-800 p-4">
              <p className="text-xs font-semibold text-slate-400">오늘 식사</p>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-2xl font-black">{todayMeals.length}</span>
                <span className="mb-0.5 text-sm font-medium text-slate-400">끼</span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
          <div className="neo-card p-5">
            <p className="neo-caption">GMI 추정</p>
            <div className="mt-3 flex items-end gap-1">
              <span className="text-4xl font-black">{glucoseSummary.gmi || '--'}</span>
              <span className="mb-1 text-lg font-semibold text-slate-500">%</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Libre + 수동 기록 기준
            </p>
          </div>
          <div className="neo-card p-5">
            <p className="neo-caption">가족 관리</p>
            <div className="mt-3 flex items-end gap-1">
              <span className="text-4xl font-black">{familyCount}</span>
              <span className="mb-1 text-lg font-semibold text-slate-500">명</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              가족과 함께 건강 관리
            </p>
          </div>
        </section>

        <section className="neo-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="neo-subtitle">오늘의 리스크 브리핑</p>
              <p className="mt-1 text-sm text-slate-500">통풍과 혈당을 함께 분석한 AI 코칭</p>
            </div>
            <span className={`neo-badge ${getRiskBadge()}`}>{getRiskLabel()}</span>
          </div>
          <p className="neo-body mt-4 text-slate-700">{flareRisk.message}</p>
          {libreMeta && (
            <div className="mt-4 rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold text-slate-600">
                최근 Libre: {libreMeta.fileName} · {libreMeta.readingCount}건
              </p>
            </div>
          )}
        </section>

        <section className="neo-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="neo-subtitle">계정 및 동기화</p>
              <p className="mt-1 text-sm text-slate-500">
                Google 계정을 연결하여 데이터를 안전하게 백업하세요.
              </p>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black ${cloud.isAnonymous ? 'bg-slate-100' : 'bg-lime-300'}`}>
              <Cloud size={22} />
            </div>
          </div>
          <div className="mt-4 rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm font-medium">
              {cloud.isAnonymous 
                ? '익명 Firebase 세션으로 동기화 중' 
                : `${cloud.displayName || cloud.email || 'Google 계정'}으로 동기화 중`
              }
            </p>
          </div>
          {cloud.lastSyncedAt && (
            <p className="mt-3 text-xs text-slate-400">
              최근 동기화: {new Date(cloud.lastSyncedAt).toLocaleString('ko-KR')}
            </p>
          )}
          <Link href="/login" className="neo-btn neo-btn-primary mt-4 w-full">
            {cloud.isAnonymous ? 'Google 계정 연결하기' : '계정 상태 확인'}
            <ArrowRight size={18} />
          </Link>
        </section>

        <section className="grid grid-cols-2 gap-4">
          {QUICK_ACTIONS.map(({ label, href, icon: Icon, color }) => (
            <Link 
              key={href} 
              href={href} 
              className={`${color} p-5 transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_rgba(0,0,0,1)]`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black bg-white">
                <Icon size={24} />
              </div>
              <p className="mt-4 text-base font-bold">{label}</p>
              <div className="mt-2 flex items-center gap-1 text-sm font-semibold">
                바로가기
                <ArrowRight size={16} />
              </div>
            </Link>
          ))}
        </section>

        <section className="neo-card-orange p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="neo-subtitle">GLP-1 + 혈당 + 요산</p>
              <p className="neo-body mt-2 text-slate-800">
                체중 감량 중 요산이 흔들리는 시점을 함께 보는 것이 UricAI의 차별점입니다.
              </p>
            </div>
            <Link href="/glp1" className="neo-icon-btn">
              <Syringe size={22} />
            </Link>
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
