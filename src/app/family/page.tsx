'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Baby, Droplets, GlassWater, HeartPulse, Plus, Sparkles, Users } from 'lucide-react';
import { summarizeGlucose } from '@/lib/glucose';
import { storage, FamilyMember, MealEntry, subscribeToStorageChanges } from '@/lib/storage';

export default function FamilyPage() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [isKid, setIsKid] = useState(false);
  const [kidsMode, setKidsMode] = useState(false);
  const [todayMeals, setTodayMeals] = useState<MealEntry[]>([]);
  const [glucoseSummary, setGlucoseSummary] = useState(() => summarizeGlucose(storage.getGlucose()));
  const [latestUric, setLatestUric] = useState(() => storage.getUricAcid().at(-1));

  useEffect(() => {
    const load = () => {
      setMembers(storage.getFamily());
      const today = new Date().toISOString().split('T')[0];
      setTodayMeals(storage.getMeals().filter((meal) => meal.date === today));
      setGlucoseSummary(summarizeGlucose(storage.getGlucose()));
      setLatestUric(storage.getUricAcid().at(-1));
    };

    load();
    return subscribeToStorageChanges(load);
  }, []);

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
    <div className="min-h-screen pb-8">
      <div className="mx-auto max-w-[500px] lg:max-w-none">
        <header className="flex items-center gap-4 px-4 py-5 lg:px-6">
          <Link href="/" className="neo-icon-btn">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="neo-badge-orange mb-2">
              <Users size={12} />
              FAMILY
            </div>
            <h1 className="neo-title">가족 건강</h1>
          </div>
        </header>

        <main className="space-y-5 px-4 pb-8 lg:px-6">
          <section className="neo-card-dark p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="neo-badge-orange mb-3">
                  <Sparkles size={12} />
                  FAMILY PLAN
                </div>
                <p className="neo-subtitle text-white">우리 가족 건강판</p>
                <p className="neo-body mt-2 text-slate-300">
                  가족 식사, 혈당, 수분 습관을 한 번에 관리하는 홈베이스입니다.
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-slate-600 bg-slate-800">
                <Users size={28} className="text-orange-300" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border-2 border-slate-700 bg-slate-800 px-3 py-4">
                <p className="text-xs font-semibold text-slate-400">구성원</p>
                <p className="mt-2 text-2xl font-black text-white">{members.length + 1}</p>
              </div>
              <div className="rounded-xl border-2 border-slate-700 bg-slate-800 px-3 py-4">
                <p className="text-xs font-semibold text-slate-400">TIR</p>
                <p className="mt-2 text-2xl font-black text-white">{glucoseSummary.timeInRange}%</p>
              </div>
              <div className="rounded-xl border-2 border-slate-700 bg-slate-800 px-3 py-4">
                <p className="text-xs font-semibold text-slate-400">요산</p>
                <p className="mt-2 text-2xl font-black text-white">{latestUric ? latestUric.value.toFixed(1) : '--'}</p>
              </div>
            </div>
          </section>

          <section className="neo-card-orange p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="neo-subtitle">오늘의 가족 식사 브리핑</p>
                <p className="mt-1 text-sm text-slate-700">한 번의 식사 기록을 가족 관점에서 공유합니다.</p>
              </div>
              <span className="neo-badge-dark">{todayMeals.length}끼</span>
            </div>

            <div className="mt-4 space-y-3">
              {todayMeals.length > 0 ? todayMeals.map((meal) => (
                <div key={meal.id} className="rounded-xl border-2 border-black bg-white px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold">{meal.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{meal.calories}kcal · GI {meal.gi} · 퓨린 {meal.purineLevel}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">{meal.time}</span>
                  </div>
                </div>
              )) : (
                <div className="rounded-xl border-2 border-dashed border-black bg-white/50 py-8 text-center">
                  <p className="text-sm font-semibold">오늘 공유된 식사 기록이 없습니다</p>
                </div>
              )}
            </div>
          </section>

          <section className="grid grid-cols-2 gap-4">
            <div className="neo-card p-5">
              <div className="flex items-center gap-2 text-cyan-600">
                <HeartPulse size={18} />
                <p className="font-bold">보호자 요약</p>
              </div>
              <p className="neo-body mt-3">
                혈당 범위 유지율 {glucoseSummary.timeInRange}% · 고혈당 {glucoseSummary.highCount}건 · 저혈당 {glucoseSummary.lowCount}건
              </p>
            </div>
            <div className="neo-card p-5">
              <div className="flex items-center gap-2 text-lime-600">
                <GlassWater size={18} />
                <p className="font-bold">가족 챌린지</p>
              </div>
              <p className="neo-body mt-3">
                이번 주 물 2L 챌린지 {challengeDays}/{challengeTotal}일 달성
              </p>
            </div>
          </section>

          <section className="neo-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="neo-subtitle">가족 구성원 추가</p>
                <p className="mt-1 text-sm text-slate-500">관리자, 멤버, 아이 역할을 설정합니다.</p>
              </div>
              <button 
                onClick={() => setKidsMode((current) => !current)} 
                className={`neo-badge ${kidsMode ? 'neo-badge-cyan' : 'neo-badge-dark'}`}
              >
                {kidsMode ? '키즈 모드 ON' : '키즈 모드 OFF'}
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <input 
                value={newName} 
                onChange={(event) => setNewName(event.target.value)} 
                placeholder="이름" 
                className="neo-input" 
              />
              <input 
                value={newRelation} 
                onChange={(event) => setNewRelation(event.target.value)} 
                placeholder="관계 (예: 배우자, 아들)" 
                className="neo-input" 
              />
              <button 
                onClick={() => setIsKid((current) => !current)} 
                className={`neo-btn w-full ${isKid ? 'neo-btn-cyan' : 'neo-btn-secondary'}`}
              >
                <Baby size={16} />
                {isKid ? '아이 구성원으로 추가' : '성인 구성원으로 추가'}
              </button>
              <button onClick={addMember} className="neo-btn neo-btn-primary w-full">
                <Plus size={16} />
                가족 구성원 저장
              </button>
            </div>
          </section>

          <section className="neo-card p-5">
            <p className="neo-subtitle mb-4">우리 가족 멤버</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border-2 border-black bg-lime-100 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-black bg-white text-lg">🧑</div>
                  <div>
                    <p className="font-bold">나</p>
                    <p className="text-xs text-slate-600">관리자 · 요산 {latestUric ? latestUric.value.toFixed(1) : '--'} · 혈당 평균 {glucoseSummary.average || '--'}</p>
                  </div>
                </div>
                <Droplets size={18} className="text-cyan-600" />
              </div>

              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between rounded-xl border-2 border-black bg-white px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 border-black text-lg ${member.isKid ? 'bg-cyan-100' : 'bg-orange-100'}`}>
                      {member.avatar}
                    </div>
                    <div>
                      <p className="font-bold">{member.name}</p>
                      <p className="text-xs text-slate-600">{member.relation}{member.isKid ? ' · 아이 모드 추천' : ''}</p>
                    </div>
                  </div>
                  <span className={`neo-badge ${member.isKid ? 'neo-badge-cyan' : 'neo-badge-orange'}`}>
                    {member.isKid ? 'Child' : 'Member'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
