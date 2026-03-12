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
  ArrowLeft,
  Settings,
  Sparkles,
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
    { label: '가족 관리', href: '/family', icon: Users, color: 'text-lime-600' },
    { label: '구독 관리', href: '/subscription', icon: CreditCard, color: 'text-violet-600' },
    { label: 'GLP-1 트래커', href: '/glp1', icon: Syringe, color: 'text-cyan-600' },
    { label: '다이어트 코치', href: '/diet', icon: Salad, color: 'text-orange-600' },
  ];

  return (
    <div className="min-h-screen pb-28 lg:pb-8">
      <div className="mx-auto max-w-[500px] lg:max-w-none">
        <header className="flex items-center gap-4 px-4 py-5 lg:px-6">
          <Link href="/" className="neo-icon-btn">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="neo-badge-dark mb-2">
              <Settings size={12} />
              SETTINGS
            </div>
            <h1 className="neo-title">더보기</h1>
          </div>
        </header>

        <main className="space-y-4 px-4 pb-8 lg:px-6">
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
              <ChevronRight
                size={20}
                className={`transition-transform ${editingProfile ? 'rotate-90' : ''}`}
              />
            </button>
            {editingProfile && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="neo-caption">이름</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="neo-input mt-1"
                  />
                </div>
                <div>
                  <label className="neo-caption">나이</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="neo-input mt-1"
                  />
                </div>
                <button onClick={saveProfile} className="neo-btn neo-btn-primary">
                  <Save size={16} />
                  저장
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
              <ChevronRight
                size={20}
                className={`transition-transform ${showAlerts ? 'rotate-90' : ''}`}
              />
            </button>
            {showAlerts && (
              <div className="mt-4 space-y-3">
                {[
                  { label: '식사 기록 알림', value: mealAlert, setter: setMealAlert },
                  { label: '약물 복용 알림', value: medAlert, setter: setMedAlert },
                  { label: '주간 리포트 알림', value: weeklyReport, setter: setWeeklyReport },
                ].map(({ label, value, setter }) => (
                  <div key={label} className="flex items-center justify-between rounded-xl border-2 border-black bg-slate-50 p-3">
                    <span className="font-semibold">{label}</span>
                    <button
                      onClick={() => setter(!value)}
                      className={`h-7 w-12 rounded-full border-2 border-black transition-colors ${
                        value ? 'bg-lime-400' : 'bg-slate-200'
                      } relative`}
                    >
                      <span
                        className={`absolute top-0.5 block h-5 w-5 rounded-full border-2 border-black bg-white transition-transform ${
                          value ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="neo-card-cyan p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-white">
                <Cloud size={20} />
              </div>
              <div className="flex-1">
                <p className="font-bold">Firebase 동기화</p>
                <p className="mt-1 text-sm">{cloud.message}</p>
                {cloud.userId && <p className="mt-1 text-xs text-slate-600">UID: {cloud.userId}</p>}
                {cloud.email && <p className="mt-1 text-xs text-slate-600">계정: {cloud.email}</p>}
                {cloud.lastSyncedAt && <p className="mt-1 text-xs text-slate-500">최근 동기화: {new Date(cloud.lastSyncedAt).toLocaleString('ko-KR')}</p>}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {cloud.isAnonymous ? (
                <button
                  onClick={() => {
                    clearAuthError();
                    loginWithGoogle();
                  }}
                  disabled={authBusy}
                  className="neo-btn neo-btn-dark w-full disabled:opacity-50"
                >
                  <LogIn size={16} />
                  {authBusy ? 'Google 로그인 연결 중...' : 'Google 로그인 연결'}
                </button>
              ) : (
                <>
                  <div className="rounded-xl border-2 border-black bg-lime-200 px-4 py-3 text-sm font-semibold">
                    {cloud.displayName || cloud.email || 'Google 사용자'} 계정으로 동기화 중
                  </div>
                  <button
                    onClick={() => {
                      clearAuthError();
                      logout();
                    }}
                    disabled={authBusy}
                    className="neo-btn neo-btn-secondary w-full disabled:opacity-50"
                  >
                    <LogOut size={16} />
                    {authBusy ? '로그아웃 중...' : '로그아웃'}
                  </button>
                </>
              )}
              {authError && <div className="neo-badge-rose w-full justify-center py-3">{authError}</div>}
            </div>
          </div>

          {menuItems.map(({ label, href, icon: Icon, color }) => (
            <Link key={href} href={href} className="neo-card flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-white ${color}`}>
                  <Icon size={20} />
                </div>
                <span className="font-bold">{label}</span>
              </div>
              <ChevronRight size={20} />
            </Link>
          ))}

          <button
            onClick={() => {
              loadDemoData();
              window.location.reload();
            }}
            className="neo-card-violet flex w-full items-center gap-3 p-5 text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-white">
              <Database size={20} className="text-violet-600" />
            </div>
            <div>
              <span className="font-bold text-violet-700">데모 데이터 로드</span>
              <p className="text-xs text-violet-600">투자자 프레젠테이션용 샘플 데이터</p>
            </div>
          </button>

          <button onClick={handleReset} className="neo-card flex w-full items-center gap-3 p-5 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-rose-200">
              <Trash2 size={20} />
            </div>
            <span className="font-bold text-rose-600">데이터 초기화</span>
          </button>

          <div className="neo-card-flat flex items-center gap-3 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-slate-100">
              <Info size={20} />
            </div>
            <span className="text-sm font-semibold text-slate-500">앱 버전: 1.0.0 MVP</span>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
