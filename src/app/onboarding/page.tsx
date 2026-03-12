'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';

const CONDITIONS = [
  { id: 'gout', label: '통풍/요산 관리', emoji: '🦴' },
  { id: 'glucose', label: '혈당/당뇨 관리', emoji: '🩸' },
  { id: 'diet', label: '다이어트/체중 관리', emoji: '⚖️' },
  { id: 'glp1', label: 'GLP-1 약물 관리', emoji: '💉' },
  { id: 'family', label: '가족 건강 관리', emoji: '👨‍👩‍👧‍👦' },
];

const PLAN_FEATURES: Record<string, { name: string; price: string; features: string[] }> = {
  free: {
    name: 'Free 플랜',
    price: '무료',
    features: [
      '기본 요산/혈당 기록',
      '주간 리포트',
      '식단 퓨린 분석 (1일 3회)',
      'AI 챗봇 기본 상담',
    ],
  },
  pro: {
    name: 'Pro 플랜',
    price: '₩9,900/월',
    features: [
      '무제한 요산/혈당/식단 기록',
      '실시간 AI 맞춤 분석',
      'GLP-1 약물 관리 & 부작용 추적',
      '고급 주간/월간 리포트',
      '의료진 공유용 PDF 내보내기',
      '퓨린/GI 식단 무제한 분석',
    ],
  },
  family: {
    name: 'Family 플랜',
    price: '₩14,900/월',
    features: [
      'Pro 플랜의 모든 기능',
      '가족 구성원 최대 5명 관리',
      '가족 건강 대시보드',
      '아이 성장/영양 모니터링',
      '가족 식단 공유 & 추천',
      '긴급 알림 (이상 수치 감지)',
    ],
  },
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [transitioning, setTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');

  // Step 1 state
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  // Step 2 state
  const [goutDiagnosed, setGoutDiagnosed] = useState(false);
  const [useCGM, setUseCGM] = useState(false);
  const [useGLP1, setUseGLP1] = useState(false);
  const [familyHistory, setFamilyHistory] = useState(false);

  // Derived plan
  const recommendedPlan = selectedConditions.includes('family')
    ? 'family'
    : selectedConditions.length >= 3
      ? 'pro'
      : 'free';

  const plan = PLAN_FEATURES[recommendedPlan];

  const toggleCondition = (id: string) => {
    setSelectedConditions((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const goTo = (nextStep: number, direction: 'left' | 'right') => {
    setSlideDirection(direction);
    setTransitioning(true);
    setTimeout(() => {
      setStep(nextStep);
      setTransitioning(false);
    }, 200);
  };

  const handleNext = () => {
    if (step < 4) goTo(step + 1, 'left');
  };

  const handleBack = () => {
    if (step > 1) goTo(step - 1, 'right');
  };

  const handleFinish = () => {
    const profile = storage.getProfile();
    storage.setProfile({
      ...profile,
      onboardingComplete: true,
      selectedConditions,
      goutDiagnosed,
      useCGM,
      useGLP1,
      familyHistory,
      plan: recommendedPlan,
    });
    router.push('/');
  };

  const canProceed =
    step === 1 ? selectedConditions.length > 0 : true;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 pt-4 pb-3">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    s <= step
                      ? 'bg-[#3B82F6] text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {s < step ? '✓' : s}
                </div>
                {s < 4 && (
                  <div
                    className={`flex-1 h-1 mx-1 rounded transition-all duration-300 ${
                      s < step ? 'bg-[#3B82F6]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center">
            {step} / 4 단계
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <div
          className={`max-w-md mx-auto px-4 py-6 transition-all duration-200 ${
            transitioning
              ? slideDirection === 'left'
                ? 'opacity-0 -translate-x-4'
                : 'opacity-0 translate-x-4'
              : 'opacity-100 translate-x-0'
          }`}
        >
          {step === 1 && <Step1 selected={selectedConditions} onToggle={toggleCondition} />}
          {step === 2 && (
            <Step2
              goutDiagnosed={goutDiagnosed}
              setGoutDiagnosed={setGoutDiagnosed}
              useCGM={useCGM}
              setUseCGM={setUseCGM}
              useGLP1={useGLP1}
              setUseGLP1={setUseGLP1}
              familyHistory={familyHistory}
              setFamilyHistory={setFamilyHistory}
            />
          )}
          {step === 3 && <Step3 plan={plan} recommendedPlan={recommendedPlan} />}
          {step === 4 && <Step4 />}
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-4">
        <div className="max-w-md mx-auto flex gap-3">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              이전
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className={`flex-1 py-3 rounded-2xl font-medium text-sm transition-all ${
                canProceed
                  ? 'bg-[#3B82F6] text-white hover:bg-blue-600 shadow-sm'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              다음
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex-1 py-3 rounded-2xl bg-[#14B8A6] text-white font-semibold text-sm hover:bg-teal-600 shadow-sm transition-all"
            >
              시작하기 🎉
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────── Step 1 ── */
function Step1({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">
        어떤 관리가 필요하세요?
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        해당하는 항목을 모두 선택해주세요.
      </p>

      <div className="flex flex-col gap-3">
        {CONDITIONS.map((c) => {
          const isSelected = selected.includes(c.id);
          return (
            <button
              key={c.id}
              onClick={() => onToggle(c.id)}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left shadow-sm ${
                isSelected
                  ? 'border-[#3B82F6] bg-blue-50'
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <span className="text-3xl">{c.emoji}</span>
              <span
                className={`font-medium text-sm ${
                  isSelected ? 'text-[#3B82F6]' : 'text-gray-700'
                }`}
              >
                {c.label}
              </span>
              <div className="ml-auto">
                <div
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-[#3B82F6] border-[#3B82F6]'
                      : 'border-gray-300'
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────── Step 2 ── */
function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <span className="text-sm font-medium text-gray-700 pr-4">{label}</span>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => onChange(true)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            value
              ? 'bg-[#3B82F6] text-white'
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
          }`}
        >
          예
        </button>
        <button
          onClick={() => onChange(false)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            !value
              ? 'bg-[#3B82F6] text-white'
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
          }`}
        >
          아니오
        </button>
      </div>
    </div>
  );
}

function Step2({
  goutDiagnosed,
  setGoutDiagnosed,
  useCGM,
  setUseCGM,
  useGLP1,
  setUseGLP1,
  familyHistory,
  setFamilyHistory,
}: {
  goutDiagnosed: boolean;
  setGoutDiagnosed: (v: boolean) => void;
  useCGM: boolean;
  setUseCGM: (v: boolean) => void;
  useGLP1: boolean;
  setUseGLP1: (v: boolean) => void;
  familyHistory: boolean;
  setFamilyHistory: (v: boolean) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">
        현재 상태를 알려주세요
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        더 정확한 맞춤 관리를 위해 알려주세요.
      </p>

      <div className="flex flex-col gap-3">
        <ToggleRow
          label="통풍 진단을 받으셨나요?"
          value={goutDiagnosed}
          onChange={setGoutDiagnosed}
        />
        <ToggleRow
          label="CGM(연속혈당측정기) 사용 중이신가요?"
          value={useCGM}
          onChange={setUseCGM}
        />
        <ToggleRow
          label="GLP-1 약물 복용 중이신가요?"
          value={useGLP1}
          onChange={setUseGLP1}
        />
        <ToggleRow
          label="가족 중 통풍/당뇨 환자가 있나요?"
          value={familyHistory}
          onChange={setFamilyHistory}
        />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────── Step 3 ── */
function Step3({
  plan,
  recommendedPlan,
}: {
  plan: { name: string; price: string; features: string[] };
  recommendedPlan: string;
}) {
  const accentColor =
    recommendedPlan === 'family'
      ? '#14B8A6'
      : recommendedPlan === 'pro'
        ? '#3B82F6'
        : '#6B7280';

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">
        맞춤 플랜 추천
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        선택하신 항목을 기반으로 최적의 플랜을 추천드려요.
      </p>

      <div
        className="rounded-2xl border-2 p-6 shadow-sm bg-white"
        style={{ borderColor: accentColor }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <span
              className="text-xs font-semibold px-2 py-1 rounded-full text-white"
              style={{ backgroundColor: accentColor }}
            >
              추천
            </span>
            <h3 className="text-lg font-bold text-gray-900 mt-2">
              {plan.name}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold" style={{ color: accentColor }}>
              {plan.price}
            </p>
          </div>
        </div>

        <hr className="border-gray-100 mb-4" />

        <ul className="space-y-3">
          {plan.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <svg
                className="w-5 h-5 shrink-0 mt-0.5"
                style={{ color: accentColor }}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {f}
            </li>
          ))}
        </ul>
      </div>

      {recommendedPlan !== 'free' && (
        <p className="text-xs text-gray-400 text-center mt-4">
          7일 무료 체험 후 결제가 시작됩니다. 언제든 취소 가능합니다.
        </p>
      )}
    </div>
  );
}

/* ────────────────────────────────────────── Step 4 ── */
function ConfettiDots() {
  return (
    <div className="relative w-full h-32 overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => {
        const colors = ['#3B82F6', '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
        const color = colors[i % colors.length];
        const left = `${5 + (i * 17) % 90}%`;
        const delay = `${(i * 0.15) % 2}s`;
        const duration = `${1.5 + (i % 3) * 0.5}s`;
        const size = 6 + (i % 4) * 2;

        return (
          <span
            key={i}
            className="absolute rounded-full animate-confetti-fall"
            style={{
              width: size,
              height: size,
              backgroundColor: color,
              left,
              top: -10,
              animationDelay: delay,
              animationDuration: duration,
            }}
          />
        );
      })}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(140px) rotate(360deg) scale(0.5);
            opacity: 0;
          }
        }
        .animate-confetti-fall {
          animation-name: confetti-fall;
          animation-timing-function: ease-in;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
}

function Step4() {
  return (
    <div className="flex flex-col items-center text-center">
      <ConfettiDots />

      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        7일 무료 체험 시작!
      </h2>
      <p className="text-sm text-gray-500 mb-2 leading-relaxed">
        모든 준비가 완료되었어요.
        <br />
        지금부터 UricAI가 건강 관리를 도와드릴게요.
      </p>
      <p className="text-xs text-gray-400 mb-6">
        매일 기록하면 더 정확한 AI 분석을 받을 수 있어요.
      </p>

      <div className="grid grid-cols-3 gap-3 w-full mb-4">
        {[
          { emoji: '📊', text: '맞춤 분석' },
          { emoji: '🍽️', text: '식단 관리' },
          { emoji: '🤖', text: 'AI 상담' },
        ].map((item) => (
          <div
            key={item.text}
            className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm"
          >
            <span className="text-2xl">{item.emoji}</span>
            <p className="text-xs text-gray-600 mt-1 font-medium">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
