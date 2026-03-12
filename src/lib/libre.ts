'use client';

import type { GlucoseEntry, LibreImportMeta } from '@/lib/storage';

interface ParsedRow {
  [key: string]: string;
}

export interface LibreImportResult {
  entries: GlucoseEntry[];
  meta: LibreImportMeta;
}

const HEADER_CANDIDATES = {
  id: ['ID', 'Id'],
  time: ['Time', 'Device Timestamp', 'Timestamp'],
  recordType: ['Record Type', 'RecordType'],
  historicMmol: ['Historic Glucose (mmol/L)', 'Historic Glucose mmol/L'],
  historicMg: ['Historic Glucose mg/dL', 'Historic Glucose (mg/dL)'],
  scanMmol: ['Scan Glucose (mmol/L)', 'Scan Glucose mmol/L'],
  scanMg: ['Scan Glucose mg/dL', 'Scan Glucose (mg/dL)'],
  stripMmol: ['Strip Glucose (mmol/L)', 'Strip Glucose mmol/L'],
  stripMg: ['Strip Glucose mg/dL', 'Strip Glucose (mg/dL)'],
  device: ['Device'],
  serialNumber: ['Serial Number', 'SerialNumber'],
  notes: ['Notes', 'Note'],
};

function detectDelimiter(line: string) {
  if (line.includes('\t')) return '\t';
  return ',';
}

function splitRow(line: string, delimiter: string) {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      if (insideQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (character === delimiter && !insideQuotes) {
      result.push(current.trim());
      current = '';
      continue;
    }

    current += character;
  }

  result.push(current.trim());
  return result;
}

function normalizeHeader(value: string) {
  return value.replace(/^\uFEFF/, '').trim();
}

function getColumnValue(row: ParsedRow, candidates: string[]) {
  for (const candidate of candidates) {
    if (candidate in row && row[candidate] !== '') {
      return row[candidate];
    }
  }

  return '';
}

function parseNumber(value: string) {
  if (!value) return null;
  const normalized = value.replace(',', '.').trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function mmolToMg(value: number) {
  return Math.round(value * 18.0182);
}

function parseTimestamp(rawValue: string): { date: Date | null; ambiguous: boolean } {
  const value = rawValue.trim();
  if (!value) return { date: null, ambiguous: false };

  const native = new Date(value);
  if (!Number.isNaN(native.getTime())) {
    return { date: native, ambiguous: false };
  }

  const isoLike = value.match(/^(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})\s+(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (isoLike) {
    const [, year, month, day, hourValue, minute, meridiem] = isoLike;
    let hour = Number(hourValue);
    if (meridiem) {
      const upper = meridiem.toUpperCase();
      if (upper === 'PM' && hour < 12) hour += 12;
      if (upper === 'AM' && hour === 12) hour = 0;
    }
    return { date: new Date(Number(year), Number(month) - 1, Number(day), hour, Number(minute)), ambiguous: false };
  }

  const regional = value.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})\s+(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (regional) {
    const [, first, second, year, hourValue, minute, meridiem] = regional;
    if (Number(first) <= 12 && Number(second) <= 12) {
      return { date: null, ambiguous: true };
    }
    const month = Number(first) <= 12 ? Number(first) : Number(second);
    const day = Number(first) <= 12 ? Number(second) : Number(first);
    let hour = Number(hourValue);
    if (meridiem) {
      const upper = meridiem.toUpperCase();
      if (upper === 'PM' && hour < 12) hour += 12;
      if (upper === 'AM' && hour === 12) hour = 0;
    }
    return { date: new Date(Number(year), month - 1, day, hour, Number(minute)), ambiguous: false };
  }

  return { date: null, ambiguous: false };
}

export function parseLibreFile(fileContent: string, fileName: string): LibreImportResult {
  const lines = fileContent
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error('Libre 파일 형식이 올바르지 않습니다.');
  }

  let headerIndex = 0;
  if (!lines[0].includes('\t') && !lines[0].includes(',')) {
    headerIndex = 1;
  }

  const delimiter = detectDelimiter(lines[headerIndex]);
  const headers = splitRow(lines[headerIndex], delimiter).map(normalizeHeader);

  if (!headers.some((header) => HEADER_CANDIDATES.time.includes(header))) {
    throw new Error('Libre 파일에서 시간 컬럼을 찾지 못했습니다.');
  }

  const rows: ParsedRow[] = lines.slice(headerIndex + 1).map((line) => {
    const values = splitRow(line, delimiter);
    return headers.reduce<ParsedRow>((accumulator, header, index) => {
      accumulator[header] = values[index] ?? '';
      return accumulator;
    }, {});
  });

  const entries: GlucoseEntry[] = [];
  let detectedDevice = '';
  let detectedSerialNumber = '';
  let skippedCount = 0;
  let ambiguousDates = 0;

  rows.forEach((row, index) => {
    const timestampRaw = getColumnValue(row, HEADER_CANDIDATES.time);
    const parsedTimestamp = parseTimestamp(timestampRaw);
    if (parsedTimestamp.ambiguous) {
      ambiguousDates += 1;
      skippedCount += 1;
      return;
    }

    const timestamp = parsedTimestamp.date;
    if (!timestamp) {
      skippedCount += 1;
      return;
    }

    const recordType = getColumnValue(row, HEADER_CANDIDATES.recordType);
    const historicMmol = parseNumber(getColumnValue(row, HEADER_CANDIDATES.historicMmol));
    const historicMg = parseNumber(getColumnValue(row, HEADER_CANDIDATES.historicMg));
    const scanMmol = parseNumber(getColumnValue(row, HEADER_CANDIDATES.scanMmol));
    const scanMg = parseNumber(getColumnValue(row, HEADER_CANDIDATES.scanMg));
    const stripMmol = parseNumber(getColumnValue(row, HEADER_CANDIDATES.stripMmol));
    const stripMg = parseNumber(getColumnValue(row, HEADER_CANDIDATES.stripMg));

    const rawValue = historicMg ?? scanMg ?? stripMg ?? (historicMmol ? mmolToMg(historicMmol) : null) ?? (scanMmol ? mmolToMg(scanMmol) : null) ?? (stripMmol ? mmolToMg(stripMmol) : null);

    if (!rawValue) {
      return;
    }

    if (!detectedDevice) {
      detectedDevice = getColumnValue(row, HEADER_CANDIDATES.device);
    }

    if (!detectedSerialNumber) {
      detectedSerialNumber = getColumnValue(row, HEADER_CANDIDATES.serialNumber);
    }

    const date = timestamp.toISOString().split('T')[0];
    const time = timestamp.toTimeString().slice(0, 5);
    const resolvedRecordType = recordType === '1' ? 'scan' : recordType === '5' ? 'event' : 'historic';
    const recordId = getColumnValue(row, HEADER_CANDIDATES.id) || `${timestamp.getTime()}-${index}`;

    entries.push({
      id: `libre-${recordId}`,
      value: rawValue,
      date,
      time,
      mealContext: 'continuous',
      source: 'libre',
      recordType: resolvedRecordType,
      device: detectedDevice || undefined,
      serialNumber: detectedSerialNumber || undefined,
      notes: getColumnValue(row, HEADER_CANDIDATES.notes) || undefined,
    });
  });

  if (entries.length === 0) {
    throw new Error('가져올 혈당 데이터가 없습니다. LibreView 원본 파일인지 확인해주세요.');
  }

  if (ambiguousDates > 0) {
    throw new Error('날짜 형식이 모호한 Libre 파일입니다. LibreView 원본 파일을 다시 내보내거나 YYYY/MM/DD 형식인지 확인해주세요.');
  }

  const sorted = [...entries].sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));

  return {
    entries: sorted,
    meta: {
      source: 'libreview_csv',
      fileName,
      importedAt: new Date().toISOString(),
      readingCount: sorted.length,
      skippedCount,
      firstReadingAt: `${sorted[0].date}T${sorted[0].time}`,
      lastReadingAt: `${sorted[sorted.length - 1].date}T${sorted[sorted.length - 1].time}`,
      device: detectedDevice || undefined,
      serialNumber: detectedSerialNumber || undefined,
    },
  };
}
