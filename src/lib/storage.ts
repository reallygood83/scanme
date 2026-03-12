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

export interface AppSnapshot {
  profile: UserProfile;
  uricAcid: UricAcidEntry[];
  glucose: GlucoseEntry[];
  libreMeta: LibreImportMeta | null;
  meals: MealEntry[];
  glp1: GLP1Entry[];
  weight: WeightEntry[];
  family: FamilyMember[];
  chatHistory: { role: string; content: string; time: string }[];
  fastingStart: string | null;
}

const STORAGE_KEYS = {
  profile: 'uricai_profile',
  uricAcid: 'uricai_uricacid',
  glucose: 'uricai_glucose',
  libreMeta: 'uricai_libre_meta',
  meals: 'uricai_meals',
  glp1: 'uricai_glp1',
  weight: 'uricai_weight',
  family: 'uricai_family',
  chatHistory: 'uricai_chat',
  fastingStart: 'uricai_fasting',
} as const;

let syncHandler: (() => void) | null = null;

export function subscribeToStorageChanges(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = () => callback();
  window.addEventListener('uricai-storage-changed', handler as EventListener);
  return () => window.removeEventListener('uricai-storage-changed', handler as EventListener);
}

function emitStorageChange() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('uricai-storage-changed'));
  syncHandler?.();
}

export function registerStorageSync(handler: (() => void) | null) {
  syncHandler = handler;
}

export function getDefaultProfile(): UserProfile {
  return {
    name: '사용자',
    age: 35,
    onboardingComplete: false,
    selectedConditions: [],
    goutDiagnosed: false,
    useCGM: false,
    useGLP1: false,
    familyHistory: false,
    plan: 'free',
  };
}

export function getAppSnapshot(): AppSnapshot {
  return {
    profile: getItem<UserProfile>(STORAGE_KEYS.profile, getDefaultProfile()),
    uricAcid: getItem<UricAcidEntry[]>(STORAGE_KEYS.uricAcid, []),
    glucose: getItem<GlucoseEntry[]>(STORAGE_KEYS.glucose, []),
    libreMeta: getItem<LibreImportMeta | null>(STORAGE_KEYS.libreMeta, null),
    meals: getItem<MealEntry[]>(STORAGE_KEYS.meals, []),
    glp1: getItem<GLP1Entry[]>(STORAGE_KEYS.glp1, []),
    weight: getItem<WeightEntry[]>(STORAGE_KEYS.weight, []),
    family: getItem<FamilyMember[]>(STORAGE_KEYS.family, []),
    chatHistory: getItem<{ role: string; content: string; time: string }[]>(STORAGE_KEYS.chatHistory, []),
    fastingStart: getItem<string | null>(STORAGE_KEYS.fastingStart, null),
  };
}

export function hasMeaningfulSnapshot(snapshot: AppSnapshot) {
  return Boolean(
    snapshot.profile.onboardingComplete ||
    snapshot.uricAcid.length ||
    snapshot.glucose.length ||
    snapshot.meals.length ||
    snapshot.glp1.length ||
    snapshot.weight.length ||
    snapshot.family.length ||
    snapshot.chatHistory.length ||
    snapshot.fastingStart
  );
}

export function replaceAppSnapshot(snapshot: Partial<AppSnapshot>) {
  if (typeof window === 'undefined') return;

  if (snapshot.profile) setItem(STORAGE_KEYS.profile, snapshot.profile);
  if (snapshot.uricAcid) setItem(STORAGE_KEYS.uricAcid, snapshot.uricAcid);
  if (snapshot.glucose) setItem(STORAGE_KEYS.glucose, snapshot.glucose);
  if ('libreMeta' in snapshot) setItem(STORAGE_KEYS.libreMeta, snapshot.libreMeta ?? null);
  if (snapshot.meals) setItem(STORAGE_KEYS.meals, snapshot.meals);
  if (snapshot.glp1) setItem(STORAGE_KEYS.glp1, snapshot.glp1);
  if (snapshot.weight) setItem(STORAGE_KEYS.weight, snapshot.weight);
  if (snapshot.family) setItem(STORAGE_KEYS.family, snapshot.family);
  if (snapshot.chatHistory) setItem(STORAGE_KEYS.chatHistory, snapshot.chatHistory);
  if ('fastingStart' in snapshot) setItem(STORAGE_KEYS.fastingStart, snapshot.fastingStart ?? null);

  emitStorageChange();
}

export function clearAllAppData() {
  if (typeof window === 'undefined') return;
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  emitStorageChange();
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
  getProfile: () => getItem<UserProfile>(STORAGE_KEYS.profile, getDefaultProfile()),
  setProfile: (p: UserProfile) => {
    setItem(STORAGE_KEYS.profile, p);
    emitStorageChange();
  },

  getUricAcid: () => getItem<UricAcidEntry[]>(STORAGE_KEYS.uricAcid, []),
  addUricAcid: (e: UricAcidEntry) => {
    const list = getItem<UricAcidEntry[]>(STORAGE_KEYS.uricAcid, []);
    list.push(e);
    setItem(STORAGE_KEYS.uricAcid, list);
    emitStorageChange();
  },

  getGlucose: () => getItem<GlucoseEntry[]>(STORAGE_KEYS.glucose, []),
  addGlucose: (e: GlucoseEntry) => {
    const list = getItem<GlucoseEntry[]>(STORAGE_KEYS.glucose, []);
    list.push(e);
    setItem(STORAGE_KEYS.glucose, list);
    emitStorageChange();
  },
  importLibreGlucose: (entries: GlucoseEntry[], meta: LibreImportMeta) => {
    const existing = getItem<GlucoseEntry[]>(STORAGE_KEYS.glucose, []);
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

    setItem(STORAGE_KEYS.glucose, merged);
    setItem(STORAGE_KEYS.libreMeta, meta);
    emitStorageChange();
  },
  getLibreImportMeta: () => getItem<LibreImportMeta | null>(STORAGE_KEYS.libreMeta, null),
  clearLibreImportMeta: () => {
    setItem<LibreImportMeta | null>(STORAGE_KEYS.libreMeta, null);
    emitStorageChange();
  },

  getMeals: () => getItem<MealEntry[]>(STORAGE_KEYS.meals, []),
  addMeal: (e: MealEntry) => {
    const list = getItem<MealEntry[]>(STORAGE_KEYS.meals, []);
    list.push(e);
    setItem(STORAGE_KEYS.meals, list);
    emitStorageChange();
  },

  getGLP1: () => getItem<GLP1Entry[]>(STORAGE_KEYS.glp1, []),
  addGLP1: (e: GLP1Entry) => {
    const list = getItem<GLP1Entry[]>(STORAGE_KEYS.glp1, []);
    list.push(e);
    setItem(STORAGE_KEYS.glp1, list);
    emitStorageChange();
  },

  getWeight: () => getItem<WeightEntry[]>(STORAGE_KEYS.weight, []),
  addWeight: (e: WeightEntry) => {
    const list = getItem<WeightEntry[]>(STORAGE_KEYS.weight, []);
    list.push(e);
    setItem(STORAGE_KEYS.weight, list);
    emitStorageChange();
  },

  getFamily: () => getItem<FamilyMember[]>(STORAGE_KEYS.family, []),
  setFamily: (f: FamilyMember[]) => {
    setItem(STORAGE_KEYS.family, f);
    emitStorageChange();
  },

  getChatHistory: () => getItem<{ role: string; content: string; time: string }[]>(STORAGE_KEYS.chatHistory, []),
  addChat: (msg: { role: string; content: string; time: string }) => {
    const list = getItem<{ role: string; content: string; time: string }[]>(STORAGE_KEYS.chatHistory, []);
    list.push(msg);
    setItem(STORAGE_KEYS.chatHistory, list);
    emitStorageChange();
  },

  getFastingStart: () => getItem<string | null>(STORAGE_KEYS.fastingStart, null),
  setFastingStart: (t: string | null) => {
    setItem(STORAGE_KEYS.fastingStart, t);
    emitStorageChange();
  },

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
    setItem(STORAGE_KEYS.uricAcid, uricData);

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
    setItem(STORAGE_KEYS.glucose, glucoseData);
    setItem(STORAGE_KEYS.libreMeta, null);

    // Meals mock
    const mealData: MealEntry[] = [
      { id: 'm1', date: fmt(today), time: '08:00', type: 'breakfast', name: '현미밥 + 된장국 + 계란후라이', calories: 420, purineLevel: 'low', gi: 55, protein: 18, carbs: 52, fat: 14 },
      { id: 'm2', date: fmt(today), time: '12:30', type: 'lunch', name: '닭가슴살 샐러드', calories: 350, purineLevel: 'medium', gi: 35, protein: 32, carbs: 18, fat: 12 },
    ];
    setItem(STORAGE_KEYS.meals, mealData);

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
    setItem(STORAGE_KEYS.glp1, glp1Data);

    // Weight mock
    const weightData: WeightEntry[] = days.map((date, i) => ({
      id: `w-${i}`,
      date,
      value: [82.5, 82.3, 82.1, 81.8, 81.5, 81.3, 81.0][i],
    }));
    setItem(STORAGE_KEYS.weight, weightData);

    // Family mock
    setItem(STORAGE_KEYS.family, [
      { id: 'f1', name: '아내', relation: '배우자', isKid: false, avatar: '👩' },
      { id: 'f2', name: '민준', relation: '아들', isKid: true, avatar: '👦' },
    ]);
    emitStorageChange();
  },
  clearAllData: () => clearAllAppData(),
};
