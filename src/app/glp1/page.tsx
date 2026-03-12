'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { storage, GLP1Entry } from '@/lib/storage';
import { Syringe, AlertCircle, TrendingDown } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const drugs = ['오젬픽', '위고비', '마운자로', '삭센다'];
const sites = ['왼쪽 복부', '오른쪽 복부', '왼쪽 허벅지', '오른쪽 허벅지'];
const sideEffectOptions = ['메스꺼움', '구토', '설사', '변비', '두통', '피로감'];

export default function GLP1Page() {
  const [selectedDrug, setSelectedDrug] = useState(drugs[0]);
  const [dose, setDose] = useState<number>(0.5);
  const [selectedSite, setSelectedSite] = useState('');
  const [sideEffects, setSideEffects] = useState<string[]>([]);
  const [weight, setWeight] = useState<string>('');
  const [entries, setEntries] = useState<GLP1Entry[]>([]);

  useEffect(() => {
    setEntries(storage.getGLP1());
  }, []);

  const lastSite = entries.length > 0 ? entries[entries.length - 1].site : null;
  const suggestedSite = lastSite
    ? sites[(sites.indexOf(lastSite) + 1) % sites.length]
    : sites[0];

  const toggleSideEffect = (se: string) => {
    setSideEffects((prev) =>
      prev.includes(se) ? prev.filter((s) => s !== se) : [...prev, se]
    );
  };

  const handleSave = () => {
    const entry: GLP1Entry = {
      id: `g-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      drug: selectedDrug,
      dose,
      unit: 'mg',
      site: selectedSite || suggestedSite,
      sideEffects,
      weight: weight ? Number(weight) : undefined,
    };
    storage.addGLP1(entry);
    if (weight) {
      storage.addWeight({
        id: `w-${Date.now()}`,
        date: entry.date,
        value: Number(weight),
      });
    }
    setEntries([...entries, entry]);
    setSideEffects([]);
    setWeight('');
    setSelectedSite('');
  };

  const chartData = entries
    .filter((e) => e.weight !== undefined)
    .map((e) => ({
      date: e.date.slice(5),
      체중: e.weight,
      용량: e.dose,
    }));

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-[430px] mx-auto">
      <Header title="GLP-1 트래커" showBack />

      <main className="flex-1 overflow-y-auto px-4 pb-8 space-y-4">
        {/* Drug Selection */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">약물 선택</h3>
          <div className="flex gap-2 flex-wrap">
            {drugs.map((drug) => (
              <button
                key={drug}
                onClick={() => setSelectedDrug(drug)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedDrug === drug
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {drug}
              </button>
            ))}
          </div>
        </div>

        {/* Dose */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">투여량</h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              value={dose}
              onChange={(e) => setDose(Number(e.target.value))}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            <span className="text-sm text-gray-500 font-medium">mg</span>
          </div>
        </div>

        {/* Injection Site */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">주사 부위</h3>
          {lastSite && (
            <p className="text-xs text-gray-400 mb-3">
              마지막 부위: <span className="text-gray-600">{lastSite}</span>
              {' / '}
              권장 다음 부위: <span className="text-teal-600 font-medium">{suggestedSite}</span>
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            {sites.map((site) => {
              const isSelected = (selectedSite || suggestedSite) === site;
              const isLast = lastSite === site;
              return (
                <button
                  key={site}
                  onClick={() => setSelectedSite(site)}
                  className={`py-3 px-2 rounded-xl text-sm font-medium border-2 transition-colors ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : isLast
                      ? 'border-orange-300 bg-orange-50 text-orange-600'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {site}
                  {isLast && <span className="block text-[10px] mt-0.5">최근 사용</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Side Effects */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
            <AlertCircle size={14} className="text-yellow-500" />
            부작용 체크
          </h3>
          <div className="flex flex-wrap gap-2">
            {sideEffectOptions.map((se) => (
              <button
                key={se}
                onClick={() => toggleSideEffect(se)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  sideEffects.includes(se)
                    ? 'bg-red-100 text-red-700 border border-red-300'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {se}
              </button>
            ))}
          </div>
        </div>

        {/* Weight */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">체중 (선택)</h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              placeholder="체중 입력"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            <span className="text-sm text-gray-500 font-medium">kg</span>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full py-3 bg-teal-500 text-white rounded-2xl font-semibold flex items-center justify-center gap-2"
        >
          <Syringe size={18} />
          기록 저장
        </button>

        {/* Correlation Chart */}
        {chartData.length >= 2 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
              <TrendingDown size={14} className="text-blue-500" />
              체중 &amp; 용량 추이
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} domain={['dataMin - 1', 'dataMax + 1']} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line yAxisId="left" type="monotone" dataKey="체중" stroke="#14b8a6" strokeWidth={2} dot={{ r: 3 }} />
                <Line yAxisId="right" type="monotone" dataKey="용량" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* History */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">투여 이력</h3>
          {entries.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">아직 기록이 없습니다</p>
          ) : (
            <div className="space-y-3">
              {[...entries].reverse().slice(0, 10).map((entry) => (
                <div key={entry.id} className="border border-gray-100 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{entry.drug} {entry.dose}{entry.unit}</span>
                    <span className="text-xs text-gray-400">{entry.date}</span>
                  </div>
                  <p className="text-xs text-gray-500">부위: {entry.site}</p>
                  {entry.sideEffects.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {entry.sideEffects.map((se) => (
                        <span key={se} className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                          {se}
                        </span>
                      ))}
                    </div>
                  )}
                  {entry.weight && (
                    <p className="text-xs text-gray-500 mt-1">체중: {entry.weight}kg</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
