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
import { storage, UricAcidEntry, GlucoseEntry, MealEntry } from '@/lib/storage';
import { analyzeMeal } from '@/lib/mockAI';
import { getLatestTrend, getSourceLabel, getTodaySeries, getTrendLabel, summarizeGlucose } from '@/lib/glucose';
import { parseLibreFile } from '@/lib/libre';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { Activity, FileUp, ShieldCheck, TriangleAlert, Waves } from 'lucide-react';

type TabKey = 'uric' | 'glucose' | 'meal';

const TAB_LIST: { key: TabKey; label: string }[] = [
  { key: 'uric', label: '요산' },
  { key: 'glucose', label: '혈당' },
  { key: 'meal', label: '식사' },
];

function getUricColor(v: number) {
  if (v < 6.0) return 'text-green-600 bg-green-50';
  if (v <= 7.0) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
}

function getGlucoseColor(v: number) {
  if (v < 100) return 'text-green-600 bg-green-50';
  if (v <= 140) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
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
  low: { label: '저', cls: 'bg-green-100 text-green-700' },
  medium: { label: '중', cls: 'bg-yellow-100 text-yellow-700' },
  high: { label: '고', cls: 'bg-red-100 text-red-700' },
};

// ---------- Uric Acid Tab ----------
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
    <div className="space-y-6">
      {/* Input form */}
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="font-semibold text-gray-800">요산 수치 입력</h3>
        <input
          type="number"
          step={0.1}
          placeholder="mg/dL"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full border border-gray-200 rounded-xl p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl p-3 text-sm"
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl p-3 text-sm"
          />
        </div>
        <input
          type="text"
          placeholder="메모 (선택)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full border border-gray-200 rounded-xl p-3 text-sm"
        />
        <button
          onClick={handleSave}
          className="w-full bg-blue-500 text-white font-semibold rounded-xl p-3 active:bg-blue-600"
        >
          저장
        </button>
      </div>

      {/* Chart */}
      {isMounted && chartData.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3">최근 7건 추이</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis domain={[4, 10]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <ReferenceLine y={6.0} stroke="#22c55e" strokeDasharray="4 4" label={{ value: '6.0', position: 'left', fontSize: 11 }} />
              <ReferenceLine y={7.0} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '7.0', position: 'left', fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ r: 4, fill: '#3B82F6' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3">기록 내역</h3>
        {recent.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">기록이 없습니다</p>
        )}
        <ul className="space-y-2">
          {recent.map((e) => (
            <li
              key={e.id}
              className={`flex items-center justify-between rounded-xl p-3 ${getUricColor(e.value)}`}
            >
              <div>
                <span className="font-bold text-lg">{e.value}</span>
                <span className="ml-1 text-xs">mg/dL</span>
                {e.note && <span className="ml-2 text-xs opacity-70">{e.note}</span>}
              </div>
              <span className="text-xs opacity-60">
                {e.date} {e.time}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ---------- Glucose Tab ----------
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
  const latestEntry = recent[0];
  const metricCards = [
    {
      label: '평균 혈당',
      value: summary.totalCount ? `${summary.average}` : '--',
      unit: 'mg/dL',
      tone: 'from-sky-50 to-white text-sky-700',
      icon: Activity,
    },
    {
      label: 'TIR',
      value: `${summary.timeInRange}`,
      unit: '%',
      tone: 'from-emerald-50 to-white text-emerald-700',
      icon: ShieldCheck,
    },
    {
      label: 'GMI',
      value: summary.totalCount ? `${summary.gmi}` : '--',
      unit: '%',
      tone: 'from-violet-50 to-white text-violet-700',
      icon: Waves,
    },
    {
      label: '스파이크',
      value: `${summary.spikeCount}`,
      unit: '회',
      tone: 'from-amber-50 to-white text-amber-700',
      icon: TriangleAlert,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-sky-100 bg-[linear-gradient(135deg,rgba(240,249,255,0.95),rgba(255,255,255,0.95))] p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-500">Libre Import</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">실제 리브레 혈당 데이터를 가져오세요</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              LibreView에서 내보낸 원본 파일을 올리면 혈당 추이, TIR, 스파이크 요약을 바로 반영합니다.
            </p>
          </div>
          <div className="rounded-2xl bg-white/80 p-3 text-sky-600 shadow-sm">
            <FileUp size={22} />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-transform active:scale-[0.98]">
            <FileUp size={16} />
            {importing ? '가져오는 중...' : 'Libre 파일 업로드'}
            <input type="file" accept=".csv,.tsv,text/csv,text/tab-separated-values" className="hidden" onChange={handleLibreImport} />
          </label>
          <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-600">
            {libreMeta ? (
              <div className="space-y-1">
                <p className="font-semibold text-slate-800">최근 동기화 완료</p>
                <p>{libreMeta.device || 'FreeStyle Libre'} · {libreMeta.readingCount}건</p>
                <p className="text-xs text-slate-500">파일: {libreMeta.fileName}{libreMeta.skippedCount > 0 ? ` · 제외 ${libreMeta.skippedCount}건` : ''}</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="font-semibold text-slate-800">아직 연동 전</p>
                <p className="text-xs text-slate-500">원본 LibreView 내보내기 파일을 그대로 올려주세요.</p>
              </div>
            )}
          </div>
        </div>

        {importMessage && <p className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{importMessage}</p>}
        {importError && <p className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{importError}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metricCards.map(({ label, value, unit, tone, icon: Icon }) => (
          <div key={label} className={`rounded-[24px] border border-white/80 bg-gradient-to-br ${tone} p-4 shadow-sm`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">{label}</span>
              <Icon size={16} />
            </div>
            <div className="mt-3 flex items-end gap-1">
              <span className="text-2xl font-bold text-slate-900">{value}</span>
              <span className="pb-1 text-xs text-slate-500">{unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">오늘의 혈당 흐름</p>
            <p className="mt-1 text-xs text-slate-500">70~180mg/dL 범위와 현재 흐름을 함께 봅니다.</p>
          </div>
          <div className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
            {getTrendLabel(latestTrend)}
          </div>
        </div>

        {isMounted && chartData.length > 0 ? (
          <div className="mt-4" role="img" aria-label={`오늘의 혈당 추이 차트, ${chartData.length}개 측정값`}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis domain={[50, 250]} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <ReferenceLine y={70} stroke="#22c55e" strokeDasharray="4 4" />
                <ReferenceLine y={180} stroke="#ef4444" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 5, fill: '#7c3aed' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            오늘 표시할 혈당 데이터가 아직 없습니다.
          </div>
        )}
      </div>

      <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">수동 혈당 입력</p>
            <p className="mt-1 text-xs text-slate-500">Libre 데이터가 없는 시점은 수동 기록으로 보완할 수 있습니다.</p>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{libreReadings}건 Libre</div>
        </div>

        <div className="mt-4 space-y-3">
          <input
            type="number"
            placeholder="mg/dL"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base focus:border-sky-300 focus:outline-none"
          />
          <select
            value={mealContext}
            onChange={(e) => setMealContext(e.target.value as GlucoseEntry['mealContext'])}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          >
            <option value="fasting">공복</option>
            <option value="before_meal">식전</option>
            <option value="after_meal">식후</option>
            <option value="bedtime">취침전</option>
          </select>
          <div className="flex gap-2">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
          </div>
          <button onClick={handleSave} className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white active:scale-[0.99]">
            수동 기록 저장
          </button>
        </div>
      </div>

      <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">최근 혈당 기록</h3>
          {latestEntry && <span className="text-xs text-slate-500">최근 {latestEntry.date} {latestEntry.time}</span>}
        </div>
        {recent.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">기록이 없습니다</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {recent.map((entry) => (
              <li key={entry.id} className={`rounded-2xl p-4 ${getGlucoseColor(entry.value)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold">{entry.value}</span>
                      <span className="text-xs">mg/dL</span>
                      <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-semibold">{getSourceLabel(entry)}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] opacity-80">
                      <span className="rounded-full bg-white/60 px-2 py-1">{MEAL_CONTEXT_LABELS[entry.mealContext]}</span>
                      {entry.recordType && <span className="rounded-full bg-white/60 px-2 py-1">{entry.recordType === 'scan' ? '스캔' : entry.recordType === 'historic' ? '연속 측정' : '이벤트'}</span>}
                      {entry.device && <span className="rounded-full bg-white/60 px-2 py-1">{entry.device}</span>}
                    </div>
                    {entry.notes && <p className="mt-2 text-xs opacity-80">{entry.notes}</p>}
                  </div>
                  <span className="text-xs opacity-70">{entry.date} {entry.time}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ---------- Meal Tab ----------
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
    <div className="space-y-6">
      {/* Input form */}
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="font-semibold text-gray-800">식사 기록</h3>

        {/* Photo upload */}
        <label className="block border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-blue-300 transition-colors">
          {photo ? (
            <img
              src={photo}
              alt="식사 사진"
              className="mx-auto max-h-40 rounded-lg object-cover"
            />
          ) : (
            <div className="text-gray-400 text-sm py-4">
              <p className="text-2xl mb-1">📷</p>
              <p>사진 촬영 / 업로드</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </label>

        <input
          type="text"
          placeholder="음식 이름 (예: 현미밥, 삼겹살)"
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
          className="w-full border border-gray-200 rounded-xl p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-300"
        />

        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value as MealEntry['type'])}
          className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white"
        >
          <option value="breakfast">아침</option>
          <option value="lunch">점심</option>
          <option value="dinner">저녁</option>
          <option value="snack">간식</option>
        </select>

        <button
          onClick={handleAnalyze}
          disabled={!mealName.trim() || analyzing}
          className="w-full bg-purple-500 text-white font-semibold rounded-xl p-3 active:bg-purple-600 disabled:opacity-50"
        >
          {analyzing ? '분석 중...' : 'AI 분석'}
        </button>

        {/* Analysis result */}
        {analysis && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PURINE_BADGE[analysis.purineLevel].cls}`}
              >
                퓨린 {PURINE_BADGE[analysis.purineLevel].label}
              </span>
              <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-semibold">
                {analysis.calories} kcal
              </span>
              <span className="text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full font-semibold">
                GI {analysis.gi}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white rounded-lg p-2">
                <p className="text-gray-400">단백질</p>
                <p className="font-bold text-gray-800">{analysis.protein}g</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="text-gray-400">탄수화물</p>
                <p className="font-bold text-gray-800">{analysis.carbs}g</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="text-gray-400">지방</p>
                <p className="font-bold text-gray-800">{analysis.fat}g</p>
              </div>
            </div>
            <p className="text-sm text-gray-700">{analysis.recommendation}</p>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={!mealName.trim()}
          className="w-full bg-blue-500 text-white font-semibold rounded-xl p-3 active:bg-blue-600 disabled:opacity-50"
        >
          저장
        </button>
      </div>

      {/* Today's meals */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3">오늘의 식사</h3>
        {todayMeals.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">오늘 기록된 식사가 없습니다</p>
        )}
        <ul className="space-y-3">
          {todayMeals.map((e) => (
            <li key={e.id} className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                    {MEAL_TYPE_LABELS[e.type]}
                  </span>
                  <span className="font-semibold text-gray-800">{e.name}</span>
                </div>
                <span className="text-xs text-gray-400">{e.time}</span>
              </div>
              <div className="flex items-center gap-2 text-xs mt-1">
                <span className={`px-2 py-0.5 rounded-full font-medium ${PURINE_BADGE[e.purineLevel].cls}`}>
                  퓨린 {PURINE_BADGE[e.purineLevel].label}
                </span>
                <span className="text-gray-500">{e.calories}kcal</span>
                <span className="text-gray-400">
                  P{e.protein} C{e.carbs} F{e.fat}
                </span>
              </div>
              {e.recommendation && (
                <p className="text-xs text-gray-500 mt-1">{e.recommendation}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ---------- Inner component with useSearchParams ----------
function RecordPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab') as TabKey | null;
  const activeTab: TabKey = tabParam && ['uric', 'glucose', 'meal'].includes(tabParam) ? tabParam : 'uric';

  const switchTab = (key: TabKey) => {
    router.replace(`/record?tab=${key}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="기록" />

      {/* Tabs */}
      <div className="flex px-4 gap-2 pt-1 pb-3 bg-white border-b border-gray-100">
        {TAB_LIST.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => switchTab(key)}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-colors ${
              activeTab === key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 px-4 py-4 pb-24 overflow-y-auto">
        {activeTab === 'uric' && <UricAcidTab />}
        {activeTab === 'glucose' && <GlucoseTab />}
        {activeTab === 'meal' && <MealTab />}
      </main>

      <BottomNav />
    </div>
  );
}

// ---------- Main Page ----------
export default function RecordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>}>
      <RecordPageInner />
    </Suspense>
  );
}
