'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, Droplets, FileDown, Lightbulb, Sparkles, TriangleAlert, Weight } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import BottomNav from '@/components/BottomNav';
import { getDailyAverages, summarizeGlucose } from '@/lib/glucose';
import { storage, GlucoseEntry, MealEntry, subscribeToStorageChanges, UricAcidEntry, WeightEntry } from '@/lib/storage';

export default function ReportPage() {
  const [uricData, setUricData] = useState<UricAcidEntry[]>([]);
  const [glucoseData, setGlucoseData] = useState<GlucoseEntry[]>([]);
  const [mealData, setMealData] = useState<MealEntry[]>([]);
  const [weightData, setWeightData] = useState<WeightEntry[]>([]);
  const [libreMeta, setLibreMeta] = useState(storage.getLibreImportMeta());

  useEffect(() => {
    const load = () => {
      setUricData(storage.getUricAcid());
      setGlucoseData(storage.getGlucose());
      setMealData(storage.getMeals());
      setWeightData(storage.getWeight());
      setLibreMeta(storage.getLibreImportMeta());
    };

    load();
    return subscribeToStorageChanges(load);
  }, []);

  const glucoseSummary = useMemo(() => summarizeGlucose(glucoseData), [glucoseData]);
  const avgUric = uricData.length ? Number((uricData.reduce((sum, item) => sum + item.value, 0) / uricData.length).toFixed(1)) : 0;
  const totalCalories = mealData.reduce((sum, item) => sum + item.calories, 0);
  const weightDelta = weightData.length >= 2 ? Number((weightData.at(-1)!.value - weightData[0].value).toFixed(1)) : 0;

  const uricChartData = uricData.map((entry) => ({
    date: entry.date.slice(5).replace('-', '/'),
    value: entry.value,
  }));
  const glucoseChartData = getDailyAverages(glucoseData);
  const weightChartData = weightData.map((entry) => ({
    date: entry.date.slice(5).replace('-', '/'),
    value: entry.value,
  }));

  const insights = [
    libreMeta
      ? `${libreMeta.fileName} 파일에서 ${libreMeta.readingCount}건을 가져와 혈당 흐름을 분석 중입니다.`
      : 'LibreView 데이터 업로드를 연결하면 실제 CGM 흐름 기반 리포트로 바뀝니다.',
    glucoseSummary.timeInRange >= 70
      ? `TIR ${glucoseSummary.timeInRange}%로 비교적 안정적입니다.`
      : `TIR ${glucoseSummary.timeInRange}%로 범위 밖 시간이 많아 식후 패턴 점검이 필요합니다.`,
    glucoseSummary.spikeCount > 0
      ? `최근 스파이크 ${glucoseSummary.spikeCount}회가 감지되어 식사 기록과 함께 보는 것이 좋습니다.`
      : '급격한 스파이크가 크지 않아 현재 식사 루틴이 비교적 안정적입니다.',
  ];

  const cards = [
    { label: '평균 혈당', value: glucoseSummary.totalCount ? `${glucoseSummary.average} mg/dL` : '--', icon: Activity, tone: 'text-violet-700 bg-violet-50' },
    { label: '평균 요산', value: uricData.length ? `${avgUric} mg/dL` : '--', icon: Droplets, tone: 'text-sky-700 bg-sky-50' },
    { label: 'GMI', value: glucoseSummary.totalCount ? `${glucoseSummary.gmi}%` : '--', icon: Sparkles, tone: 'text-emerald-700 bg-emerald-50' },
    { label: '체중 변화', value: weightData.length >= 2 ? `${weightDelta > 0 ? '+' : ''}${weightDelta} kg` : '--', icon: Weight, tone: 'text-amber-700 bg-amber-50' },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f2f8ff,transparent_36%),linear-gradient(180deg,#f8fbff_0%,#f8fafc_100%)] pb-24">
      <header className="mx-auto flex max-w-[430px] items-center justify-between px-4 pb-2 pt-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-500">Weekly Overview</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">주간 리포트</h1>
        </div>
        <button onClick={() => alert('의사 공유용 PDF는 다음 단계에서 연결됩니다.')} className="rounded-2xl bg-slate-950 p-3 text-white shadow-sm">
          <FileDown size={18} />
        </button>
      </header>

      <main className="mx-auto flex max-w-[430px] flex-col gap-4 px-4">
        <section className="rounded-[28px] bg-slate-950 p-5 text-white shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
          <p className="text-sm text-slate-300">Libre + 요산 + 체중을 한 화면에서 요약합니다.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {cards.map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="rounded-[24px] bg-white/8 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-300">{label}</span>
                  <span className={`rounded-full p-2 ${tone}`}><Icon size={14} /></span>
                </div>
                <p className="mt-3 text-xl font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">혈당 일평균 추이</p>
              <p className="mt-1 text-xs text-slate-500">Libre와 수동 기록을 합산해 일 단위로 정리합니다.</p>
            </div>
            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">TIR {glucoseSummary.timeInRange}%</span>
          </div>
          {glucoseChartData.length > 0 ? (
            <div className="mt-4" role="img" aria-label={`주간 혈당 일평균 차트, ${glucoseChartData.length}일 데이터`}>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={glucoseChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[70, 220]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip formatter={(value: number) => [`${value} mg/dL`, '평균 혈당']} />
                  <ReferenceLine y={140} stroke="#f59e0b" strokeDasharray="4 4" />
                  <ReferenceLine y={180} stroke="#ef4444" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 5, fill: '#7c3aed' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">표시할 혈당 데이터가 없습니다.</div>
          )}
        </section>

        <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">요산 추이</p>
              <p className="mt-1 text-xs text-slate-500">통풍 위험선 7.0mg/dL을 함께 표시합니다.</p>
            </div>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">평균 {avgUric || '--'}mg/dL</span>
          </div>
          {uricChartData.length > 0 ? (
            <div className="mt-4" role="img" aria-label={`주간 요산 차트, ${uricChartData.length}개 측정값`}>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={uricChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[4.5, 9]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip formatter={(value: number) => [`${value} mg/dL`, '요산']} />
                  <ReferenceLine y={7} stroke="#ef4444" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 5, fill: '#0ea5e9' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">표시할 요산 데이터가 없습니다.</div>
          )}
        </section>

        <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">체중 흐름</p>
              <p className="mt-1 text-xs text-slate-500">GLP-1 또는 다이어트 구간과 함께 보세요.</p>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">총 {weightData.length}건</span>
          </div>
          {weightChartData.length > 0 ? (
            <div className="mt-4" role="img" aria-label={`체중 변화 차트, ${weightChartData.length}개 측정값`}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weightChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip formatter={(value: number) => [`${value} kg`, '체중']} />
                  <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 5, fill: '#f59e0b' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">체중 데이터가 없습니다.</div>
          )}
        </section>

        <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-2">
            <Lightbulb size={18} className="text-amber-500" />
            <p className="text-sm font-semibold text-slate-900">AI 인사이트 초안</p>
          </div>
          <ul className="mt-4 space-y-3">
            {insights.map((insight) => (
              <li key={insight} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">{insight}</li>
            ))}
          </ul>
          <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
            <TriangleAlert size={14} className="mr-1 inline" />
            이 리포트는 자기관리용 요약이며 진단을 대체하지 않습니다.
          </div>
          <div className="mt-4 text-xs text-slate-400">총 식사 {mealData.length}건 · 누적 칼로리 {totalCalories.toLocaleString()}kcal</div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
