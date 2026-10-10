/**
 * SupplyShield AI — File Parser & Template Generator
 * 
 * Safely parses .csv and .xlsx files with strict size limits, type checks,
 * and error handling. Generates sample templates and exports analysis results.
 */

import Papa from 'papaparse';
import readXlsxFile from 'read-excel-file/universal';
import * as fflate from 'fflate';
import { SAMPLE_TEMPLATE_ROWS } from './importSchema.js';

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB limit
export const SUPPORTED_EXTENSIONS = ['.csv', '.xlsx', '.xls'];

/**
 * Validate file metadata (size, extension)
 */
export function validateFileMetadata(file) {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  const fileName = file.name || '';
  const fileSize = file.size || (file.byteLength || 0);

  if (fileSize > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (fileSize / (1024 * 1024)).toFixed(1);
    throw new Error(`File is too large (${sizeMb} MB). Maximum allowed size is 5 MB.`);
  }

  const lowerName = fileName.toLowerCase();
  const hasValidExt = SUPPORTED_EXTENSIONS.some(ext => lowerName.endsWith(ext));

  if (!hasValidExt && fileName) {
    throw new Error(`Unsupported file type: "${fileName}". Please upload a .csv or .xlsx spreadsheet.`);
  }

  return {
    isCsv: lowerName.endsWith('.csv'),
    isXlsx: lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')
  };
}

/**
 * Parse an uploaded file (.csv or .xlsx)
 * Supports browser File/Blob as well as ArrayBuffer / string for testing.
 */
export async function parseUploadedFile(file) {
  const { isCsv } = validateFileMetadata(file);

  if (isCsv) {
    return parseCsvFile(file);
  } else {
    return parseXlsxFile(file);
  }
}

/**
 * Parse CSV content safely via PapaParse
 */
export async function parseCsvFile(file) {
  let csvText = '';

  if (typeof file === 'string') {
    csvText = file;
  } else if (file && typeof file.text === 'function') {
    csvText = await file.text();
  } else if (file instanceof ArrayBuffer || (typeof Buffer !== 'undefined' && Buffer.isBuffer && Buffer.isBuffer(file))) {
    const decoder = new TextDecoder('utf-8');
    csvText = decoder.decode(file);
  } else {
    throw new Error('Unable to read CSV file content. Please check file format.');
  }

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => (header ? header.trim() : ''),
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          reject(new Error('The uploaded CSV file is empty or contains no readable rows.'));
          return;
        }

        const headers = (results.meta && results.meta.fields) 
          ? results.meta.fields.filter(Boolean) 
          : Object.keys(results.data[0] || {});

        if (headers.length === 0) {
          reject(new Error('No column headers detected in the uploaded CSV file.'));
          return;
        }

        // Filter out empty rows
        const cleanedRows = results.data.filter(row => {
          if (!row || typeof row !== 'object') return false;
          return Object.values(row).some(v => v !== null && v !== undefined && String(v).trim() !== '');
        });

        resolve({
          fileName: file.name || 'uploaded_vendors.csv',
          fileSize: file.size || csvText.length,
          fileType: 'CSV',
          headers,
          rows: cleanedRows,
          rawRowCount: cleanedRows.length
        });
      },
      error: (err) => {
        reject(new Error(`CSV parsing error: ${err.message}`));
      }
    });
  });
}

/**
 * Parse XLSX content safely via read-excel-file
 */
export async function parseXlsxFile(file) {
  let inputForParser = file;

  // If node Buffer or Uint8Array, convert to ArrayBuffer
  if (file && typeof file.arrayBuffer === 'function') {
    inputForParser = await file.arrayBuffer();
  } else if (file instanceof Uint8Array) {
    inputForParser = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
  }

  try {
    const parsed = await readXlsxFile(inputForParser);
    
    // read-excel-file returns array of rows or { sheet, data } structure
    let rowsArray = [];
    if (Array.isArray(parsed)) {
      if (parsed.length > 0 && parsed[0]?.data) {
        // Multi-sheet format: take first sheet
        rowsArray = parsed[0].data;
      } else {
        rowsArray = parsed;
      }
    } else if (parsed && parsed.data) {
      rowsArray = parsed.data;
    }

    if (!rowsArray || rowsArray.length === 0) {
      throw new Error('The uploaded Excel file contains no worksheets or data.');
    }

    // Row 0 is the headers
    const rawHeaders = rowsArray[0] || [];
    const headers = rawHeaders.map(h => (h != null ? String(h).trim() : '')).filter(Boolean);

    if (headers.length === 0) {
      throw new Error('No valid column headers found in the first row of the Excel sheet.');
    }

    const dataRows = [];
    for (let i = 1; i < rowsArray.length; i++) {
      const row = rowsArray[i];
      if (!row || !Array.isArray(row)) continue;

      const rowObj = {};
      let hasAnyValue = false;

      rawHeaders.forEach((headerName, colIdx) => {
        if (!headerName) return;
        const key = String(headerName).trim();
        const cellVal = row[colIdx];
        if (cellVal !== undefined && cellVal !== null && cellVal !== '') {
          hasAnyValue = true;
          // Format Date instances to ISO date string YYYY-MM-DD
          if (cellVal instanceof Date) {
            rowObj[key] = cellVal.toISOString().split('T')[0];
          } else {
            rowObj[key] = cellVal;
          }
        } else {
          rowObj[key] = '';
        }
      });

      if (hasAnyValue) {
        dataRows.push(rowObj);
      }
    }

    return {
      fileName: file.name || 'uploaded_vendors.xlsx',
      fileSize: file.size || (inputForParser?.byteLength || 0),
      fileType: 'XLSX',
      headers,
      rows: dataRows,
      rawRowCount: dataRows.length
    };
  } catch (err) {
    throw new Error(`Excel spreadsheet parsing error: ${err.message || 'Corrupt or unreadable XLSX structure.'}`);
  }
}

/**
 * Generate CSV text content for the sample template
 */
export function generateSampleCsvContent() {
  const headers = [
    'Vendor Name',
    'Delivery Performance (%)',
    'Quality Defect Rate (%)',
    'Price Variance (%)',
    'Stock Coverage (Days)',
    'Lead Time (Days)',
    'Cert Days Remaining',
    'Single Source',
    'Category',
    'Supplied Item',
    'Annual Spend ($)',
    'Facility Location'
  ];

  const rows = SAMPLE_TEMPLATE_ROWS.map(r => [
    `"${r.vendorName}"`,
    r.deliveryPerformance,
    r.qualityDefectRate,
    r.priceVariance,
    r.stockCoverageDays,
    r.leadTimeDays,
    r.certificateDaysRemaining,
    r.singleSource,
    `"${r.itemCategory}"`,
    `"${r.suppliedItem}"`,
    r.annualSpend,
    `"${r.facilityLocation}"`
  ].join(','));

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Generate an OpenXML (.xlsx) binary buffer for sample download
 */
export function generateSampleXlsxBuffer() {
  const headers = [
    'Vendor Name',
    'Delivery Performance (%)',
    'Quality Defect Rate (%)',
    'Price Variance (%)',
    'Stock Coverage (Days)',
    'Lead Time (Days)',
    'Cert Days Remaining',
    'Single Source',
    'Category',
    'Supplied Item',
    'Annual Spend ($)',
    'Facility Location'
  ];

  const rows = SAMPLE_TEMPLATE_ROWS.map(r => ({
    'Vendor Name': r.vendorName,
    'Delivery Performance (%)': r.deliveryPerformance,
    'Quality Defect Rate (%)': r.qualityDefectRate,
    'Price Variance (%)': r.priceVariance,
    'Stock Coverage (Days)': r.stockCoverageDays,
    'Lead Time (Days)': r.leadTimeDays,
    'Cert Days Remaining': r.certificateDaysRemaining,
    'Single Source': r.singleSource,
    'Category': r.itemCategory,
    'Supplied Item': r.suppliedItem,
    'Annual Spend ($)': r.annualSpend,
    'Facility Location': r.facilityLocation
  }));

  const escapeXml = (str) => {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const colLetter = (idx) => {
    let letter = '';
    let temp = idx;
    while (temp >= 0) {
      letter = String.fromCharCode((temp % 26) + 65) + letter;
      temp = Math.floor(temp / 26) - 1;
    }
    return letter;
  };

  let sheetDataXml = '<sheetData>';
  sheetDataXml += '<row r="1">';
  headers.forEach((h, colIdx) => {
    const cellRef = `${colLetter(colIdx)}1`;
    sheetDataXml += `<c r="${cellRef}" t="inlineStr"><is><t>${escapeXml(h)}</t></is></c>`;
  });
  sheetDataXml += '</row>';

  rows.forEach((row, rowIdx) => {
    const rNum = rowIdx + 2;
    sheetDataXml += `<row r="${rNum}">`;
    headers.forEach((h, colIdx) => {
      const cellRef = `${colLetter(colIdx)}${rNum}`;
      const val = row[h];
      if (val !== undefined && val !== null && val !== '') {
        const numVal = Number(val);
        if (!isNaN(numVal) && typeof val !== 'boolean') {
          sheetDataXml += `<c r="${cellRef}"><v>${numVal}</v></c>`;
        } else {
          sheetDataXml += `<c r="${cellRef}" t="inlineStr"><is><t>${escapeXml(val)}</t></is></c>`;
        }
      }
    });
    sheetDataXml += '</row>';
  });
  sheetDataXml += '</sheetData>';

  const contentTypesXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
    '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
    '</Types>';

  const relsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
    '</Relationships>';

  const wbXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
    '<sheets><sheet name="Vendors" sheetId="1" r:id="rId1"/></sheets>' +
    '</workbook>';

  const wbRelsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
    '</Relationships>';

  const wsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    sheetDataXml +
    '</worksheet>';

  const zipObj = {
    '[Content_Types].xml': fflate.strToU8(contentTypesXml),
    '_rels/.rels': fflate.strToU8(relsXml),
    'xl/workbook.xml': fflate.strToU8(wbXml),
    'xl/_rels/workbook.xml.rels': fflate.strToU8(wbRelsXml),
    'xl/worksheets/sheet1.xml': fflate.strToU8(wsXml)
  };

  return fflate.zipSync(zipObj);
}

/**
 * Format analyzed suppliers to CSV
 */
export function exportAnalysisToCsv(analyzedSuppliers = []) {
  const headers = [
    'Vendor ID',
    'Vendor Name',
    'Composite Risk Score',
    'Risk Level',
    'Data Completeness (%)',
    'Delivery OTIF (%)',
    'Quality Defect Rate (%)',
    'Price Variance (%)',
    'Stock Coverage (Days)',
    'Lead Time (Days)',
    'Cert Days Remaining',
    'Single Source',
    'Primary Risk Driver',
    'Recommended Action'
  ];

  const escapeCsv = (str) => {
    if (str == null) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = analyzedSuppliers.map(s => {
    const topAction = s.preliminarySummary?.recommendedActions?.[0]?.title || 'Standard Monitoring';
    return [
      escapeCsv(s.id),
      escapeCsv(s.name),
      s.riskScore,
      escapeCsv(s.riskLevel),
      `${s.dataCompletenessScore || 100}%`,
      s.onTimeDeliveryRate != null ? `${s.onTimeDeliveryRate}%` : 'N/A',
      s.rejectionRate != null ? `${s.rejectionRate}%` : 'N/A',
      s.priceVarianceFormatted || 'N/A',
      s.stockCoverageDays != null ? `${s.stockCoverageDays}d` : 'N/A',
      s.leadTimeDays != null ? `${s.leadTimeDays}d` : 'N/A',
      s.certificateExpiryDays != null ? `${s.certificateExpiryDays}d` : 'N/A',
      s.isSingleSource ? 'Yes' : 'No',
      escapeCsv(s.preliminarySummary?.primaryRiskDriver || 'Nominal operational range'),
      escapeCsv(topAction)
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Safe client-side file downloader
 */
export function downloadFile(content, fileName, mimeType = 'text/csv') {
  if (typeof window === 'undefined') return;

  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
