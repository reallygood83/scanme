'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity,
  ArrowRight,
  Brain,
  Droplets,
  HeartPulse,
  Salad,
  Sparkles,
  Syringe,
  Users,
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { summarizeGlucose, getLatestTrend, getTrendLabel } from '@/lib/glucose';
import { getFlareRisk } from '@/lib/mockAI';
import { storage, GlucoseEntry, MealEntry, UricAcidEntry } from '@/lib/storage';

const QUICK_ACTIONS = [
  { label: 'Libre 혈당', href: '/record?tab=glucose', icon: Activity, tone: 'bg-violet-50 text-violet-700' },
  { label: '요산 기록', href: '/record?tab=uric', icon: Droplets, tone: 'bg-sky-50 text-sky-700' },
  { label: '식사 분석', href: '/record?tab=meal', icon: Salad, tone: 'bg-amber-50 text-amber-700' },
  { label: 'AI 코치', href: '/coach', icon: Brain, tone: 'bg-emerald-50 text-emerald-700' },
];

export default function HomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [name, setName] = useState('');
  const [latestUric, setLatestUric] = useState<UricAcidEntry | null>(null);
  const [glucoseEntries, setGlucoseEntries] = useState<GlucoseEntry[]>([]);
  const [todayMeals, setTodayMeals] = useState<MealEntry[]>([]);
  const [familyCount, setFamilyCount] = useState(0);
  const [libreMeta, setLibreMeta] = useState(storage.getLibreImportMeta());

  useEffect(() => {
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
  }, [router]);

  const glucoseSummary = useMemo(() => summarizeGlucose(glucoseEntries), [glucoseEntries]);
  const latestGlucose = glucoseEntries.at(-1) ?? null;
  const latestTrend = useMemo(() => getLatestTrend(glucoseEntries), [glucoseEntries]);
  const flareRisk = useMemo(() => {
    const uricValue = latestUric?.value ?? 5.8;
    return getFlareRisk(uricValue, todayMeals.map((meal) => meal.name));
  }, [latestUric, todayMeals]);

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">UricAI 준비 중...</div>;
  }

  const todayLabel = new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date());

  const flareTone = flareRisk.level === 'high'
    ? 'bg-rose-50 text-rose-700'
    : flareRisk.level === 'medium'
      ? 'bg-amber-50 text-amber-700'
      : 'bg-emerald-50 text-emerald-700';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#eef6ff,transparent_42%),linear-gradient(180deg,#f8fbff_0%,#f4f7fb_45%,#f8fafc_100%)] pb-24">
      <div className="mx-auto flex max-w-[430px] flex-col gap-5 px-4 pb-6 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-500">Family Metabolic Care</p>
            <h1 className="mt-2 text-[28px] font-semibold leading-tight text-slate-950">{name}님, 오늘도 가족 건강을 같이 봅니다.</h1>
            <p className="mt-2 text-sm text-slate-500">{todayLabel} · 요산, 혈당, 식사, GLP-1 흐름을 한 번에 확인하세요.</p>
          </div>
          <Link href="/family" className="rounded-2xl bg-white/80 p-3 text-orange-500 shadow-sm ring-1 ring-white/80">
            <Users size={20} />
          </Link>
        </div>

        <section className="overflow-hidden rounded-[32px] bg-slate-950 px-5 py-5 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-sky-100">
                <Sparkles size={14} />
                {libreMeta ? 'Libre 데이터 연동됨' : '수동 + 샘플 데이터 모드'}
              </div>
              <p className="mt-4 text-sm text-slate-300">오늘의 핵심</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-4xl font-semibold">{latestGlucose?.value ?? '--'}</span>
                <span className="pb-1 text-sm text-slate-300">mg/dL</span>
              </div>
              <p className="mt-2 text-sm text-slate-300">{getTrendLabel(latestTrend)} · TIR {glucoseSummary.timeInRange}% · 평균 {glucoseSummary.average || '--'}mg/dL</p>
            </div>
            <div className="rounded-[28px] bg-white/10 p-4 backdrop-blur">
              <HeartPulse size={28} className="text-sky-200" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-[24px] bg-white/8 p-4">
              <p className="text-xs text-slate-300">최근 요산</p>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-2xl font-semibold">{latestUric ? latestUric.value.toFixed(1) : '--'}</span>
                <span className="pb-1 text-xs text-slate-400">mg/dL</span>
              </div>
            </div>
            <div className="rounded-[24px] bg-white/8 p-4">
              <p className="text-xs text-slate-300">오늘 식사</p>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-2xl font-semibold">{todayMeals.length}</span>
                <span className="pb-1 text-xs text-slate-400">끼</span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p className="text-xs font-medium text-slate-500">GMI 추정</p>
            <div className="mt-3 flex items-end gap-1">
              <span className="text-3xl font-semibold text-slate-900">{glucoseSummary.gmi || '--'}</span>
              <span className="pb-1 text-xs text-slate-500">%</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">Libre와 수동 기록 전체를 기준으로 계산합니다.</p>
          </div>
          <div className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p className="text-xs font-medium text-slate-500">가족 관리</p>
            <div className="mt-3 flex items-end gap-1">
              <span className="text-3xl font-semibold text-slate-900">{familyCount}</span>
              <span className="pb-1 text-xs text-slate-500">명</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">가족 식사 공유와 아이 모드를 함께 운영할 수 있습니다.</p>
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">오늘의 리스크 브리핑</p>
              <p className="mt-1 text-xs text-slate-500">통풍과 혈당을 같이 보는 UricAI 코칭 요약입니다.</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${flareTone}`}>{flareRisk.level === 'high' ? '높음' : flareRisk.level === 'medium' ? '보통' : '안정'}</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">{flareRisk.message}</p>
          {libreMeta && (
            <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
              최근 Libre 동기화: {libreMeta.fileName} · {libreMeta.readingCount}건 · {libreMeta.device || 'FreeStyle Libre'}
            </div>
          )}
        </section>

        <section className="grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.map(({ label, href, icon: Icon, tone }) => (
            <Link key={href} href={href} className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100 transition-transform active:scale-[0.98]">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
                <Icon size={20} />
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-900">{label}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                바로가기
                <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </section>

        <section className="rounded-[28px] bg-[linear-gradient(135deg,#fff8eb,#fff)] p-5 shadow-sm ring-1 ring-amber-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">GLP-1 + 혈당 + 요산</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">체중 감량 중 요산이 흔들리는 시점을 함께 보는 것이 UricAI의 차별점입니다.</p>
            </div>
            <Link href="/glp1" className="rounded-2xl bg-white p-3 text-teal-600 shadow-sm">
              <Syringe size={20} />
            </Link>
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
