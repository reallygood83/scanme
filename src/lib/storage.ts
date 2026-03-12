'use client';

export interface UserProfile {
  name: string;
  age: number;
  onboardingComplete: boolean;
  selectedConditions: string[];
  goutDiagnosed: boolean;
  useCGM: boolean;
  useGLP1: boolean;
  familyHistory: boolean;
  plan: string;
}

export interface UricAcidEntry {
  id: string;
  value: number;
  date: string;
  time: string;
  note?: string;
}

export interface GlucoseEntry {
  id: string;
  value: number;
  date: string;
  time: string;
  mealContext: 'fasting' | 'before_meal' | 'after_meal' | 'bedtime' | 'continuous';
  source?: 'manual' | 'libre' | 'mock';
  recordType?: 'historic' | 'scan' | 'event';
  device?: string;
  serialNumber?: string;
  notes?: string;
}

export interface LibreImportMeta {
  source: 'libreview_csv';
  fileName: string;
  importedAt: string;
  readingCount: number;
  skippedCount: number;
  firstReadingAt: string;
  lastReadingAt: string;
  device?: string;
  serialNumber?: string;
}

export interface MealEntry {
  id: string;
  date: string;
  time: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  photo?: string;
  calories: number;
  purineLevel: 'low' | 'medium' | 'high';
  gi: number;
  protein: number;
  carbs: number;
  fat: number;
  recommendation?: string;
}

export interface GLP1Entry {
  id: string;
  date: string;
  drug: string;
  dose: number;
  unit: string;
  site: string;
  sideEffects: string[];
  weight?: number;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  isKid: boolean;
  avatar: string;
}

export interface WeightEntry {
  id: string;
  date: string;
  value: number;
}

function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getProfile: () => getItem<UserProfile>('uricai_profile', {
    name: '사용자',
    age: 35,
    onboardingComplete: false,
    selectedConditions: [],
    goutDiagnosed: false,
    useCGM: false,
    useGLP1: false,
    familyHistory: false,
    plan: 'free',
  }),
  setProfile: (p: UserProfile) => setItem('uricai_profile', p),

  getUricAcid: () => getItem<UricAcidEntry[]>('uricai_uricacid', []),
  addUricAcid: (e: UricAcidEntry) => {
    const list = getItem<UricAcidEntry[]>('uricai_uricacid', []);
    list.push(e);
    setItem('uricai_uricacid', list);
  },

  getGlucose: () => getItem<GlucoseEntry[]>('uricai_glucose', []),
  addGlucose: (e: GlucoseEntry) => {
    const list = getItem<GlucoseEntry[]>('uricai_glucose', []);
    list.push(e);
    setItem('uricai_glucose', list);
  },
  importLibreGlucose: (entries: GlucoseEntry[], meta: LibreImportMeta) => {
    const existing = getItem<GlucoseEntry[]>('uricai_glucose', []);
    const mergedMap = new Map<string, GlucoseEntry>();

    [...existing, ...entries].forEach((entry) => {
      const dedupeKey = entry.source === 'libre'
        ? `${entry.date}T${entry.time}:${entry.serialNumber || entry.device || 'libre'}:${entry.value}`
        : entry.id;
      mergedMap.set(dedupeKey, entry);
    });

    const merged = Array.from(mergedMap.values()).sort((a, b) =>
      `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)
    );

    setItem('uricai_glucose', merged);
    setItem('uricai_libre_meta', meta);
  },
  getLibreImportMeta: () => getItem<LibreImportMeta | null>('uricai_libre_meta', null),
  clearLibreImportMeta: () => setItem<LibreImportMeta | null>('uricai_libre_meta', null),

  getMeals: () => getItem<MealEntry[]>('uricai_meals', []),
  addMeal: (e: MealEntry) => {
    const list = getItem<MealEntry[]>('uricai_meals', []);
    list.push(e);
    setItem('uricai_meals', list);
  },

  getGLP1: () => getItem<GLP1Entry[]>('uricai_glp1', []),
  addGLP1: (e: GLP1Entry) => {
    const list = getItem<GLP1Entry[]>('uricai_glp1', []);
    list.push(e);
    setItem('uricai_glp1', list);
  },

  getWeight: () => getItem<WeightEntry[]>('uricai_weight', []),
  addWeight: (e: WeightEntry) => {
    const list = getItem<WeightEntry[]>('uricai_weight', []);
    list.push(e);
    setItem('uricai_weight', list);
  },

  getFamily: () => getItem<FamilyMember[]>('uricai_family', []),
  setFamily: (f: FamilyMember[]) => setItem('uricai_family', f),

  getChatHistory: () => getItem<{ role: string; content: string; time: string }[]>('uricai_chat', []),
  addChat: (msg: { role: string; content: string; time: string }) => {
    const list = getItem<{ role: string; content: string; time: string }[]>('uricai_chat', []);
    list.push(msg);
    setItem('uricai_chat', list);
  },

  getFastingStart: () => getItem<string | null>('uricai_fasting', null),
  setFastingStart: (t: string | null) => setItem('uricai_fasting', t),

  seedMockData: () => {
    const today = new Date();
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      return fmt(d);
    });

    // Uric acid mock
    const uricData: UricAcidEntry[] = days.map((date, i) => ({
      id: `ua-${i}`,
      value: [7.2, 6.8, 7.1, 6.5, 6.9, 6.3, 6.1][i],
      date,
      time: '08:00',
    }));
    setItem('uricai_uricacid', uricData);

    // Glucose mock
    const glucoseData: GlucoseEntry[] = [];
    days.forEach((date, i) => {
      ['08:00', '12:30', '18:30'].forEach((time, j) => {
        glucoseData.push({
          id: `gl-${i}-${j}`,
          value: [95, 140, 120, 105, 155, 110, 90, 135, 125, 100, 145, 115, 88, 130, 118, 92, 138, 112, 85, 128, 108][i * 3 + j],
          date,
          time,
          mealContext: ['fasting', 'after_meal', 'after_meal'][j] as GlucoseEntry['mealContext'],
          source: 'mock',
        });
      });
    });
    setItem('uricai_glucose', glucoseData);
    setItem('uricai_libre_meta', null);

    // Meals mock
    const mealData: MealEntry[] = [
      { id: 'm1', date: fmt(today), time: '08:00', type: 'breakfast', name: '현미밥 + 된장국 + 계란후라이', calories: 420, purineLevel: 'low', gi: 55, protein: 18, carbs: 52, fat: 14 },
      { id: 'm2', date: fmt(today), time: '12:30', type: 'lunch', name: '닭가슴살 샐러드', calories: 350, purineLevel: 'medium', gi: 35, protein: 32, carbs: 18, fat: 12 },
    ];
    setItem('uricai_meals', mealData);

    // GLP-1 mock
    const glp1Data: GLP1Entry[] = days.slice(0, 4).map((date, i) => ({
      id: `g-${i}`,
      date,
      drug: '오젬픽',
      dose: 0.5,
      unit: 'mg',
      site: ['왼쪽 복부', '오른쪽 복부', '왼쪽 허벅지', '오른쪽 허벅지'][i],
      sideEffects: i === 1 ? ['메스꺼움'] : [],
      weight: [82.5, 82.1, 81.8, 81.3][i],
    }));
    setItem('uricai_glp1', glp1Data);

    // Weight mock
    const weightData: WeightEntry[] = days.map((date, i) => ({
      id: `w-${i}`,
      date,
      value: [82.5, 82.3, 82.1, 81.8, 81.5, 81.3, 81.0][i],
    }));
    setItem('uricai_weight', weightData);

    // Family mock
    setItem('uricai_family', [
      { id: 'f1', name: '아내', relation: '배우자', isKid: false, avatar: '👩' },
      { id: 'f2', name: '민준', relation: '아들', isKid: true, avatar: '👦' },
    ]);
  },
};
