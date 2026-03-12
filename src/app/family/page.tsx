'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { storage, FamilyMember } from '@/lib/storage';
import { UserPlus, Users, Trophy, Utensils, Baby, Droplets } from 'lucide-react';

export default function FamilyPage() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [isKid, setIsKid] = useState(false);
  const [kidsMode, setKidsMode] = useState(false);

  useEffect(() => {
    setMembers(storage.getFamily());
  }, []);

  const addMember = () => {
    if (!newName.trim() || !newRelation.trim()) return;

    const avatarOptions = isKid
      ? ['👦', '👧', '🧒']
      : ['👨', '👩', '🧑', '👴', '👵'];
    const avatar = avatarOptions[Math.floor(Math.random() * avatarOptions.length)];

    const member: FamilyMember = {
      id: `f-${Date.now()}`,
      name: newName,
      relation: newRelation,
      isKid,
      avatar,
    };

    const updated = [...members, member];
    storage.setFamily(updated);
    setMembers(updated);
    setNewName('');
    setNewRelation('');
    setIsKid(false);
  };

  const removeMember = (id: string) => {
    const updated = members.filter((m) => m.id !== id);
    storage.setFamily(updated);
    setMembers(updated);
  };

  // Mock shared meals for today
  const sharedMeals = [
    { time: '08:00', name: '현미밥 + 된장국', who: '가족 전체' },
    { time: '12:30', name: '닭가슴살 샐러드', who: '본인' },
    { time: '18:00', name: '두부 스테이크 + 야채볶음', who: '가족 전체' },
  ];

  const challengeProgress = 3;
  const challengeTotal = 7;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-[430px] mx-auto">
      <Header title="가족 건강" showBack />

      <main className="flex-1 overflow-y-auto px-4 pb-8 space-y-4">
        {/* Family Members */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
            <Users size={16} className="text-green-500" />
            가족 구성원
          </h3>

          {members.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              가족 구성원을 추가해 주세요
            </p>
          ) : (
            <div className="space-y-2 mb-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between border border-gray-100 rounded-xl p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{member.avatar}</span>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-gray-400">
                        {member.relation}
                        {member.isKid && (
                          <span className="ml-1 text-blue-500 font-medium">아동</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeMember(member.id)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Member Form */}
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="이름"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <input
                type="text"
                placeholder="관계 (예: 배우자)"
                value={newRelation}
                onChange={(e) => setNewRelation(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Baby size={16} className="text-blue-400" />
                <span className="text-sm">아동 여부</span>
                <button
                  onClick={() => setIsKid(!isKid)}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    isKid ? 'bg-blue-500' : 'bg-gray-300'
                  } relative`}
                >
                  <span
                    className={`block w-4 h-4 bg-white rounded-full shadow absolute top-0.5 transition-transform ${
                      isKid ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              <button
                onClick={addMember}
                className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium"
              >
                <UserPlus size={14} />
                추가
              </button>
            </div>
          </div>
        </div>

        {/* Meal Sharing */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
            <Utensils size={16} className="text-orange-500" />
            오늘의 가족 식단
          </h3>
          <div className="space-y-2">
            {sharedMeals.map((meal, i) => (
              <div
                key={i}
                className="flex items-center justify-between border border-gray-100 rounded-xl p-3"
              >
                <div>
                  <p className="text-sm font-medium">{meal.name}</p>
                  <p className="text-xs text-gray-400">{meal.who}</p>
                </div>
                <span className="text-xs text-gray-400">{meal.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Kids Mode Toggle */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Baby size={18} className="text-blue-400" />
              <div>
                <p className="text-sm font-medium">키즈 모드</p>
                <p className="text-xs text-gray-400">아이 친화적 간소화 UI</p>
              </div>
            </div>
            <button
              onClick={() => setKidsMode(!kidsMode)}
              className={`w-11 h-6 rounded-full transition-colors ${
                kidsMode ? 'bg-blue-500' : 'bg-gray-300'
              } relative`}
            >
              <span
                className={`block w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${
                  kidsMode ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
          {kidsMode && (
            <div className="mt-3 p-3 bg-blue-50 rounded-xl">
              <p className="text-xs text-blue-600">
                키즈 모드가 활성화되었습니다. 아이에게 적합한 간소화된 UI가 표시됩니다.
              </p>
            </div>
          )}
        </div>

        {/* Family Challenge */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
            <Trophy size={16} className="text-yellow-500" />
            이번 주 챌린지
          </h3>
          <div className="border border-yellow-100 bg-yellow-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Droplets size={18} className="text-blue-400" />
              <p className="text-sm font-medium">하루 2L 물 마시기</p>
            </div>
            <div className="w-full h-3 bg-yellow-100 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all"
                style={{
                  width: `${(challengeProgress / challengeTotal) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-500 text-right">
              {challengeProgress}/{challengeTotal}일 완료
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
