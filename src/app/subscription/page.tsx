'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { storage } from '@/lib/storage';
import { Check, X, Star, Crown, Users, Zap } from 'lucide-react';

const plans = [
  {
    id: 'free',
    name: '무료',
    nameEn: 'Free',
    badge: null,
    monthlyPrice: 0,
    annualPrice: 0,
    icon: Zap,
    color: 'bg-gray-200',
    features: [
      '기본 요산 기록',
      '식사 기록 (하루 2회)',
      'AI 코치 (하루 3회)',
    ],
    highlight: false,
  },
  {
    id: 'pro',
    name: '프로',
    nameEn: 'Pro',
    badge: '인기',
    monthlyPrice: 9900,
    annualPrice: 7900,
    icon: Crown,
    color: 'bg-violet-300',
    features: [
      '무제한 기록',
      'AI 코치 무제한',
      '주간 리포트 PDF',
      '혈당+요산 이중 그래프',
      'GLP-1 트래커',
    ],
    highlight: true,
  },
  {
    id: 'family',
    name: '가족',
    nameEn: 'Family',
    badge: null,
    monthlyPrice: 14900,
    annualPrice: 11900,
    icon: Users,
    color: 'bg-cyan-300',
    features: [
      'Pro 전체 기능',
      '가족 5명까지',
      '식단 공유',
      '키즈 모드',
      '가족 챌린지',
    ],
    highlight: false,
  },
];

const addons = [
  { name: 'CGM 연동', price: 4900, desc: '연속혈당측정기 데이터 동기화' },
  { name: '영양사 상담', price: 19900, desc: '전문 영양사 1:1 상담' },
];

const comparisonFeatures = [
  { name: '요산 기록', free: true, pro: true, family: true },
  { name: '식사 기록', free: '2회/일', pro: '무제한', family: '무제한' },
  { name: 'AI 코치', free: '3회/일', pro: '무제한', family: '무제한' },
  { name: '주간 리포트 PDF', free: false, pro: true, family: true },
  { name: '이중 그래프', free: false, pro: true, family: true },
  { name: 'GLP-1 트래커', free: false, pro: true, family: true },
  { name: '가족 공유', free: false, pro: false, family: '5명' },
  { name: '키즈 모드', free: false, pro: false, family: true },
  { name: '가족 챌린지', free: false, pro: false, family: true },
];

export default function SubscriptionPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const profile = storage.getProfile();

  const formatPrice = (price: number) => {
    if (price === 0) return '₩0';
    return `₩${price.toLocaleString()}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-neo-bg max-w-[430px] mx-auto">
      <Header title="구독 플랜" showBack />

      <main className="flex-1 overflow-y-auto px-4 pb-8 space-y-6">
        <div className="neo-card flex items-center justify-center gap-4 py-3">
          <span className={`text-sm font-black ${!isAnnual ? 'text-violet-600' : 'text-gray-400'}`}>
            월간
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`w-16 h-9 rounded-full border-3 border-black transition-colors relative ${
              isAnnual ? 'bg-lime-400' : 'bg-gray-300'
            }`}
          >
            <span
              className={`block w-6 h-6 bg-white rounded-full border-2 border-black absolute top-0.5 transition-transform ${
                isAnnual ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-black ${isAnnual ? 'text-violet-600' : 'text-gray-400'}`}>
            연간
          </span>
          {isAnnual && (
            <span className="neo-badge-lime text-xs">
              최대 20% 할인
            </span>
          )}
        </div>

        <div className="space-y-4">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = profile.plan === plan.id;
            
            return (
              <div
                key={plan.id}
                className={`neo-card relative overflow-visible ${plan.color} ${
                  plan.highlight ? 'border-4' : ''
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 right-4 neo-badge-violet flex items-center gap-1 shadow-neo-xs">
                    <Star size={12} />
                    {plan.badge}
                  </span>
                )}

                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white border-3 border-black flex items-center justify-center shadow-neo-xs">
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-xl font-black">{plan.nameEn}</h3>
                      <span className="text-sm font-bold text-gray-600">({plan.name})</span>
                    </div>
                    <div className="mt-1">
                      {plan.monthlyPrice === 0 ? (
                        <span className="text-2xl font-black">₩0</span>
                      ) : (
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black">
                            {formatPrice(isAnnual ? plan.annualPrice : plan.monthlyPrice)}
                          </span>
                          <span className="text-sm font-bold text-gray-500">/월</span>
                          {isAnnual && plan.monthlyPrice > 0 && (
                            <span className="text-sm font-bold text-gray-400 line-through">
                              {formatPrice(plan.monthlyPrice)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <ul className="space-y-2 mb-4">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm font-bold">
                      <div className="w-5 h-5 rounded-full bg-lime-400 border-2 border-black flex items-center justify-center flex-shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 rounded-xl text-sm font-black border-3 border-black transition-all ${
                    isCurrentPlan
                      ? 'bg-gray-300 cursor-not-allowed'
                      : plan.highlight
                      ? 'neo-btn-primary'
                      : 'bg-white hover:bg-gray-100 shadow-neo-sm hover:shadow-neo hover:-translate-y-0.5'
                  }`}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? '✓ 현재 플랜' : '선택하기'}
                </button>
              </div>
            );
          })}
        </div>

        <div>
          <h2 className="text-lg font-black mb-3 px-1">추가 옵션</h2>
          <div className="space-y-3">
            {addons.map((addon) => (
              <div
                key={addon.name}
                className="neo-card flex items-center justify-between"
              >
                <div>
                  <p className="font-black">{addon.name}</p>
                  <p className="text-xs font-bold text-gray-500">{addon.desc}</p>
                  <p className="text-sm font-black text-violet-600 mt-1">
                    +{formatPrice(addon.price)}/월
                  </p>
                </div>
                <button className="px-5 py-2 bg-lime-300 rounded-xl border-3 border-black font-black text-sm shadow-neo-sm hover:shadow-neo hover:-translate-y-0.5 transition-all">
                  추가
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-black mb-3 px-1">플랜 비교</h2>
          <div className="neo-card overflow-hidden p-0">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-3 border-black bg-gray-100">
                  <th className="text-left p-3 font-black text-gray-700">기능</th>
                  <th className="p-3 font-black text-gray-500">Free</th>
                  <th className="p-3 font-black text-violet-600 bg-violet-100">Pro</th>
                  <th className="p-3 font-black text-cyan-600">Family</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, idx) => (
                  <tr key={row.name} className={`border-b-2 border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="p-3 font-bold text-gray-700">{row.name}</td>
                    {(['free', 'pro', 'family'] as const).map((planKey) => {
                      const val = row[planKey];
                      const isPro = planKey === 'pro';
                      return (
                        <td key={planKey} className={`p-3 text-center ${isPro ? 'bg-violet-50' : ''}`}>
                          {val === true ? (
                            <div className="w-5 h-5 rounded-full bg-lime-400 border-2 border-black flex items-center justify-center mx-auto">
                              <Check size={10} strokeWidth={3} />
                            </div>
                          ) : val === false ? (
                            <div className="w-5 h-5 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center mx-auto">
                              <X size={10} className="text-gray-400" strokeWidth={3} />
                            </div>
                          ) : (
                            <span className="font-bold text-gray-700">{val}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
