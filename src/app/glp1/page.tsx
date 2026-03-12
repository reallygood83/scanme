'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { storage, GLP1Entry } from '@/lib/storage';
import { Syringe, AlertCircle, TrendingDown, Check, Scale } from 'lucide-react';
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
    <div className="flex flex-col min-h-screen bg-neo-bg max-w-[430px] mx-auto">
      <Header title="GLP-1 트래커" showBack />

      <main className="flex-1 overflow-y-auto px-4 pb-8 space-y-4">
        <div className="neo-card-cyan">
          <h3 className="font-black mb-3 flex items-center gap-2">
            <Syringe size={18} />
            약물 선택
          </h3>
          <div className="flex gap-2 flex-wrap">
            {drugs.map((drug) => (
              <button
                key={drug}
                onClick={() => setSelectedDrug(drug)}
                className={`px-4 py-2 rounded-xl text-sm font-bold border-3 border-black transition-all ${
                  selectedDrug === drug
                    ? 'bg-cyan-400 shadow-neo-sm -translate-y-0.5'
                    : 'bg-white hover:bg-gray-100'
                }`}
              >
                {drug}
              </button>
            ))}
          </div>
        </div>

        <div className="neo-card">
          <h3 className="font-black mb-3">투여량</h3>
          <div className="flex items-center gap-3">
            <input
              type="number"
              step="0.1"
              value={dose}
              onChange={(e) => setDose(Number(e.target.value))}
              className="flex-1 px-4 py-3 border-3 border-black rounded-xl text-sm font-bold focus:outline-none focus:shadow-neo transition-shadow"
            />
            <span className="text-sm font-black px-4 py-3 bg-gray-200 rounded-xl border-2 border-black">mg</span>
          </div>
        </div>

        <div className="neo-card-violet">
          <h3 className="font-black mb-2">주사 부위</h3>
          {lastSite && (
            <p className="text-xs font-bold text-gray-600 mb-3">
              마지막: <span className="text-gray-800">{lastSite}</span>
              {' → '}
              권장: <span className="text-violet-600">{suggestedSite}</span>
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
                  className={`py-3 px-3 rounded-xl text-sm font-bold border-3 transition-all ${
                    isSelected
                      ? 'border-black bg-violet-300 shadow-neo-sm -translate-y-0.5'
                      : isLast
                      ? 'border-orange-400 bg-orange-100'
                      : 'border-black bg-white hover:bg-gray-50'
                  }`}
                >
                  {site}
                  {isLast && <span className="block text-[10px] font-bold mt-1 text-orange-600">최근 사용</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="neo-card-orange">
          <h3 className="font-black mb-3 flex items-center gap-2">
            <AlertCircle size={16} />
            부작용 체크
          </h3>
          <div className="flex flex-wrap gap-2">
            {sideEffectOptions.map((se) => (
              <button
                key={se}
                onClick={() => toggleSideEffect(se)}
                className={`px-4 py-2 rounded-full text-xs font-bold border-2 transition-all ${
                  sideEffects.includes(se)
                    ? 'bg-red-300 border-black shadow-neo-xs'
                    : 'bg-white border-black hover:bg-gray-50'
                }`}
              >
                {se}
              </button>
            ))}
          </div>
        </div>

        <div className="neo-card">
          <h3 className="font-black mb-3 flex items-center gap-2">
            <Scale size={16} />
            체중 (선택)
          </h3>
          <div className="flex items-center gap-3">
            <input
              type="number"
              step="0.1"
              placeholder="체중 입력"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="flex-1 px-4 py-3 border-3 border-black rounded-xl text-sm font-bold focus:outline-none focus:shadow-neo transition-shadow"
            />
            <span className="text-sm font-black px-4 py-3 bg-gray-200 rounded-xl border-2 border-black">kg</span>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="neo-btn-primary w-full py-4 text-base flex items-center justify-center gap-2"
        >
          <Syringe size={20} />
          기록 저장
        </button>

        {chartData.length >= 2 && (
          <div className="neo-card-lime">
            <h3 className="font-black mb-3 flex items-center gap-2">
              <TrendingDown size={16} />
              체중 &amp; 용량 추이
            </h3>
            <div className="bg-white rounded-xl border-2 border-black p-2">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fontWeight: 600 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fontWeight: 600 }} domain={['dataMin - 1', 'dataMax + 1']} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fontWeight: 600 }} />
                  <Tooltip 
                    contentStyle={{ 
                      border: '2px solid black', 
                      borderRadius: '8px',
                      fontWeight: 600 
                    }} 
                  />
                  <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
                  <Line yAxisId="left" type="monotone" dataKey="체중" stroke="#000" strokeWidth={3} dot={{ r: 4, fill: '#a3e635', stroke: '#000', strokeWidth: 2 }} />
                  <Line yAxisId="right" type="monotone" dataKey="용량" stroke="#000" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4, fill: '#c4b5fd', stroke: '#000', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="neo-card">
          <h3 className="font-black mb-3">투여 이력</h3>
          {entries.length === 0 ? (
            <p className="text-sm font-bold text-gray-400 text-center py-6">아직 기록이 없습니다</p>
          ) : (
            <div className="space-y-3">
              {[...entries].reverse().slice(0, 10).map((entry) => (
                <div key={entry.id} className="bg-gray-100 border-2 border-black rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black">{entry.drug} {entry.dose}{entry.unit}</span>
                    <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded-lg border border-black">{entry.date}</span>
                  </div>
                  <p className="text-xs font-bold text-gray-600">부위: {entry.site}</p>
                  {entry.sideEffects.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {entry.sideEffects.map((se) => (
                        <span key={se} className="text-[10px] font-bold bg-red-200 text-red-700 px-2 py-1 rounded-full border border-red-400">
                          {se}
                        </span>
                      ))}
                    </div>
                  )}
                  {entry.weight && (
                    <p className="text-xs font-bold text-gray-600 mt-2">체중: {entry.weight}kg</p>
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
