'use client';

import { useEffect, useMemo, useState } from 'react';
import { Baby, Droplets, GlassWater, HeartPulse, Plus, Users } from 'lucide-react';
import Header from '@/components/Header';
import { summarizeGlucose } from '@/lib/glucose';
import { storage, FamilyMember, MealEntry } from '@/lib/storage';

export default function FamilyPage() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [isKid, setIsKid] = useState(false);
  const [kidsMode, setKidsMode] = useState(false);
  const [todayMeals, setTodayMeals] = useState<MealEntry[]>([]);

  useEffect(() => {
    setMembers(storage.getFamily());
    const today = new Date().toISOString().split('T')[0];
    setTodayMeals(storage.getMeals().filter((meal) => meal.date === today));
  }, []);

  const glucoseSummary = useMemo(() => summarizeGlucose(storage.getGlucose()), []);
  const latestUric = storage.getUricAcid().at(-1);

  const addMember = () => {
    if (!newName.trim() || !newRelation.trim()) return;
    const avatarPool = isKid ? ['👦', '👧', '🧒'] : ['👨', '👩', '🧑'];
    const member: FamilyMember = {
      id: `f-${Date.now()}`,
      name: newName.trim(),
      relation: newRelation.trim(),
      isKid,
      avatar: avatarPool[Math.floor(Math.random() * avatarPool.length)],
    };
    const nextMembers = [...members, member];
    storage.setFamily(nextMembers);
    setMembers(nextMembers);
    setNewName('');
    setNewRelation('');
    setIsKid(false);
  };

  const challengeDays = 4;
  const challengeTotal = 7;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff5eb,transparent_36%),linear-gradient(180deg,#fffaf5_0%,#f8fafc_100%)]">
      <div className="mx-auto max-w-[430px] pb-10">
        <Header title="가족 건강" showBack />

        <main className="space-y-4 px-4 pb-8">
          <section className="rounded-[30px] bg-slate-950 p-5 text-white shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-200">Family Plan</p>
                <h2 className="mt-2 text-2xl font-semibold">우리 가족 건강판</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">가족 식사, 혈당, 수분 습관을 한 번에 관리하는 홈베이스입니다.</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <Users size={22} className="text-orange-200" />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-white/8 px-3 py-4">
                <p className="text-xs text-slate-300">구성원</p>
                <p className="mt-2 text-2xl font-semibold">{members.length + 1}</p>
              </div>
              <div className="rounded-2xl bg-white/8 px-3 py-4">
                <p className="text-xs text-slate-300">TIR</p>
                <p className="mt-2 text-2xl font-semibold">{glucoseSummary.timeInRange}%</p>
              </div>
              <div className="rounded-2xl bg-white/8 px-3 py-4">
                <p className="text-xs text-slate-300">요산</p>
                <p className="mt-2 text-2xl font-semibold">{latestUric ? latestUric.value.toFixed(1) : '--'}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-orange-100">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">오늘의 가족 식사 브리핑</p>
                <p className="mt-1 text-xs text-slate-500">한 번의 식사 기록을 가족 관점에서 바로 공유합니다.</p>
              </div>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">{todayMeals.length}끼 공유</span>
            </div>

            <div className="mt-4 space-y-3">
              {todayMeals.length > 0 ? todayMeals.map((meal) => (
                <div key={meal.id} className="rounded-2xl bg-orange-50/60 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{meal.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{meal.calories}kcal · GI {meal.gi} · 퓨린 {meal.purineLevel}</p>
                    </div>
                    <span className="text-xs text-slate-400">{meal.time}</span>
                  </div>
                </div>
              )) : (
                <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">오늘 공유된 식사 기록이 없습니다.</div>
              )}
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-center gap-2 text-sky-600">
                <HeartPulse size={18} />
                <p className="text-sm font-semibold text-slate-900">보호자 요약</p>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">혈당 범위 유지율 {glucoseSummary.timeInRange}% · 고혈당 {glucoseSummary.highCount}건 · 저혈당 {glucoseSummary.lowCount}건</p>
            </div>
            <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-center gap-2 text-cyan-600">
                <GlassWater size={18} />
                <p className="text-sm font-semibold text-slate-900">가족 챌린지</p>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">이번 주 물 2L 챌린지 {challengeDays}/{challengeTotal}일 달성</p>
            </div>
          </section>

          <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">가족 구성원 추가</p>
                <p className="mt-1 text-xs text-slate-500">관리자, 멤버, 아이 역할을 가볍게 시작합니다.</p>
              </div>
              <button onClick={() => setKidsMode((current) => !current)} className={`rounded-full px-3 py-1 text-xs font-semibold ${kidsMode ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-500'}`}>
                {kidsMode ? '키즈 모드 ON' : '키즈 모드 OFF'}
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="이름" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
              <input value={newRelation} onChange={(event) => setNewRelation(event.target.value)} placeholder="관계 (예: 배우자, 아들)" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
              <button onClick={() => setIsKid((current) => !current)} className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${isKid ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'}`}>
                <Baby size={16} />
                {isKid ? '아이 구성원으로 추가' : '성인 구성원으로 추가'}
              </button>
              <button onClick={addMember} className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
                <Plus size={16} />
                가족 구성원 저장
              </button>
            </div>
          </section>

          <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-semibold text-slate-900">우리 가족 멤버</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-lg">🧑</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">나</p>
                    <p className="text-xs text-slate-500">관리자 · 요산 {latestUric ? latestUric.value.toFixed(1) : '--'} · 혈당 평균 {glucoseSummary.average || '--'}</p>
                  </div>
                </div>
                <Droplets size={16} className="text-sky-500" />
              </div>

              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl text-lg ${member.isKid ? 'bg-sky-100' : 'bg-orange-100'}`}>{member.avatar}</div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.relation}{member.isKid ? ' · 아이 모드 추천' : ''}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${member.isKid ? 'bg-sky-100 text-sky-700' : 'bg-orange-100 text-orange-700'}`}>{member.isKid ? 'Child' : 'Member'}</span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
