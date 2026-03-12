'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { useFirebaseStatus } from '@/components/FirebaseBootstrap';
import { storage, subscribeToStorageChanges } from '@/lib/storage';
import {
  User,
  Bell,
  Users,
  CreditCard,
  Syringe,
  Salad,
  Trash2,
  Info,
  ChevronRight,
  Save,
  Cloud,
  LogIn,
  LogOut,
  Database,
} from 'lucide-react';
import { loadDemoData } from '@/lib/demo-data';

export default function SettingsPage() {
  const { status: cloud, loginWithGoogle, logout, authBusy, authError, clearAuthError } = useFirebaseStatus();
  const [profile, setProfile] = useState(storage.getProfile());
  const [editingProfile, setEditingProfile] = useState(false);
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age);

  const [mealAlert, setMealAlert] = useState(true);
  const [medAlert, setMedAlert] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [showAlerts, setShowAlerts] = useState(false);

  useEffect(() => {
    const load = () => {
      const p = storage.getProfile();
      setProfile(p);
      setName(p.name);
      setAge(p.age);
    };

    load();
    return subscribeToStorageChanges(load);
  }, []);

  const saveProfile = () => {
    const updated = { ...profile, name, age };
    storage.setProfile(updated);
    setProfile(updated);
    setEditingProfile(false);
  };

  const handleReset = () => {
    if (confirm('모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      storage.clearAllData();
      window.location.reload();
    }
  };

  const menuItems = [
    { label: '가족 관리', desc: '가족 구성원 추가 및 관리', href: '/family', icon: Users, bg: 'bg-lime-200' },
    { label: '구독 관리', desc: '플랜 업그레이드', href: '/subscription', icon: CreditCard, bg: 'bg-violet-200' },
    { label: 'GLP-1 트래커', desc: '주사 기록 및 부작용 추적', href: '/glp1', icon: Syringe, bg: 'bg-cyan-200' },
    { label: '다이어트 코치', desc: '칼로리 및 영양소 분석', href: '/diet', icon: Salad, bg: 'bg-orange-200' },
  ];

  return (
    <div className="pb-28 lg:pb-0">
      <div className="mb-8">
        <h1 className="text-3xl font-black">설정</h1>
        <p className="mt-2 text-slate-600">앱 설정 및 계정 관리</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {menuItems.map(({ label, desc, href, icon: Icon, bg }) => (
              <Link key={href} href={href} className="neo-card flex items-center gap-4 p-5 transition-all hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black ${bg}`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-bold">{label}</p>
                  <p className="text-sm text-slate-500">{desc}</p>
                </div>
                <ChevronRight size={20} className="text-slate-400" />
              </Link>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="neo-card p-5">
              <button
                onClick={() => setEditingProfile(!editingProfile)}
                className="flex w-full items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-cyan-200">
                    <User size={20} />
                  </div>
                  <span className="font-bold">프로필 설정</span>
                </div>
                <ChevronRight size={20} className={`transition-transform ${editingProfile ? 'rotate-90' : ''}`} />
              </button>
              {editingProfile && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-sm font-semibold text-slate-600">이름</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="neo-input mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-600">나이</label>
                    <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} className="neo-input mt-1" />
                  </div>
                  <button onClick={saveProfile} className="neo-btn neo-btn-primary">
                    <Save size={16} /> 저장
                  </button>
                </div>
              )}
            </div>

            <div className="neo-card p-5">
              <button
                onClick={() => setShowAlerts(!showAlerts)}
                className="flex w-full items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-orange-200">
                    <Bell size={20} />
                  </div>
                  <span className="font-bold">알림 설정</span>
                </div>
                <ChevronRight size={20} className={`transition-transform ${showAlerts ? 'rotate-90' : ''}`} />
              </button>
              {showAlerts && (
                <div className="mt-4 space-y-2">
                  {[
                    { label: '식사 기록', value: mealAlert, setter: setMealAlert },
                    { label: '약물 복용', value: medAlert, setter: setMedAlert },
                    { label: '주간 리포트', value: weeklyReport, setter: setWeeklyReport },
                  ].map(({ label, value, setter }) => (
                    <div key={label} className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium">{label}</span>
                      <button
                        onClick={() => setter(!value)}
                        className={`h-6 w-10 rounded-full border-2 border-black transition-colors ${value ? 'bg-lime-400' : 'bg-slate-200'} relative`}
                      >
                        <span className={`absolute top-0.5 block h-4 w-4 rounded-full border border-black bg-white transition-transform ${value ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="neo-card-cyan p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-white">
                <Cloud size={20} />
              </div>
              <div>
                <p className="font-bold">클라우드 동기화</p>
                <p className="text-xs text-slate-600">{cloud.message}</p>
              </div>
            </div>
            {cloud.isAnonymous ? (
              <button
                onClick={() => { clearAuthError(); loginWithGoogle(); }}
                disabled={authBusy}
                className="neo-btn neo-btn-dark w-full disabled:opacity-50"
              >
                <LogIn size={16} />
                {authBusy ? '연결 중...' : 'Google 로그인'}
              </button>
            ) : (
              <button
                onClick={() => { clearAuthError(); logout(); }}
                disabled={authBusy}
                className="neo-btn neo-btn-secondary w-full disabled:opacity-50"
              >
                <LogOut size={16} />
                로그아웃
              </button>
            )}
            {authError && <p className="mt-2 text-sm text-rose-600">{authError}</p>}
          </div>

          <button
            onClick={() => { loadDemoData(); window.location.reload(); }}
            className="neo-card-violet flex w-full items-center gap-3 p-5 text-left transition-all hover:translate-y-[-2px]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-white">
              <Database size={20} className="text-violet-600" />
            </div>
            <div>
              <p className="font-bold text-violet-700">데모 데이터 로드</p>
              <p className="text-xs text-violet-600">투자자 프레젠테이션용</p>
            </div>
          </button>

          <button onClick={handleReset} className="neo-card flex w-full items-center gap-3 p-5 text-left hover:bg-rose-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-rose-200">
              <Trash2 size={20} />
            </div>
            <span className="font-bold text-rose-600">데이터 초기화</span>
          </button>

          <div className="neo-card-flat p-4 text-center">
            <p className="text-sm text-slate-500">UricAI v1.0.0 MVP</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
