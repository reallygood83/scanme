'use client';

import type {
  UserProfile,
  UricAcidEntry,
  GlucoseEntry,
  MealEntry,
  GLP1Entry,
  WeightEntry,
  FamilyMember,
} from '@/lib/storage';

// 날짜 유틸
function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function getDaysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

// 14일치 풍부한 데모 데이터 생성
export function generateDemoData() {
  const today = new Date();
  const days = Array.from({ length: 14 }, (_, i) => formatDate(getDaysAgo(13 - i)));

  // 프로필 - 온보딩 완료 상태
  const profile: UserProfile = {
    name: '김민수',
    age: 42,
    onboardingComplete: true,
    selectedConditions: ['당뇨 전단계', '고요산혈증'],
    goutDiagnosed: true,
    useCGM: true,
    useGLP1: true,
    familyHistory: true,
    plan: 'pro',
  };

  // 요산 데이터 - 점진적 개선 트렌드
  const uricAcid: UricAcidEntry[] = days.map((date, i) => ({
    id: `ua-demo-${i}`,
    value: Math.max(5.5, 7.8 - i * 0.15 + randomBetween(-0.2, 0.2)),
    date,
    time: '08:00',
    note: i === 0 ? '초기 측정' : i === 13 ? '2주 후 개선됨!' : undefined,
  }));

  // CGM 연속혈당 데이터 - 15분 간격으로 하루 96개 (최근 3일만 상세)
  const glucose: GlucoseEntry[] = [];
  
  // 최근 3일은 15분 간격 CGM 데이터
  for (let dayIdx = 11; dayIdx < 14; dayIdx++) {
    const date = days[dayIdx];
    const baseValue = 100 - dayIdx * 2; // 점진적 개선
    
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 15) {
        // 식사 후 스파이크 시뮬레이션
        let mealSpike = 0;
        if ((hour === 8 && min >= 30) || hour === 9) mealSpike = randomBetween(20, 45); // 아침 후
        if ((hour === 12 && min >= 30) || hour === 13) mealSpike = randomBetween(25, 55); // 점심 후
        if ((hour === 18 && min >= 30) || hour === 19) mealSpike = randomBetween(30, 60); // 저녁 후
        
        // 야간 새벽현상
        if (hour >= 4 && hour <= 6) mealSpike = randomBetween(5, 15);
        
        const value = Math.round(
          baseValue + mealSpike + randomBetween(-8, 8)
        );
        
        glucose.push({
          id: `gl-cgm-${dayIdx}-${hour}-${min}`,
          value: Math.max(65, Math.min(220, value)),
          date,
          time: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
          mealContext: 'continuous',
          source: 'libre',
          recordType: 'historic',
          device: 'FreeStyle Libre 2',
          serialNumber: 'MH00ABC1234',
        });
      }
    }
  }
  
  // 이전 11일은 하루 6회 측정
  for (let dayIdx = 0; dayIdx < 11; dayIdx++) {
    const date = days[dayIdx];
    const baseValue = 115 - dayIdx * 1.5;
    
    const measurements = [
      { time: '07:00', context: 'fasting' as const, offset: 0 },
      { time: '09:00', context: 'after_meal' as const, offset: 35 },
      { time: '12:00', context: 'before_meal' as const, offset: 5 },
      { time: '14:00', context: 'after_meal' as const, offset: 45 },
      { time: '18:00', context: 'before_meal' as const, offset: 8 },
      { time: '20:00', context: 'after_meal' as const, offset: 40 },
    ];
    
    measurements.forEach((m, mIdx) => {
      glucose.push({
        id: `gl-manual-${dayIdx}-${mIdx}`,
        value: Math.round(baseValue + m.offset + randomBetween(-10, 10)),
        date,
        time: m.time,
        mealContext: m.context,
        source: dayIdx > 7 ? 'libre' : 'manual',
        recordType: dayIdx > 7 ? 'scan' : undefined,
      });
    });
  }

  // 식사 기록 - 14일치 다양한 식사
  const mealTemplates = [
    // 아침
    { type: 'breakfast' as const, name: '현미밥 + 된장국 + 계란찜', calories: 420, purineLevel: 'low' as const, gi: 55, protein: 18, carbs: 52, fat: 14 },
    { type: 'breakfast' as const, name: '통밀토스트 + 아보카도 + 스크램블', calories: 380, purineLevel: 'low' as const, gi: 45, protein: 16, carbs: 35, fat: 20 },
    { type: 'breakfast' as const, name: '오트밀 + 블루베리 + 아몬드', calories: 320, purineLevel: 'low' as const, gi: 40, protein: 12, carbs: 48, fat: 10 },
    { type: 'breakfast' as const, name: '그릭요거트 + 그래놀라 + 바나나', calories: 350, purineLevel: 'low' as const, gi: 50, protein: 15, carbs: 45, fat: 12 },
    // 점심
    { type: 'lunch' as const, name: '닭가슴살 샐러드 + 발사믹', calories: 350, purineLevel: 'medium' as const, gi: 35, protein: 32, carbs: 18, fat: 12 },
    { type: 'lunch' as const, name: '연어 포케볼', calories: 480, purineLevel: 'medium' as const, gi: 52, protein: 28, carbs: 55, fat: 16 },
    { type: 'lunch' as const, name: '비빔밥 (현미)', calories: 520, purineLevel: 'low' as const, gi: 58, protein: 22, carbs: 68, fat: 15 },
    { type: 'lunch' as const, name: '두부 스테이크 + 샐러드', calories: 380, purineLevel: 'low' as const, gi: 30, protein: 24, carbs: 22, fat: 18 },
    // 저녁
    { type: 'dinner' as const, name: '그릴드 치킨 + 구운 채소', calories: 450, purineLevel: 'medium' as const, gi: 25, protein: 38, carbs: 20, fat: 22 },
    { type: 'dinner' as const, name: '된장찌개 + 잡곡밥 + 반찬', calories: 480, purineLevel: 'low' as const, gi: 55, protein: 20, carbs: 62, fat: 14 },
    { type: 'dinner' as const, name: '연어 스테이크 + 아스파라거스', calories: 420, purineLevel: 'medium' as const, gi: 20, protein: 35, carbs: 15, fat: 24 },
    { type: 'dinner' as const, name: '콩나물국밥', calories: 380, purineLevel: 'low' as const, gi: 48, protein: 18, carbs: 52, fat: 10 },
    // 간식
    { type: 'snack' as const, name: '아몬드 한 줌 + 다크초콜릿', calories: 180, purineLevel: 'low' as const, gi: 25, protein: 5, carbs: 12, fat: 14 },
    { type: 'snack' as const, name: '사과 + 땅콩버터', calories: 200, purineLevel: 'low' as const, gi: 38, protein: 4, carbs: 28, fat: 8 },
  ];

  const meals: MealEntry[] = [];
  let mealId = 0;
  
  days.forEach((date, dayIdx) => {
    // 아침
    const breakfast = mealTemplates[dayIdx % 4];
    meals.push({
      id: `meal-${mealId++}`,
      date,
      time: '08:00',
      ...breakfast,
      recommendation: dayIdx < 7 ? '좋은 선택이에요! GI 지수가 낮아 혈당 안정에 도움됩니다.' : undefined,
    });
    
    // 점심
    const lunch = mealTemplates[4 + (dayIdx % 4)];
    meals.push({
      id: `meal-${mealId++}`,
      date,
      time: '12:30',
      ...lunch,
    });
    
    // 저녁
    const dinner = mealTemplates[8 + (dayIdx % 4)];
    meals.push({
      id: `meal-${mealId++}`,
      date,
      time: '18:30',
      ...dinner,
    });
    
    // 간식 (70% 확률)
    if (Math.random() > 0.3) {
      const snack = mealTemplates[12 + (dayIdx % 2)];
      meals.push({
        id: `meal-${mealId++}`,
        date,
        time: '15:00',
        ...snack,
      });
    }
  });

  // GLP-1 주사 기록 - 주 1회, 4주치
  const glp1Sites = ['왼쪽 복부', '오른쪽 복부', '왼쪽 허벅지', '오른쪽 허벅지'];
  const glp1: GLP1Entry[] = [0, 7, 14].filter(d => d <= 13).map((daysAgo, i) => ({
    id: `glp1-demo-${i}`,
    date: formatDate(getDaysAgo(daysAgo)),
    drug: '위고비',
    dose: i === 0 ? 1.0 : i === 1 ? 0.5 : 0.25,
    unit: 'mg',
    site: glp1Sites[i % 4],
    sideEffects: i === 2 ? ['경미한 메스꺼움', '식욕 감소'] : i === 1 ? ['식욕 감소'] : [],
    weight: 78.5 - i * 1.2,
  }));

  // 체중 기록 - 점진적 감량
  const weight: WeightEntry[] = days.map((date, i) => ({
    id: `weight-demo-${i}`,
    date,
    value: Math.round((82.0 - i * 0.25 + randomBetween(-0.2, 0.2)) * 10) / 10,
  }));

  // 가족 구성원
  const family: FamilyMember[] = [
    { id: 'family-1', name: '김지영', relation: '아내', isKid: false, avatar: '👩' },
    { id: 'family-2', name: '김민준', relation: '아들', isKid: true, avatar: '👦' },
    { id: 'family-3', name: '김서연', relation: '딸', isKid: true, avatar: '👧' },
  ];

  // AI 코치 채팅 히스토리
  const chatHistory = [
    { role: 'user', content: '오늘 아침 공복혈당이 115mg/dL인데 괜찮은 건가요?', time: formatDate(getDaysAgo(2)) + ' 08:30' },
    { role: 'assistant', content: '공복혈당 115mg/dL은 정상 범위(100 이하)보다 약간 높은 수치입니다. 당뇨 전단계(100-125)에 해당하네요. 하지만 걱정 마세요! 지난 2주간 데이터를 보면 평균 공복혈당이 120에서 112로 점진적으로 개선되고 있어요. 현재 식단 관리를 잘 하고 계십니다. 💪', time: formatDate(getDaysAgo(2)) + ' 08:31' },
    { role: 'user', content: '점심에 치킨을 먹어도 될까요?', time: formatDate(getDaysAgo(1)) + ' 11:45' },
    { role: 'assistant', content: '치킨은 퓨린 함량이 중간 정도(닭고기 100g당 약 150mg)입니다. 가끔 먹는 건 괜찮지만, 몇 가지 팁을 드릴게요:\n\n1. 튀김보다는 구운 치킨 선택\n2. 껍질은 가능하면 제거\n3. 맥주 대신 물이나 무가당 음료\n4. 채소 사이드 추가\n\n이렇게 하면 요산과 혈당 영향을 최소화할 수 있어요! 🍗', time: formatDate(getDaysAgo(1)) + ' 11:46' },
    { role: 'user', content: '요즘 위고비 주사 맞고 있는데 효과가 있나요?', time: formatDate(getDaysAgo(0)) + ' 09:15' },
    { role: 'assistant', content: '데이터를 분석해보니 위고비 시작 후 좋은 변화가 보이네요! 📊\n\n✅ 체중: 82kg → 78.5kg (3.5kg 감량)\n✅ 공복혈당: 평균 118 → 105 mg/dL\n✅ 식후 혈당 스파이크: 감소 추세\n✅ 요산: 7.8 → 6.2 mg/dL\n\n체중 감량과 함께 대사 지표들이 전반적으로 개선되고 있어요. 부작용(메스꺼움)도 초기보다 줄어든 것 같고요. 현재 용량(1.0mg)에서 잘 적응하고 계시네요! 🎉', time: formatDate(getDaysAgo(0)) + ' 09:16' },
  ];

  return {
    profile,
    uricAcid,
    glucose,
    meals,
    glp1,
    weight,
    family,
    chatHistory,
    fastingStart: null,
    libreMeta: {
      source: 'libreview_csv' as const,
      fileName: 'demo_libre_export.csv',
      importedAt: new Date().toISOString(),
      readingCount: glucose.filter(g => g.source === 'libre').length,
      skippedCount: 0,
      firstReadingAt: days[11] + 'T00:00:00',
      lastReadingAt: days[13] + 'T23:45:00',
      device: 'FreeStyle Libre 2',
      serialNumber: 'MH00ABC1234',
    },
  };
}

// 데모 데이터 로드 함수
export function loadDemoData() {
  if (typeof window === 'undefined') return;
  
  const data = generateDemoData();
  
  // localStorage에 저장
  localStorage.setItem('uricai_profile', JSON.stringify(data.profile));
  localStorage.setItem('uricai_uricacid', JSON.stringify(data.uricAcid));
  localStorage.setItem('uricai_glucose', JSON.stringify(data.glucose));
  localStorage.setItem('uricai_libre_meta', JSON.stringify(data.libreMeta));
  localStorage.setItem('uricai_meals', JSON.stringify(data.meals));
  localStorage.setItem('uricai_glp1', JSON.stringify(data.glp1));
  localStorage.setItem('uricai_weight', JSON.stringify(data.weight));
  localStorage.setItem('uricai_family', JSON.stringify(data.family));
  localStorage.setItem('uricai_chat', JSON.stringify(data.chatHistory));
  localStorage.setItem('uricai_fasting', JSON.stringify(data.fastingStart));
  
  // 변경 이벤트 발생
  window.dispatchEvent(new CustomEvent('uricai-storage-changed'));
  
  return data;
}
