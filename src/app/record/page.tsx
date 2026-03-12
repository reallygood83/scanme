'use client';

import { useState, useEffect, useCallback, Suspense, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { storage, subscribeToStorageChanges, UricAcidEntry, GlucoseEntry, MealEntry } from '@/lib/storage';
import { analyzeMeal } from '@/lib/mockAI';
import { getLatestTrend, getSourceLabel, getTodaySeries, getTrendLabel, summarizeGlucose } from '@/lib/glucose';
import { parseLibreFile } from '@/lib/libre';
import BottomNav from '@/components/BottomNav';
import { Activity, ArrowLeft, Camera, FileUp, ShieldCheck, Sparkles, TriangleAlert, Waves, Zap } from 'lucide-react';
import Link from 'next/link';

type TabKey = 'uric' | 'glucose' | 'meal';

const TAB_LIST: { key: TabKey; label: string }[] = [
  { key: 'uric', label: '요산' },
  { key: 'glucose', label: '혈당' },
  { key: 'meal', label: '식사' },
];

function getUricBadge(v: number) {
  if (v < 6.0) return 'neo-badge-lime';
  if (v <= 7.0) return 'neo-badge-orange';
  return 'neo-badge-rose';
}

function getGlucoseBadge(v: number) {
  if (v < 100) return 'neo-badge-lime';
  if (v <= 140) return 'neo-badge-orange';
  return 'neo-badge-rose';
}

const MEAL_CONTEXT_LABELS: Record<string, string> = {
  fasting: '공복',
  before_meal: '식전',
  after_meal: '식후',
  bedtime: '취침전',
  continuous: '연속측정',
};

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: '아침',
  lunch: '점심',
  dinner: '저녁',
  snack: '간식',
};

const PURINE_BADGE: Record<string, { label: string; cls: string }> = {
  low: { label: '저', cls: 'neo-badge-lime' },
  medium: { label: '중', cls: 'neo-badge-orange' },
  high: { label: '고', cls: 'neo-badge-rose' },
};

function UricAcidTab() {
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [entries, setEntries] = useState<UricAcidEntry[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const load = useCallback(() => {
    setEntries(storage.getUricAcid());
  }, []);

  useEffect(() => {
    setIsMounted(true);
    const now = new Date();
    setDate(now.toISOString().split('T')[0]);
    setTime(now.toTimeString().slice(0, 5));
    load();
    return subscribeToStorageChanges(load);
  }, [load]);

  const handleSave = () => {
    const v = parseFloat(value);
    if (isNaN(v) || !date || !time) return;
    const entry: UricAcidEntry = {
      id: `ua-${Date.now()}`,
      value: v,
      date,
      time,
      ...(note ? { note } : {}),
    };
    storage.addUricAcid(entry);
    setValue('');
    setNote('');
    load();
  };

  const chartData = [...entries]
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
    .slice(-7)
    .map((e) => ({
      label: e.date.slice(5),
      value: e.value,
    }));

  const recent = [...entries]
    .sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`))
    .slice(0, 10);

  return (
    <div className="space-y-5">
      <div className="neo-card p-5">
        <p className="neo-subtitle">요산 수치 입력</p>
        <div className="mt-4 space-y-3">
          <input
            type="number"
            step={0.1}
            placeholder="mg/dL"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="neo-input"
          />
          <div className="flex gap-3">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="neo-input flex-1"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="neo-input flex-1"
            />
          </div>
          <input
            type="text"
            placeholder="메모 (선택)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="neo-input"
          />
          <button onClick={handleSave} className="neo-btn neo-btn-primary w-full">
            저장
          </button>
        </div>
      </div>

      {isMounted && chartData.length > 0 && (
        <div className="neo-card p-5">
          <p className="neo-subtitle mb-4">최근 7건 추이</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fontWeight: 600 }} />
              <YAxis domain={[4, 10]} tick={{ fontSize: 12, fontWeight: 600 }} />
              <Tooltip />
              <ReferenceLine y={6.0} stroke="#84cc16" strokeWidth={2} strokeDasharray="4 4" />
              <ReferenceLine y={7.0} stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0f172a"
                strokeWidth={3}
                dot={{ r: 5, fill: '#0f172a', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="neo-card p-5">
        <p className="neo-subtitle mb-4">기록 내역</p>
        {recent.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-slate-200 py-8 text-center">
            <p className="text-sm font-semibold text-slate-400">기록이 없습니다</p>
          </div>
        )}
        <ul className="space-y-3">
          {recent.map((e) => (
            <li key={e.id} className="flex items-center justify-between rounded-xl border-2 border-black bg-white p-4">
              <div className="flex items-center gap-3">
                <span className={`neo-badge ${getUricBadge(e.value)}`}>{e.value}</span>
                <span className="text-sm font-semibold">mg/dL</span>
                {e.note && <span className="text-sm text-slate-500">{e.note}</span>}
              </div>
              <span className="text-xs font-semibold text-slate-500">{e.date} {e.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function GlucoseTab() {
  const [value, setValue] = useState('');
  const [mealContext, setMealContext] = useState<GlucoseEntry['mealContext']>('fasting');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [entries, setEntries] = useState<GlucoseEntry[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [libreMeta, setLibreMeta] = useState(storage.getLibreImportMeta());
  const [importError, setImportError] = useState('');
  const [importMessage, setImportMessage] = useState('');
  const [importing, setImporting] = useState(false);
  const importInProgress = useRef(false);

  const load = useCallback(() => {
    setEntries(storage.getGlucose());
    setLibreMeta(storage.getLibreImportMeta());
  }, []);

  useEffect(() => {
    setIsMounted(true);
    const now = new Date();
    setDate(now.toISOString().split('T')[0]);
    setTime(now.toTimeString().slice(0, 5));
    load();
  }, [load]);

  const handleSave = () => {
    const v = parseFloat(value);
    if (isNaN(v) || !date || !time) return;
    const entry: GlucoseEntry = {
      id: `gl-${Date.now()}`,
      value: v,
      date,
      time,
      mealContext,
      source: 'manual',
    };
    storage.addGlucose(entry);
    setValue('');
    load();
  };

  const handleLibreImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (importInProgress.current) return;

    importInProgress.current = true;
    setImporting(true);
    setImportError('');
    setImportMessage('');

    try {
      const text = await file.text();
      const result = parseLibreFile(text, file.name);
      storage.importLibreGlucose(result.entries, result.meta);
      setImportMessage(`${result.entries.length}건의 Libre 혈당 데이터를 가져왔습니다.${result.meta.skippedCount > 0 ? ` (${result.meta.skippedCount}건은 형식 오류로 제외)` : ''}`);
      load();
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Libre 파일을 읽는 중 문제가 발생했습니다.');
    } finally {
      event.target.value = '';
      importInProgress.current = false;
      setImporting(false);
    }
  };

  const chartData = useMemo(() => getTodaySeries(entries), [entries]);
  const summary = useMemo(() => summarizeGlucose(entries), [entries]);
  const latestTrend = useMemo(() => getLatestTrend(entries), [entries]);

  const recent = [...entries]
    .sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`))
    .slice(0, 10);

  const libreReadings = entries.filter((entry) => entry.source === 'libre').length;

  return (
    <div className="space-y-5">
      <div className="neo-card-cyan p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="neo-badge-dark mb-3">
              <Zap size={12} />
              LIBRE IMPORT
            </div>
            <p className="neo-subtitle">실제 Libre 데이터 가져오기</p>
            <p className="neo-body mt-2 text-slate-700">
              LibreView에서 내보낸 원본 파일을 업로드하세요.
            </p>
          </div>
          <div className="neo-icon-btn">
            <FileUp size={22} />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="neo-btn neo-btn-dark w-full cursor-pointer">
            <FileUp size={16} />
            {importing ? '가져오는 중...' : 'Libre 파일 업로드'}
            <input type="file" accept=".csv,.tsv,text/csv,text/tab-separated-values" className="hidden" onChange={handleLibreImport} />
          </label>
          <div className="rounded-xl border-2 border-black bg-white p-3 text-sm">
            {libreMeta ? (
              <div>
                <p className="font-bold">{libreMeta.readingCount}건 동기화됨</p>
                <p className="mt-1 text-xs text-slate-500">{libreMeta.fileName}</p>
              </div>
            ) : (
              <p className="font-semibold text-slate-500">아직 연동 전</p>
            )}
          </div>
        </div>

        {importMessage && <div className="neo-badge-lime mt-3 w-full justify-center py-3">{importMessage}</div>}
        {importError && <div className="neo-badge-rose mt-3 w-full justify-center py-3">{importError}</div>}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="neo-card p-4">
          <p className="neo-caption">평균 혈당</p>
          <p className="mt-2 text-2xl font-black">{summary.totalCount ? summary.average : '--'}</p>
        </div>
        <div className="neo-card p-4">
          <p className="neo-caption">TIR</p>
          <p className="mt-2 text-2xl font-black">{summary.timeInRange}%</p>
        </div>
        <div className="neo-card p-4">
          <p className="neo-caption">GMI</p>
          <p className="mt-2 text-2xl font-black">{summary.totalCount ? summary.gmi : '--'}%</p>
        </div>
        <div className="neo-card p-4">
          <p className="neo-caption">스파이크</p>
          <p className="mt-2 text-2xl font-black">{summary.spikeCount}회</p>
        </div>
      </div>

      <div className="neo-card p-5">
        <div className="flex items-center justify-between">
          <p className="neo-subtitle">오늘의 혈당 흐름</p>
          <span className="neo-badge-violet">{getTrendLabel(latestTrend)}</span>
        </div>

        {isMounted && chartData.length > 0 ? (
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fontWeight: 600 }} />
                <YAxis domain={[50, 250]} tick={{ fontSize: 12, fontWeight: 600 }} />
                <Tooltip />
                <ReferenceLine y={70} stroke="#84cc16" strokeWidth={2} strokeDasharray="4 4" />
                <ReferenceLine y={180} stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="value" stroke="#0f172a" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 6, fill: '#0f172a' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border-2 border-dashed border-slate-200 py-10 text-center">
            <p className="text-sm font-semibold text-slate-400">오늘 표시할 혈당 데이터가 없습니다</p>
          </div>
        )}
      </div>

      <div className="neo-card p-5">
        <div className="flex items-center justify-between">
          <p className="neo-subtitle">수동 혈당 입력</p>
          <span className="neo-badge-dark">{libreReadings}건 Libre</span>
        </div>

        <div className="mt-4 space-y-3">
          <input
            type="number"
            placeholder="mg/dL"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="neo-input"
          />
          <select
            value={mealContext}
            onChange={(e) => setMealContext(e.target.value as GlucoseEntry['mealContext'])}
            className="neo-select"
          >
            <option value="fasting">공복</option>
            <option value="before_meal">식전</option>
            <option value="after_meal">식후</option>
            <option value="bedtime">취침전</option>
          </select>
          <div className="flex gap-3">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="neo-input flex-1" />
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="neo-input flex-1" />
          </div>
          <button onClick={handleSave} className="neo-btn neo-btn-primary w-full">
            수동 기록 저장
          </button>
        </div>
      </div>

      <div className="neo-card p-5">
        <p className="neo-subtitle mb-4">최근 혈당 기록</p>
        {recent.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 py-8 text-center">
            <p className="text-sm font-semibold text-slate-400">기록이 없습니다</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {recent.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between rounded-xl border-2 border-black bg-white p-4">
                <div className="flex items-center gap-3">
                  <span className={`neo-badge ${getGlucoseBadge(entry.value)}`}>{entry.value}</span>
                  <span className="text-xs font-bold">{getSourceLabel(entry)}</span>
                  <span className="text-xs text-slate-500">{MEAL_CONTEXT_LABELS[entry.mealContext]}</span>
                </div>
                <span className="text-xs font-semibold text-slate-500">{entry.date} {entry.time}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function MealTab() {
  const [mealName, setMealName] = useState('');
  const [mealType, setMealType] = useState<MealEntry['type']>('lunch');
  const [photo, setPhoto] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeMeal> | null>(null);
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  const load = useCallback(() => {
    setEntries(storage.getMeals());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAnalyze = () => {
    if (!mealName.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      setAnalysis(analyzeMeal(mealName));
      setAnalyzing(false);
    }, 600);
  };

  const handleSave = () => {
    if (!mealName.trim()) return;
    const result = analysis || analyzeMeal(mealName);
    const now = new Date();
    const entry: MealEntry = {
      id: `m-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
      type: mealType,
      name: mealName,
      ...(photo ? { photo } : {}),
      calories: result.calories,
      purineLevel: result.purineLevel,
      gi: result.gi,
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat,
      recommendation: result.recommendation,
    };
    storage.addMeal(entry);
    setMealName('');
    setPhoto(null);
    setAnalysis(null);
    load();
  };

  const today = new Date().toISOString().split('T')[0];
  const todayMeals = entries.filter((e) => e.date === today);

  return (
    <div className="space-y-5">
      <div className="neo-card p-5">
        <p className="neo-subtitle mb-4">식사 기록</p>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-3 border-dashed border-slate-300 bg-slate-50 p-6 transition-all hover:border-lime-400 hover:bg-lime-50">
          {photo ? (
            <img src={photo} alt="식사 사진" className="max-h-40 rounded-lg object-cover" />
          ) : (
            <>
              <Camera size={32} className="text-slate-400" />
              <p className="mt-2 text-sm font-semibold text-slate-500">사진 촬영 / 업로드</p>
            </>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </label>

        <div className="mt-4 space-y-3">
          <input
            type="text"
            placeholder="음식 이름 (예: 현미밥, 삼겹살)"
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            className="neo-input"
          />

          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealEntry['type'])}
            className="neo-select"
          >
            <option value="breakfast">아침</option>
            <option value="lunch">점심</option>
            <option value="dinner">저녁</option>
            <option value="snack">간식</option>
          </select>

          <button
            onClick={handleAnalyze}
            disabled={!mealName.trim() || analyzing}
            className="neo-btn neo-btn-cyan w-full disabled:opacity-50"
          >
            <Sparkles size={16} />
            {analyzing ? '분석 중...' : 'AI 분석'}
          </button>

          {analysis && (
            <div className="rounded-xl border-2 border-black bg-lime-50 p-4">
              <div className="flex flex-wrap gap-2">
                <span className={`neo-badge ${PURINE_BADGE[analysis.purineLevel].cls}`}>
                  퓨린 {PURINE_BADGE[analysis.purineLevel].label}
                </span>
                <span className="neo-badge-cyan">{analysis.calories} kcal</span>
                <span className="neo-badge-orange">GI {analysis.gi}</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-lg border-2 border-black bg-white p-2">
                  <p className="text-xs text-slate-500">단백질</p>
                  <p className="font-black">{analysis.protein}g</p>
                </div>
                <div className="rounded-lg border-2 border-black bg-white p-2">
                  <p className="text-xs text-slate-500">탄수화물</p>
                  <p className="font-black">{analysis.carbs}g</p>
                </div>
                <div className="rounded-lg border-2 border-black bg-white p-2">
                  <p className="text-xs text-slate-500">지방</p>
                  <p className="font-black">{analysis.fat}g</p>
                </div>
              </div>
              <p className="neo-body mt-3">{analysis.recommendation}</p>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={!mealName.trim()}
            className="neo-btn neo-btn-primary w-full disabled:opacity-50"
          >
            저장
          </button>
        </div>
      </div>

      <div className="neo-card p-5">
        <p className="neo-subtitle mb-4">오늘의 식사</p>
        {todayMeals.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 py-8 text-center">
            <p className="text-sm font-semibold text-slate-400">오늘 기록된 식사가 없습니다</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {todayMeals.map((e) => (
              <li key={e.id} className="rounded-xl border-2 border-black bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="neo-badge-cyan">{MEAL_TYPE_LABELS[e.type]}</span>
                    <span className="font-bold">{e.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">{e.time}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`neo-badge ${PURINE_BADGE[e.purineLevel].cls}`}>
                    퓨린 {PURINE_BADGE[e.purineLevel].label}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{e.calories}kcal</span>
                  <span className="text-xs text-slate-400">P{e.protein} C{e.carbs} F{e.fat}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function RecordPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab') as TabKey | null;
  const activeTab: TabKey = tabParam && ['uric', 'glucose', 'meal'].includes(tabParam) ? tabParam : 'uric';

  const switchTab = (key: TabKey) => {
    router.replace(`/record?tab=${key}`);
  };

  return (
    <div className="min-h-screen pb-28 lg:pb-8">
      <div className="mx-auto max-w-[500px] lg:max-w-none">
        <header className="flex items-center gap-4 px-4 py-5 lg:px-6">
          <Link href="/" className="neo-icon-btn">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="neo-badge-dark mb-2">
              <Activity size={12} />
              RECORD
            </div>
            <h1 className="neo-title">기록</h1>
          </div>
        </header>

        <div className="flex gap-2 px-4 pb-4 lg:px-6">
          {TAB_LIST.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => switchTab(key)}
              className={`neo-btn flex-1 ${
                activeTab === key ? 'neo-btn-primary' : 'neo-btn-secondary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <main className="px-4 pb-8 lg:px-6">
          {activeTab === 'uric' && <UricAcidTab />}
          {activeTab === 'glucose' && <GlucoseTab />}
          {activeTab === 'meal' && <MealTab />}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}

export default function RecordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="neo-card p-8 text-center">
          <div className="neo-badge-lime mb-4">
            <Sparkles size={14} />
            LOADING
          </div>
          <p className="neo-subtitle">로딩 중...</p>
        </div>
      </div>
    }>
      <RecordPageInner />
    </Suspense>
  );
}
