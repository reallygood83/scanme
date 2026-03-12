'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowLeft, Droplets, FileDown, Lightbulb, Sparkles, TriangleAlert, Weight, Zap } from 'lucide-react';
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
    { label: '평균 혈당', value: glucoseSummary.totalCount ? `${glucoseSummary.average}` : '--', unit: 'mg/dL', color: 'neo-card-violet' },
    { label: '평균 요산', value: uricData.length ? `${avgUric}` : '--', unit: 'mg/dL', color: 'neo-card-cyan' },
    { label: 'GMI', value: glucoseSummary.totalCount ? `${glucoseSummary.gmi}` : '--', unit: '%', color: 'neo-card-lime' },
    { label: '체중 변화', value: weightData.length >= 2 ? `${weightDelta > 0 ? '+' : ''}${weightDelta}` : '--', unit: 'kg', color: 'neo-card-orange' },
  ];

  return (
    <div className="min-h-screen pb-28 lg:pb-8">
      <div className="mx-auto max-w-[500px] lg:max-w-none">
        <header className="flex items-center justify-between gap-4 px-4 py-5 lg:px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="neo-icon-btn">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="neo-badge-dark mb-2">
                <Zap size={12} />
                WEEKLY
              </div>
              <h1 className="neo-title">주간 리포트</h1>
            </div>
          </div>
          <button 
            onClick={() => alert('의사 공유용 PDF는 다음 단계에서 연결됩니다.')} 
            className="neo-icon-btn"
          >
            <FileDown size={20} />
          </button>
        </header>

        <main className="space-y-5 px-4 pb-8 lg:px-6">
          <section className="neo-card-dark p-6">
            <p className="neo-body text-slate-300">Libre + 요산 + 체중을 한 화면에서 요약합니다.</p>
            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {cards.map(({ label, value, unit, color }) => (
                <div key={label} className="rounded-xl border-2 border-slate-700 bg-slate-800 p-4">
                  <p className="neo-caption text-slate-400">{label}</p>
                  <div className="mt-2 flex items-end gap-1">
                    <span className="text-2xl font-black text-white">{value}</span>
                    <span className="mb-0.5 text-sm font-semibold text-slate-400">{unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="neo-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="neo-subtitle">혈당 일평균 추이</p>
                <p className="mt-1 text-sm text-slate-500">Libre와 수동 기록을 합산해 일 단위로 정리합니다.</p>
              </div>
              <span className="neo-badge-violet">TIR {glucoseSummary.timeInRange}%</span>
            </div>
            {glucoseChartData.length > 0 ? (
              <div className="mt-4">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={glucoseChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fontWeight: 600 }} />
                    <YAxis domain={[70, 220]} tick={{ fontSize: 11, fontWeight: 600 }} />
                    <Tooltip formatter={(value: number) => [`${value} mg/dL`, '평균 혈당']} />
                    <ReferenceLine y={140} stroke="#fb923c" strokeWidth={2} strokeDasharray="4 4" />
                    <ReferenceLine y={180} stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="value" stroke="#0f172a" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 6, fill: '#0f172a' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border-2 border-dashed border-slate-200 py-10 text-center">
                <p className="text-sm font-semibold text-slate-400">표시할 혈당 데이터가 없습니다</p>
              </div>
            )}
          </section>

          <section className="neo-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="neo-subtitle">요산 추이</p>
                <p className="mt-1 text-sm text-slate-500">통풍 위험선 7.0mg/dL을 함께 표시합니다.</p>
              </div>
              <span className="neo-badge-cyan">평균 {avgUric || '--'}mg/dL</span>
            </div>
            {uricChartData.length > 0 ? (
              <div className="mt-4">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={uricChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fontWeight: 600 }} />
                    <YAxis domain={[4.5, 9]} tick={{ fontSize: 11, fontWeight: 600 }} />
                    <Tooltip formatter={(value: number) => [`${value} mg/dL`, '요산']} />
                    <ReferenceLine y={7} stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="value" stroke="#0f172a" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 6, fill: '#0f172a' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border-2 border-dashed border-slate-200 py-10 text-center">
                <p className="text-sm font-semibold text-slate-400">표시할 요산 데이터가 없습니다</p>
              </div>
            )}
          </section>

          <section className="neo-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="neo-subtitle">체중 흐름</p>
                <p className="mt-1 text-sm text-slate-500">GLP-1 또는 다이어트 구간과 함께 보세요.</p>
              </div>
              <span className="neo-badge-orange">총 {weightData.length}건</span>
            </div>
            {weightChartData.length > 0 ? (
              <div className="mt-4">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={weightChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fontWeight: 600 }} />
                    <YAxis tick={{ fontSize: 11, fontWeight: 600 }} domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip formatter={(value: number) => [`${value} kg`, '체중']} />
                    <Line type="monotone" dataKey="value" stroke="#0f172a" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 6, fill: '#0f172a' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border-2 border-dashed border-slate-200 py-10 text-center">
                <p className="text-sm font-semibold text-slate-400">체중 데이터가 없습니다</p>
              </div>
            )}
          </section>

          <section className="neo-card-lime p-5">
            <div className="flex items-center gap-2">
              <Lightbulb size={20} />
              <p className="neo-subtitle">AI 인사이트 초안</p>
            </div>
            <ul className="mt-4 space-y-3">
              {insights.map((insight, i) => (
                <li key={i} className="rounded-xl border-2 border-black bg-white px-4 py-3 text-sm font-medium leading-6">
                  {insight}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-2 rounded-xl border-2 border-black bg-orange-200 px-4 py-3 text-sm font-semibold">
              <TriangleAlert size={16} />
              이 리포트는 자기관리용 요약이며 진단을 대체하지 않습니다.
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-600">
              총 식사 {mealData.length}건 · 누적 칼로리 {totalCalories.toLocaleString()}kcal
            </p>
          </section>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
