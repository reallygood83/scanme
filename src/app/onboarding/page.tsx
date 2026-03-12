'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { Check, ChevronLeft, ChevronRight, Sparkles, Crown, Users, Zap } from 'lucide-react';

const CONDITIONS = [
  { id: 'gout', label: '통풍/요산 관리', emoji: '🦴', color: 'bg-orange-200' },
  { id: 'glucose', label: '혈당/당뇨 관리', emoji: '🩸', color: 'bg-red-200' },
  { id: 'diet', label: '다이어트/체중 관리', emoji: '⚖️', color: 'bg-lime-200' },
  { id: 'glp1', label: 'GLP-1 약물 관리', emoji: '💉', color: 'bg-cyan-200' },
  { id: 'family', label: '가족 건강 관리', emoji: '👨‍👩‍👧‍👦', color: 'bg-violet-200' },
];

const PLAN_FEATURES: Record<string, { name: string; price: string; features: string[]; icon: typeof Zap; color: string }> = {
  free: {
    name: 'Free 플랜',
    price: '무료',
    icon: Zap,
    color: 'bg-gray-200',
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
    icon: Crown,
    color: 'bg-violet-300',
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
    icon: Users,
    color: 'bg-cyan-300',
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

  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [goutDiagnosed, setGoutDiagnosed] = useState(false);
  const [useCGM, setUseCGM] = useState(false);
  const [useGLP1, setUseGLP1] = useState(false);
  const [familyHistory, setFamilyHistory] = useState(false);

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

  const canProceed = step === 1 ? selectedConditions.length > 0 : true;

  return (
    <div className="min-h-screen bg-neo-bg flex flex-col">
      <div className="sticky top-0 z-10 bg-white border-b-3 border-black px-4 pt-4 pb-3">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black border-3 border-black transition-all duration-300 ${
                    s <= step
                      ? 'bg-lime-400 shadow-neo-xs'
                      : 'bg-gray-200'
                  }`}
                >
                  {s < step ? <Check size={18} strokeWidth={3} /> : s}
                </div>
                {s < 4 && (
                  <div
                    className={`flex-1 h-2 mx-1 rounded border-2 border-black transition-all duration-300 ${
                      s < step ? 'bg-lime-400' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs font-black text-gray-500 text-center">
            {step} / 4 단계
          </p>
        </div>
      </div>

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

      <div className="sticky bottom-0 bg-white border-t-3 border-black px-4 py-4">
        <div className="max-w-md mx-auto flex gap-3">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 py-4 rounded-xl border-3 border-black bg-white font-black text-sm hover:bg-gray-100 shadow-neo-sm hover:shadow-neo transition-all flex items-center justify-center gap-2"
            >
              <ChevronLeft size={18} />
              이전
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className={`flex-1 py-4 rounded-xl border-3 border-black font-black text-sm transition-all flex items-center justify-center gap-2 ${
                canProceed
                  ? 'bg-lime-400 shadow-neo-sm hover:shadow-neo hover:-translate-y-0.5'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              다음
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex-1 py-4 rounded-xl border-3 border-black bg-violet-400 font-black text-sm shadow-neo hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles size={18} />
              시작하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Step1({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-black text-gray-900 mb-2">
        어떤 관리가 필요하세요?
      </h2>
      <p className="text-sm font-bold text-gray-500 mb-6">
        해당하는 항목을 모두 선택해주세요.
      </p>

      <div className="flex flex-col gap-3">
        {CONDITIONS.map((c) => {
          const isSelected = selected.includes(c.id);
          return (
            <button
              key={c.id}
              onClick={() => onToggle(c.id)}
              className={`flex items-center gap-4 p-4 rounded-xl border-3 border-black transition-all text-left ${
                isSelected
                  ? `${c.color} shadow-neo -translate-y-1`
                  : 'bg-white shadow-neo-sm hover:shadow-neo hover:-translate-y-0.5'
              }`}
            >
              <span className="text-3xl">{c.emoji}</span>
              <span className="font-black text-sm flex-1">{c.label}</span>
              <div
                className={`w-7 h-7 rounded-lg border-3 border-black flex items-center justify-center transition-all ${
                  isSelected ? 'bg-lime-400' : 'bg-white'
                }`}
              >
                {isSelected && <Check size={16} strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

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
    <div className="neo-card flex items-center justify-between gap-4">
      <span className="text-sm font-black text-gray-700 flex-1">{label}</span>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => onChange(true)}
          className={`px-5 py-2 rounded-xl text-sm font-black border-3 border-black transition-all ${
            value
              ? 'bg-lime-400 shadow-neo-sm -translate-y-0.5'
              : 'bg-white hover:bg-gray-100'
          }`}
        >
          예
        </button>
        <button
          onClick={() => onChange(false)}
          className={`px-5 py-2 rounded-xl text-sm font-black border-3 border-black transition-all ${
            !value
              ? 'bg-orange-300 shadow-neo-sm -translate-y-0.5'
              : 'bg-white hover:bg-gray-100'
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
      <h2 className="text-2xl font-black text-gray-900 mb-2">
        현재 상태를 알려주세요
      </h2>
      <p className="text-sm font-bold text-gray-500 mb-6">
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

function Step3({
  plan,
  recommendedPlan,
}: {
  plan: { name: string; price: string; features: string[]; icon: typeof Zap; color: string };
  recommendedPlan: string;
}) {
  const Icon = plan.icon;

  return (
    <div>
      <h2 className="text-2xl font-black text-gray-900 mb-2">
        맞춤 플랜 추천
      </h2>
      <p className="text-sm font-bold text-gray-500 mb-6">
        선택하신 항목을 기반으로 최적의 플랜을 추천드려요.
      </p>

      <div className={`neo-card ${plan.color} relative overflow-visible`}>
        <span className="absolute -top-3 left-4 neo-badge-violet shadow-neo-xs">
          <Sparkles size={12} className="inline mr-1" />
          추천
        </span>
        
        <div className="flex items-start gap-4 mb-4 mt-2">
          <div className="w-14 h-14 rounded-xl bg-white border-3 border-black flex items-center justify-center shadow-neo-sm">
            <Icon size={28} />
          </div>
          <div>
            <h3 className="text-xl font-black">{plan.name}</h3>
            <p className="text-2xl font-black text-violet-600 mt-1">{plan.price}</p>
          </div>
        </div>

        <hr className="border-2 border-black mb-4" />

        <ul className="space-y-3">
          {plan.features.map((f, i) => (
            <li key={i} className="flex items-start gap-3 text-sm font-bold">
              <div className="w-6 h-6 rounded-lg bg-lime-400 border-2 border-black flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check size={14} strokeWidth={3} />
              </div>
              {f}
            </li>
          ))}
        </ul>
      </div>

      {recommendedPlan !== 'free' && (
        <p className="text-xs font-bold text-gray-400 text-center mt-4">
          7일 무료 체험 후 결제가 시작됩니다. 언제든 취소 가능합니다.
        </p>
      )}
    </div>
  );
}

function ConfettiDots() {
  const colors = ['#a3e635', '#22d3ee', '#f97316', '#c4b5fd', '#fbbf24', '#fb7185'];
  
  return (
    <div className="relative w-full h-32 overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => {
        const color = colors[i % colors.length];
        const left = `${5 + (i * 17) % 90}%`;
        const delay = `${(i * 0.15) % 2}s`;
        const duration = `${1.5 + (i % 3) * 0.5}s`;
        const size = 8 + (i % 4) * 3;

        return (
          <span
            key={i}
            className="absolute rounded-lg border-2 border-black animate-confetti-fall"
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

      <h2 className="text-3xl font-black text-gray-900 mb-3">
        7일 무료 체험 시작!
      </h2>
      <p className="text-sm font-bold text-gray-500 mb-2 leading-relaxed">
        모든 준비가 완료되었어요.
        <br />
        지금부터 UricAI가 건강 관리를 도와드릴게요.
      </p>
      <p className="text-xs font-bold text-gray-400 mb-6">
        매일 기록하면 더 정확한 AI 분석을 받을 수 있어요.
      </p>

      <div className="grid grid-cols-3 gap-3 w-full mb-4">
        {[
          { emoji: '📊', text: '맞춤 분석', color: 'bg-lime-200' },
          { emoji: '🍽️', text: '식단 관리', color: 'bg-orange-200' },
          { emoji: '🤖', text: 'AI 상담', color: 'bg-violet-200' },
        ].map((item) => (
          <div
            key={item.text}
            className={`neo-card ${item.color} p-4`}
          >
            <span className="text-3xl">{item.emoji}</span>
            <p className="text-xs font-black mt-2">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
