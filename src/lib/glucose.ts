'use client';

import type { GlucoseEntry } from '@/lib/storage';

export interface GlucoseSummary {
  average: number;
  timeInRange: number;
  inRangeCount: number;
  totalCount: number;
  highCount: number;
  lowCount: number;
  gmi: number;
  spikeCount: number;
}

export function sortGlucoseEntries(entries: GlucoseEntry[]) {
  return [...entries].sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
}

export function summarizeGlucose(entries: GlucoseEntry[]): GlucoseSummary {
  if (entries.length === 0) {
    return {
      average: 0,
      timeInRange: 0,
      inRangeCount: 0,
      totalCount: 0,
      highCount: 0,
      lowCount: 0,
      gmi: 0,
      spikeCount: 0,
    };
  }

  const sorted = sortGlucoseEntries(entries);
  const inRangeCount = sorted.filter((entry) => entry.value >= 70 && entry.value <= 180).length;
  const highCount = sorted.filter((entry) => entry.value > 180).length;
  const lowCount = sorted.filter((entry) => entry.value < 70).length;
  const average = sorted.reduce((sum, entry) => sum + entry.value, 0) / sorted.length;
  const gmi = 3.31 + 0.02392 * average;

  let spikeCount = 0;
  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1];
    const current = sorted[index];
    if (current.value >= 140 && current.value - previous.value >= 30) {
      spikeCount += 1;
    }
  }

  return {
    average: Math.round(average),
    timeInRange: Math.round((inRangeCount / sorted.length) * 100),
    inRangeCount,
    totalCount: sorted.length,
    highCount,
    lowCount,
    gmi: Number(gmi.toFixed(1)),
    spikeCount,
  };
}

export function getDailyAverages(entries: GlucoseEntry[]) {
  const grouped = sortGlucoseEntries(entries).reduce<Record<string, number[]>>((accumulator, entry) => {
    if (!accumulator[entry.date]) {
      accumulator[entry.date] = [];
    }
    accumulator[entry.date].push(entry.value);
    return accumulator;
  }, {});

  return Object.entries(grouped).map(([date, values]) => ({
    date: date.slice(5).replace('-', '/'),
    value: Math.round(values.reduce((sum, current) => sum + current, 0) / values.length),
  }));
}

export function getTodaySeries(entries: GlucoseEntry[]) {
  const today = new Date().toISOString().split('T')[0];
  return sortGlucoseEntries(entries)
    .filter((entry) => entry.date === today)
    .map((entry) => ({
      label: entry.time.slice(0, 5),
      value: entry.value,
    }));
}

export function getLatestTrend(entries: GlucoseEntry[]) {
  const sorted = sortGlucoseEntries(entries);
  const latest = sorted.at(-1);
  const previous = sorted.at(-2);

  if (!latest || !previous) {
    return null;
  }

  const delta = latest.value - previous.value;
  if (delta >= 20) return 'rising_fast';
  if (delta >= 8) return 'rising';
  if (delta <= -20) return 'falling_fast';
  if (delta <= -8) return 'falling';
  return 'steady';
}

export function getTrendLabel(trend: ReturnType<typeof getLatestTrend>) {
  switch (trend) {
    case 'rising_fast':
      return '빠르게 상승';
    case 'rising':
      return '상승';
    case 'falling_fast':
      return '빠르게 하강';
    case 'falling':
      return '하강';
    case 'steady':
      return '안정';
    default:
      return '데이터 수집 중';
  }
}

export function getSourceLabel(entry: GlucoseEntry) {
  if (entry.source === 'libre') return 'Libre';
  if (entry.source === 'mock') return '샘플';
  return '수동';
}
