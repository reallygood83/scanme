'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { storage } from '@/lib/storage';
import { Check, X, Star } from 'lucide-react';

const plans = [
  {
    id: 'free',
    name: '무료',
    nameEn: 'Free',
    badge: null,
    monthlyPrice: 0,
    annualPrice: 0,
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
  { name: 'CGM 연동', price: 4900 },
  { name: '영양사 상담', price: 19900 },
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
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-[430px] mx-auto">
      <Header title="구독 플랜" showBack />

      <main className="flex-1 overflow-y-auto px-4 pb-8 space-y-6">
        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mt-2">
          <span className={`text-sm font-medium ${!isAnnual ? 'text-blue-600' : 'text-gray-400'}`}>
            월간
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`w-12 h-7 rounded-full transition-colors ${
              isAnnual ? 'bg-blue-500' : 'bg-gray-300'
            } relative`}
          >
            <span
              className={`block w-5 h-5 bg-white rounded-full shadow absolute top-1 transition-transform ${
                isAnnual ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${isAnnual ? 'text-blue-600' : 'text-gray-400'}`}>
            연간
          </span>
          {isAnnual && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              최대 20% 할인
            </span>
          )}
        </div>

        {/* Plan Cards */}
        <div className="space-y-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl p-4 shadow-sm relative ${
                plan.highlight ? 'border-2 border-blue-500' : 'border border-gray-100'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 right-4 bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                  <Star size={12} />
                  {plan.badge}
                </span>
              )}

              <div className="flex items-baseline gap-2 mb-1">
                <h3 className="text-lg font-bold">{plan.nameEn}</h3>
                <span className="text-sm text-gray-500">({plan.name})</span>
              </div>

              <div className="mb-4">
                {plan.monthlyPrice === 0 ? (
                  <span className="text-2xl font-bold">₩0</span>
                ) : (
                  <div>
                    <span className="text-2xl font-bold">
                      {formatPrice(isAnnual ? plan.annualPrice : plan.monthlyPrice)}
                    </span>
                    <span className="text-sm text-gray-500">/월</span>
                    {isAnnual && plan.monthlyPrice > 0 && (
                      <span className="ml-2 text-sm text-gray-400 line-through">
                        {formatPrice(plan.monthlyPrice)}/월
                      </span>
                    )}
                  </div>
                )}
              </div>

              <ul className="space-y-2 mb-4">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-sm">
                    <Check size={16} className="text-green-500 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  profile.plan === plan.id
                    ? 'bg-gray-100 text-gray-500'
                    : plan.highlight
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {profile.plan === plan.id ? '현재 플랜' : '선택하기'}
              </button>
            </div>
          ))}
        </div>

        {/* Add-ons */}
        <div>
          <h2 className="text-base font-bold mb-3">추가 옵션</h2>
          <div className="space-y-3">
            {addons.map((addon) => (
              <div
                key={addon.name}
                className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-sm">{addon.name}</p>
                  <p className="text-xs text-gray-500">
                    +{formatPrice(addon.price)}/월
                  </p>
                </div>
                <button className="px-4 py-1.5 bg-gray-100 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                  추가
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div>
          <h2 className="text-base font-bold mb-3">플랜 비교</h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-3 font-medium text-gray-500">기능</th>
                  <th className="p-3 font-medium text-gray-500">Free</th>
                  <th className="p-3 font-medium text-blue-600">Pro</th>
                  <th className="p-3 font-medium text-gray-500">Family</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row) => (
                  <tr key={row.name} className="border-b border-gray-50">
                    <td className="p-3 text-gray-700">{row.name}</td>
                    {(['free', 'pro', 'family'] as const).map((planKey) => {
                      const val = row[planKey];
                      return (
                        <td key={planKey} className="p-3 text-center">
                          {val === true ? (
                            <Check size={14} className="text-green-500 mx-auto" />
                          ) : val === false ? (
                            <X size={14} className="text-gray-300 mx-auto" />
                          ) : (
                            <span className="text-gray-700">{val}</span>
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
