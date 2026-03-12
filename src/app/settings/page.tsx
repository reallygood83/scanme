'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { useFirebaseStatus } from '@/components/FirebaseBootstrap';
import Header from '@/components/Header';
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
} from 'lucide-react';

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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-[430px] mx-auto">
      <Header title="더보기" />

      <main className="flex-1 overflow-y-auto px-4 pb-20 space-y-3">
        {/* 프로필 설정 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <button
            onClick={() => setEditingProfile(!editingProfile)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-3">
              <User size={20} className="text-blue-500" />
              <span className="font-medium">프로필 설정</span>
            </div>
            <ChevronRight
              size={18}
              className={`text-gray-400 transition-transform ${editingProfile ? 'rotate-90' : ''}`}
            />
          </button>
          {editingProfile && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm text-gray-500">이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500">나이</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <button
                onClick={saveProfile}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium"
              >
                <Save size={16} />
                저장
              </button>
            </div>
          )}
        </div>

        {/* 알림 설정 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-yellow-500" />
              <span className="font-medium">알림 설정</span>
            </div>
            <ChevronRight
              size={18}
              className={`text-gray-400 transition-transform ${showAlerts ? 'rotate-90' : ''}`}
            />
          </button>
          {showAlerts && (
            <div className="mt-4 space-y-3">
              {[
                { label: '식사 기록 알림', value: mealAlert, setter: setMealAlert },
                { label: '약물 복용 알림', value: medAlert, setter: setMedAlert },
                { label: '주간 리포트 알림', value: weeklyReport, setter: setWeeklyReport },
              ].map(({ label, value, setter }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm">{label}</span>
                  <button
                    onClick={() => setter(!value)}
                    className={`w-11 h-6 rounded-full transition-colors ${
                      value ? 'bg-blue-500' : 'bg-gray-300'
                    } relative`}
                  >
                    <span
                      className={`block w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${
                        value ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <Cloud size={20} className={cloud.state === 'ready' ? 'text-sky-500' : cloud.state === 'error' ? 'text-amber-500' : 'text-gray-400'} />
            <div>
              <p className="font-medium text-gray-900">Firebase 동기화</p>
              <p className="mt-1 text-sm text-gray-500">{cloud.message}</p>
              {cloud.userId && <p className="mt-1 text-xs text-gray-400">사용자 ID: {cloud.userId}</p>}
              {cloud.email && <p className="mt-1 text-xs text-gray-400">계정: {cloud.email}</p>}
              {cloud.lastSyncedAt && <p className="mt-1 text-xs text-gray-400">최근 동기화: {new Date(cloud.lastSyncedAt).toLocaleString('ko-KR')}</p>}
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            {cloud.isAnonymous ? (
              <button
                onClick={() => {
                  clearAuthError();
                  loginWithGoogle();
                }}
                disabled={authBusy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                <LogIn size={16} />
                {authBusy ? 'Google 로그인 연결 중...' : 'Google 로그인 연결'}
              </button>
            ) : (
              <>
                <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {cloud.displayName || cloud.email || 'Google 사용자'} 계정으로 동기화 중입니다.
                </div>
                <button
                  onClick={() => {
                    clearAuthError();
                    logout();
                  }}
                  disabled={authBusy}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700 disabled:opacity-50"
                >
                  <LogOut size={16} />
                  {authBusy ? '로그아웃 중...' : '로그아웃'}
                </button>
              </>
            )}
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
              익명 세션에서 Google 로그인을 연결하면 현재 Firebase 사용자에 계정을 링크해서 데이터를 최대한 유지합니다.
            </div>
            {authError && <div className="rounded-xl bg-rose-50 px-4 py-3 text-xs leading-5 text-rose-700">{authError}</div>}
          </div>
        </div>

        {/* 가족 관리 */}
        <Link href="/family" className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users size={20} className="text-green-500" />
            <span className="font-medium">가족 관리</span>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </Link>

        {/* 구독 관리 */}
        <Link href="/subscription" className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard size={20} className="text-purple-500" />
            <span className="font-medium">구독 관리</span>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </Link>

        {/* GLP-1 트래커 */}
        <Link href="/glp1" className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Syringe size={20} className="text-teal-500" />
            <span className="font-medium">GLP-1 트래커</span>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </Link>

        {/* 다이어트 코치 */}
        <Link href="/diet" className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Salad size={20} className="text-orange-500" />
            <span className="font-medium">다이어트 코치</span>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </Link>

        {/* 데이터 초기화 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <button onClick={handleReset} className="flex items-center gap-3 w-full">
            <Trash2 size={20} className="text-red-500" />
            <span className="font-medium text-red-500">데이터 초기화</span>
          </button>
        </div>

        {/* 앱 버전 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <Info size={20} className="text-gray-400" />
          <span className="text-sm text-gray-500">앱 버전: 1.0.0 MVP</span>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
