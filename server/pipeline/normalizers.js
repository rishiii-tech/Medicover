// server/pipeline/normalizers.js

/**
 * Month lookup for parsing DD-MMM-YY dates (e.g., "01-Jul-26")
 */
const MONTH_MAP = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
};

/**
 * Explicit Date Parser: safely parses known date formats into ISO strings (YYYY-MM-DD HH:mm:ss)
 * and JavaScript Date objects without relying on ambient browser/system date parsers.
 */
function parseDateSafe(rawDateStr, sourceType = 'auto') {
  if (!rawDateStr || typeof rawDateStr !== 'string' || !rawDateStr.trim()) {
    return {
      isValid: false,
      iso: null,
      dateObj: null,
      dateOnly: null,
      timeOnly: null,
      displayStr: 'Not available',
      sourceValue: rawDateStr || ''
    };
  }

  const str = rawDateStr.trim();

  // 1. Check for HIS format: YYYY-MM-DD HH:mm:ss or YYYY-MM-DD HH:mm
  const hisMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (hisMatch) {
    const [_, y, m, d, hh = '00', mm = '00', ss = '00'] = hisMatch;
    const iso = `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
    const dateObj = new Date(Date.UTC(+y, +m - 1, +d, +hh, +mm, +ss));
    return {
      isValid: true,
      iso,
      dateObj,
      dateOnly: `${y}-${m}-${d}`,
      timeOnly: `${hh}:${mm}:${ss}`,
      displayStr: `${d}-${m}-${y} ${hh}:${mm}`,
      sourceValue: str
    };
  }

  // 2. Check for Lab format: DD/MM/YYYY HH:mm or DD/MM/YYYY HH:mm:ss
  const labMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (labMatch) {
    const [_, dRaw, mRaw, y, hh = '00', mm = '00', ss = '00'] = labMatch;
    const d = dRaw.padStart(2, '0');
    const m = mRaw.padStart(2, '0');
    const iso = `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
    const dateObj = new Date(Date.UTC(+y, +m - 1, +d, +hh, +mm, +ss));
    return {
      isValid: true,
      iso,
      dateObj,
      dateOnly: `${y}-${m}-${d}`,
      timeOnly: `${hh}:${mm}:${ss}`,
      displayStr: `${d}-${m}-${y} ${hh}:${mm}`,
      sourceValue: str
    };
  }

  // 3. Check for Bed Sheet format: DD-MMM-YY or DD-MMM-YYYY (e.g. "01-Jul-26")
  const bedMatch = str.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2,4})$/);
  if (bedMatch) {
    const [_, dRaw, mName, yRaw] = bedMatch;
    const d = dRaw.padStart(2, '0');
    const m = MONTH_MAP[mName.toLowerCase()] || '01';
    let y = yRaw;
    if (y.length === 2) {
      y = `20${y}`; // 2026 dataset
    }
    const iso = `${y}-${m}-${d} 00:00:00`;
    const dateObj = new Date(Date.UTC(+y, +m - 1, +d, 0, 0, 0));
    return {
      isValid: true,
      iso,
      dateObj,
      dateOnly: `${y}-${m}-${d}`,
      timeOnly: '00:00:00',
      displayStr: `${d}-${m}-${y}`,
      sourceValue: str
    };
  }

  // If no known pattern matched, return invalid
  return {
    isValid: false,
    iso: null,
    dateObj: null,
    dateOnly: null,
    timeOnly: null,
    displayStr: 'Invalid Date',
    sourceValue: str
  };
}

/**
 * Ward Normalization Layer: maps heterogeneous ward naming variations to canonical ward names
 */
const WARD_MAPPING = {
  // ICU variants
  'icu': 'Intensive Care Unit (ICU)',
  'i.c.u.': 'Intensive Care Unit (ICU)',
  'i.c.u': 'Intensive Care Unit (ICU)',
  'intensive care unit': 'Intensive Care Unit (ICU)',

  // Medical ICU variants
  'micu': 'Medical ICU (MICU)',
  'medical icu': 'Medical ICU (MICU)',
  'm.i.c.u.': 'Medical ICU (MICU)',

  // General Ward A variants
  'gen ward a': 'General Ward A',
  'gen ward - a': 'General Ward A',
  'general ward a': 'General Ward A',
  'general ward - a': 'General Ward A',

  // General Ward B variants
  'gen ward b': 'General Ward B',
  'gen ward - b': 'General Ward B',
  'general ward b': 'General Ward B',
  'general ward - b': 'General Ward B',

  // Paediatrics variants
  'paediatrics': 'Paediatrics Ward',
  'pediatrics': 'Paediatrics Ward',
  'paediatric': 'Paediatrics Ward',
  'pediatric': 'Paediatrics Ward'
};

const WARD_CAPACITIES = {
  'Intensive Care Unit (ICU)': 12,
  'Medical ICU (MICU)': 10,
  'General Ward A': 30,
  'General Ward B': 30,
  'Paediatrics Ward': 16
};

function normalizeWard(rawWard) {
  if (!rawWard || typeof rawWard !== 'string') {
    return {
      canonicalWard: 'Unknown Ward',
      sourceWard: rawWard || '',
      capacity: 0
    };
  }

  const clean = rawWard.trim();
  const lookupKey = clean.toLowerCase().replace(/\s+/g, ' ');
  const canonical = WARD_MAPPING[lookupKey] || clean;
  const capacity = WARD_CAPACITIES[canonical] || 0;

  return {
    canonicalWard: canonical,
    sourceWard: clean,
    capacity
  };
}

/**
 * Patient ID Normalization: bridges prefixed HIS IDs (e.g. MCH-0001001) and bare integers (e.g. 1023)
 */
function normalizePatientId(rawId) {
  if (!rawId) {
    return {
      canonicalId: 'MCH-UNKNOWN',
      numericId: null,
      sourceId: ''
    };
  }

  const str = String(rawId).trim();
  const digitsMatch = str.match(/\d+/);
  if (digitsMatch) {
    const numericVal = parseInt(digitsMatch[0], 10);
    // Canonical format MCH-000XXXX
    const padded = String(numericVal).padStart(7, '0');
    return {
      canonicalId: `MCH-${padded}`,
      numericId: numericVal,
      sourceId: str
    };
  }

  return {
    canonicalId: str,
    numericId: null,
    sourceId: str
  };
}

/**
 * Priority Normalizer
 */
function normalizePriority(rawPriority) {
  if (!rawPriority) return 'ROUTINE';
  const clean = String(rawPriority).trim().toUpperCase();
  if (clean === 'STAT') return 'STAT';
  if (clean === 'URGENT') return 'URGENT';
  return 'ROUTINE';
}

/**
 * Gender Normalizer
 */
function normalizeGender(rawGender) {
  if (!rawGender) return 'Not available';
  const clean = String(rawGender).trim().toUpperCase();
  if (clean === 'M' || clean === 'MALE') return 'Male';
  if (clean === 'F' || clean === 'FEMALE') return 'Female';
  return clean;
}

module.exports = {
  parseDateSafe,
  normalizeWard,
  normalizePatientId,
  normalizePriority,
  normalizeGender,
  WARD_CAPACITIES
};
