/**
 * SupplyShield AI — Column Mapping & Data Validation Service
 * 
 * Maps uploaded spreadsheet columns to canonical schema fields, performs
 * range validation, identifies duplicates and missing fields, and produces
 * row-level diagnostic warnings and errors.
 */

import { CANONICAL_FIELDS, matchHeaderToCanonical } from './importSchema.js';

/**
 * Automatically map uploaded column headers to canonical schema fields
 */
export function autoDetectColumnMapping(headers = []) {
  const mapping = {};
  const usedHeaders = new Set();

  CANONICAL_FIELDS.forEach(field => {
    mapping[field.key] = '';
  });

  // First pass: exact and alias matches
  headers.forEach(header => {
    const matchedKey = matchHeaderToCanonical(header);
    if (matchedKey && !mapping[matchedKey] && !usedHeaders.has(header)) {
      mapping[matchedKey] = header;
      usedHeaders.add(header);
    }
  });

  return mapping;
}

/**
 * Parse numeric strings cleanly, removing currency symbols, percentage signs, and commas
 */
export function parseCleanNumber(val) {
  if (val === undefined || val === null || val === '') return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;

  const str = String(val).trim().replace(/[$,]/g, '').replace(/%/g, '');
  if (!str) return null;

  // Handle lead time weeks e.g. "16w" or "16 weeks" -> convert to days (*7)
  const weeksMatch = str.match(/^([0-9.]+)\s*(w|wk|wks|weeks?)$/i);
  if (weeksMatch) {
    const w = parseFloat(weeksMatch[1]);
    return isNaN(w) ? null : Math.round(w * 7);
  }

  // Handle days suffix e.g. "45d" or "45 days"
  const daysMatch = str.match(/^([0-9.]+)\s*(d|day|days)$/i);
  if (daysMatch) {
    const d = parseFloat(daysMatch[1]);
    return isNaN(d) ? null : d;
  }

  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

/**
 * Parse boolean values (Yes/No, True/False, 1/0)
 */
export function parseCleanBoolean(val) {
  if (val === undefined || val === null || val === '') return null;
  if (typeof val === 'boolean') return val;

  const str = String(val).trim().toLowerCase();
  if (['yes', 'y', 'true', '1', 'sole', 'single', 'critical'].includes(str)) return true;
  if (['no', 'n', 'false', '0', 'multi', 'standard', 'dual'].includes(str)) return false;

  return null;
}

/**
 * Parse certificate days remaining or date string
 */
export function parseCleanCertDays(val, referenceDate = new Date('2026-10-10T00:00:00Z')) {
  if (val === undefined || val === null || val === '') return null;

  // If already a number
  const cleanNum = parseCleanNumber(val);
  if (cleanNum !== null && !isNaN(cleanNum) && typeof val !== 'string' || (typeof val === 'string' && /^-?\d+(\.\d+)?$/.test(val.trim()))) {
    return Math.round(cleanNum);
  }

  // If Date object or date string
  let targetDate = null;
  if (val instanceof Date) {
    targetDate = val;
  } else if (typeof val === 'string' && val.includes('-') || val.includes('/')) {
    const parsed = new Date(val);
    if (!isNaN(parsed.getTime())) {
      targetDate = parsed;
    }
  }

  if (targetDate) {
    const diffMs = targetDate.getTime() - referenceDate.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  return cleanNum;
}

/**
 * Transform raw row values into canonical structured records
 */
export function mapRowToCanonical(rawRow, columnMapping) {
  const result = {};

  CANONICAL_FIELDS.forEach(field => {
    const headerName = columnMapping[field.key];
    const rawVal = headerName ? rawRow[headerName] : undefined;

    switch (field.key) {
      case 'vendorName':
        result.vendorName = rawVal != null ? String(rawVal).trim() : '';
        break;
      case 'deliveryPerformance':
      case 'qualityDefectRate':
      case 'priceVariance':
      case 'stockCoverageDays':
      case 'leadTimeDays':
      case 'annualSpend':
        result[field.key] = parseCleanNumber(rawVal);
        break;
      case 'certificateDaysRemaining':
        result.certificateDaysRemaining = parseCleanCertDays(rawVal);
        break;
      case 'singleSource':
        result.singleSource = parseCleanBoolean(rawVal);
        break;
      default:
        result[field.key] = rawVal != null ? String(rawVal).trim() : '';
        break;
    }
  });

  return result;
}

/**
 * Validate an array of raw rows using current column mapping
 */
export function validateUploadedData(rawRows = [], columnMapping = {}) {
  const results = [];
  const seenVendors = new Map(); // name -> firstRowIndex

  let totalErrors = 0;
  let totalWarnings = 0;
  let duplicateCount = 0;

  // Check if required vendorName mapping exists
  const hasVendorNameMapping = Boolean(columnMapping.vendorName);

  rawRows.forEach((rawRow, index) => {
    const rowNumber = index + 1;
    const errors = [];
    const warnings = [];
    const missingFields = [];

    const canonical = mapRowToCanonical(rawRow, columnMapping);

    // 1. Required Field: vendorName
    if (!canonical.vendorName) {
      errors.push('Vendor Name / Supplier Code is required.');
    } else {
      const lowerName = canonical.vendorName.toLowerCase();
      if (seenVendors.has(lowerName)) {
        duplicateCount++;
        warnings.push(`Duplicate vendor name detected: "${canonical.vendorName}" (first seen on row ${seenVendors.get(lowerName)}).`);
      } else {
        seenVendors.set(lowerName, rowNumber);
      }
    }

    // 2. Numeric Range Validations
    if (canonical.deliveryPerformance !== null) {
      if (canonical.deliveryPerformance < 0 || canonical.deliveryPerformance > 100) {
        errors.push(`Delivery Performance must be between 0% and 100% (got ${canonical.deliveryPerformance}%).`);
      }
    } else {
      missingFields.push('Delivery Performance');
      warnings.push('Delivery Performance not provided — logistics reliability will have partial confidence.');
    }

    if (canonical.qualityDefectRate !== null) {
      if (canonical.qualityDefectRate < 0 || canonical.qualityDefectRate > 100) {
        errors.push(`Quality Defect Rate must be between 0% and 100% (got ${canonical.qualityDefectRate}%).`);
      }
    } else {
      missingFields.push('Quality Defect Rate');
      warnings.push('Quality Defect Rate not provided — dock inspection trend cannot be evaluated.');
    }

    if (canonical.priceVariance !== null) {
      if (canonical.priceVariance < -100 || canonical.priceVariance > 500) {
        errors.push(`Price Variance out of realistic bounds (-100% to +500%, got ${canonical.priceVariance}%).`);
      }
    } else {
      missingFields.push('Price Variance');
      warnings.push('Contract Price Variance not provided — invoice overpayment exposure cannot be calculated.');
    }

    if (canonical.stockCoverageDays !== null) {
      if (canonical.stockCoverageDays < 0 || canonical.stockCoverageDays > 1000) {
        errors.push(`Stock Coverage Days must be between 0 and 1000 days (got ${canonical.stockCoverageDays}).`);
      }
    } else {
      missingFields.push('Stock Coverage');
      warnings.push('Stock Coverage not provided — inventory buffer risk evaluated with uncertainty.');
    }

    if (canonical.leadTimeDays !== null) {
      if (canonical.leadTimeDays < 0 || canonical.leadTimeDays > 1000) {
        errors.push(`Lead Time Days must be between 0 and 1000 days (got ${canonical.leadTimeDays}).`);
      }
    } else {
      missingFields.push('Lead Time');
    }

    if (canonical.certificateDaysRemaining !== null) {
      if (canonical.certificateDaysRemaining < 0) {
        warnings.push(`Certification expired ${Math.abs(canonical.certificateDaysRemaining)} days ago.`);
      }
    } else {
      missingFields.push('Certificate Expiry');
      warnings.push('Certificate Expiry not provided — compliance validity cannot be attested.');
    }

    if (canonical.singleSource === null) {
      missingFields.push('Single Source');
    }

    // 3. Data Completeness Calculation
    // 5 core vectors: Delivery, Quality, Price, Compliance, Continuity (Stock/LeadTime/SingleSource)
    const coreVectorsTotal = 5;
    let coreVectorsPresent = 0;
    if (canonical.deliveryPerformance !== null) coreVectorsPresent++;
    if (canonical.qualityDefectRate !== null) coreVectorsPresent++;
    if (canonical.priceVariance !== null) coreVectorsPresent++;
    if (canonical.certificateDaysRemaining !== null) coreVectorsPresent++;
    if (canonical.stockCoverageDays !== null || canonical.singleSource !== null) coreVectorsPresent++;

    const completenessPercent = Math.round((coreVectorsPresent / coreVectorsTotal) * 100);

    totalErrors += errors.length;
    totalWarnings += warnings.length;

    results.push({
      rowNumber,
      raw: rawRow,
      canonical,
      errors,
      warnings,
      missingFields,
      isValid: errors.length === 0,
      completenessScore: completenessPercent,
      hasIncompleteData: completenessPercent < 60
    });
  });

  const validRows = results.filter(r => r.isValid);
  const invalidRows = results.filter(r => !r.isValid);

  return {
    totalRows: results.length,
    validRows,
    invalidRows,
    results,
    hasVendorNameMapping,
    missingRequiredFields: hasVendorNameMapping ? [] : ['vendorName'],
    totalErrors,
    totalWarnings,
    duplicateCount,
    canAnalyze: hasVendorNameMapping && validRows.length > 0
  };
}
