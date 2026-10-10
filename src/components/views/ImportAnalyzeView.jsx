import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  AlertTriangle, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  Trash2, 
  Check, 
  Search, 
  Eye, 
  PlusCircle, 
  Database,
  ArrowUpDown,
  Info
} from 'lucide-react';
import { CANONICAL_FIELDS } from '../../import/importSchema';
import { 
  parseUploadedFile, 
  generateSampleCsvContent, 
  generateSampleXlsxBuffer, 
  exportAnalysisToCsv, 
  downloadFile 
} from '../../import/importParser';
import { 
  autoDetectColumnMapping, 
  validateUploadedData 
} from '../../import/importValidator';
import { 
  adaptUploadedSuppliersToEntities 
} from '../../import/uploadedDataAdapter';
import { SupplierAnalysisReportModal } from '../import/SupplierAnalysisReportModal';

export function ImportAnalyzeView({
  uploadedDataset,
  activeDatasetMode,
  onSaveUploadedDataset,
  onClearUploadedDataset,
  onSetActiveDatasetMode,
  onQueueDecision,
  onNavigateTab
}) {
  const [dragActive, setDragActive] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [uploadedFileMeta, setUploadedFileMeta] = useState(null);
  const [rawHeaders, setRawHeaders] = useState([]);
  const [rawRows, setRawRows] = useState([]);

  // Mapping state
  const [columnMapping, setColumnMapping] = useState({});
  const [validationResult, setValidationResult] = useState(null);
  const [analyzedSuppliers, setAnalyzedSuppliers] = useState(
    uploadedDataset?.suppliers || []
  );

  // Workflow steps: 'upload' | 'mapping' | 'preview' | 'results'
  const [activeStep, setActiveStep] = useState(
    uploadedDataset?.suppliers?.length ? 'results' : 'upload'
  );

  // Results table filtering & sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [sortField, setSortField] = useState('riskScore');
  const [sortAsc, setSortAsc] = useState(false);
  const [inspectingSupplier, setInspectingSupplier] = useState(null);

  // Reset confirmation modal state
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const fileInputRef = useRef(null);

  // Handle Drag & Drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = async (file) => {
    setParsing(true);
    setParseError(null);
    try {
      const parsed = await parseUploadedFile(file);
      setUploadedFileMeta({
        fileName: parsed.fileName,
        fileSize: parsed.fileSize,
        fileType: parsed.fileType,
        rowCount: parsed.rawRowCount
      });
      setRawHeaders(parsed.headers);
      setRawRows(parsed.rows);

      // Auto-detect mapping
      const detected = autoDetectColumnMapping(parsed.headers);
      setColumnMapping(detected);

      // Run initial validation
      const validation = validateUploadedData(parsed.rows, detected);
      setValidationResult(validation);

      // Advance to mapping step
      setActiveStep('mapping');
    } catch (err) {
      setParseError(err.message || 'Failed to parse spreadsheet file.');
    } finally {
      setParsing(false);
    }
  };

  // Update column mapping
  const handleMappingChange = (canonicalKey, headerValue) => {
    const updated = { ...columnMapping, [canonicalKey]: headerValue };
    setColumnMapping(updated);
    if (rawRows.length > 0) {
      const validation = validateUploadedData(rawRows, updated);
      setValidationResult(validation);
    }
  };

  // Validate Data action
  const handleValidateData = () => {
    if (rawRows.length === 0) return;
    const validation = validateUploadedData(rawRows, columnMapping);
    setValidationResult(validation);
    setActiveStep('preview');
  };

  // Analyze Suppliers action
  const handleAnalyzeSuppliers = () => {
    if (!validationResult || !validationResult.validRows || validationResult.validRows.length === 0) {
      return;
    }

    const adapted = adaptUploadedSuppliersToEntities(validationResult.validRows, {
      fileName: uploadedFileMeta?.fileName || 'Uploaded Vendors',
      uploadedAt: new Date().toISOString()
    });

    setAnalyzedSuppliers(adapted);
    
    // Save to persistence
    if (onSaveUploadedDataset) {
      onSaveUploadedDataset({
        meta: uploadedFileMeta,
        suppliers: adapted,
        rawRowCount: rawRows.length
      });
    }

    // Auto-activate uploaded dataset mode
    if (onSetActiveDatasetMode) {
      onSetActiveDatasetMode('uploaded');
    }

    setActiveStep('results');
  };

  // Download Sample CSV
  const handleDownloadSampleCsv = () => {
    const csvContent = generateSampleCsvContent();
    downloadFile(csvContent, 'SupplyShield_Vendor_Template.csv', 'text/csv');
  };

  // Download Sample XLSX
  const handleDownloadSampleXlsx = () => {
    const xlsxBuffer = generateSampleXlsxBuffer();
    downloadFile(
      xlsxBuffer, 
      'SupplyShield_Vendor_Template.xlsx', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
  };

  // Export Results to CSV
  const handleExportResultsCsv = () => {
    if (analyzedSuppliers.length === 0) return;
    const csv = exportAnalysisToCsv(analyzedSuppliers);
    downloadFile(csv, 'SupplyShield_Risk_Analysis_Results.csv', 'text/csv');
  };

  // Filter & sort analyzed suppliers
  const filteredSuppliers = analyzedSuppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.itemCategory && s.itemCategory.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (riskFilter === 'ALL') return matchesSearch;
    if (riskFilter === 'INCOMPLETE') return matchesSearch && s.hasIncompleteData;
    return matchesSearch && s.riskLevel === riskFilter;
  });

  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (typeof aVal === 'string') {
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    aVal = aVal || 0;
    bVal = bVal || 0;
    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  // Risk Counts
  const criticalCount = analyzedSuppliers.filter(s => s.riskLevel === 'CRITICAL').length;
  const highCount = analyzedSuppliers.filter(s => s.riskLevel === 'HIGH').length;
  const medCount = analyzedSuppliers.filter(s => s.riskLevel === 'MEDIUM').length;
  const lowCount = analyzedSuppliers.filter(s => s.riskLevel === 'LOW').length;
  const incompleteCount = analyzedSuppliers.filter(s => s.hasIncompleteData).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner & Dataset Mode Status */}
      <div style={{
        padding: '20px 24px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: activeDatasetMode === 'uploaded' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: activeDatasetMode === 'uploaded' ? 'var(--teal-primary)' : '#10b981',
              border: `1px solid ${activeDatasetMode === 'uploaded' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
            }}>
              <Database size={12} />
              Active Context: {activeDatasetMode === 'uploaded' ? 'Uploaded Dataset' : 'Demo Dataset'}
            </span>

            {analyzedSuppliers.length > 0 && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                • {analyzedSuppliers.length} vendor records analyzed
              </span>
            )}
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            Supplier Data Import & Risk Intelligence
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Upload real vendor CSV/Excel sheets, map fields to canonical schema, and run deterministic 5-vector risk diagnostics.
          </p>
        </div>

        {/* Dataset Switcher Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {analyzedSuppliers.length > 0 && (
            <>
              {activeDatasetMode === 'demo' ? (
                <button
                  onClick={() => onSetActiveDatasetMode && onSetActiveDatasetMode('uploaded')}
                  className="btn btn-primary btn-sm"
                  title="Switch application workspace to your uploaded supplier analysis"
                >
                  <Database size={14} />
                  <span>Switch to Uploaded Data</span>
                </button>
              ) : (
                <button
                  onClick={() => onSetActiveDatasetMode && onSetActiveDatasetMode('demo')}
                  className="btn btn-secondary btn-sm"
                  title="Switch application back to standard demonstration dataset"
                >
                  <RefreshCw size={14} />
                  <span>Switch to Demo Data</span>
                </button>
              )}

              <button
                onClick={() => setShowResetConfirm(true)}
                className="btn btn-subtle btn-sm"
                title="Remove uploaded dataset and reset"
                style={{ color: '#ef4444' }}
              >
                <Trash2 size={14} />
                <span>Reset Upload</span>
              </button>
            </>
          )}

          {activeStep !== 'upload' && (
            <button
              onClick={() => {
                setActiveStep('upload');
                setUploadedFileMeta(null);
                setRawRows([]);
              }}
              className="btn btn-secondary btn-sm"
            >
              <UploadCloud size={14} />
              <span>Upload New File</span>
            </button>
          )}
        </div>
      </div>

      {/* Step Navigation Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '12px'
      }}>
        {[
          { id: 'upload', label: '1. Upload File', disabled: false },
          { id: 'mapping', label: '2. Map Columns', disabled: rawRows.length === 0 },
          { id: 'preview', label: '3. Validate Data', disabled: rawRows.length === 0 },
          { id: 'results', label: '4. Analysis Results', disabled: analyzedSuppliers.length === 0 }
        ].map((step) => {
          const isActive = activeStep === step.id;
          return (
            <button
              key={step.id}
              disabled={step.disabled}
              onClick={() => setActiveStep(step.id)}
              className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                fontSize: '0.8rem',
                opacity: step.disabled ? 0.45 : 1,
                cursor: step.disabled ? 'not-allowed' : 'pointer'
              }}
            >
              {step.label}
            </button>
          );
        })}
      </div>

      {/* ================= STEP 1: UPLOAD FILE ================= */}
      {activeStep === 'upload' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '48px 32px',
              borderRadius: 'var(--radius-md)',
              border: `2px dashed ${dragActive ? 'var(--teal-primary)' : 'var(--border-subtle)'}`,
              backgroundColor: dragActive ? 'rgba(56, 189, 248, 0.05)' : 'var(--bg-card)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              color: 'var(--teal-primary)'
            }}>
              <UploadCloud size={32} />
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
              Drag and drop your vendor spreadsheet here
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
              Supports CSV (.csv) and Excel (.xlsx, .xls) files up to 5 MB
            </p>

            <button 
              type="button" 
              className="btn btn-primary"
              disabled={parsing}
            >
              {parsing ? 'Parsing File...' : 'Choose File from Computer'}
            </button>
          </div>

          {/* Parsing Error Display */}
          {parseError && (
            <div style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
              <div style={{ fontSize: '0.85rem', color: '#ef4444' }}>
                {parseError}
              </div>
            </div>
          )}

          {/* Sample Templates & Canonical Fields Guide */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px'
          }}>
            {/* Downloadable Templates Card */}
            <div style={{
              padding: '20px 24px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <FileSpreadsheet size={18} style={{ color: 'var(--teal-primary)' }} />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                    Download Starter Templates
                  </h4>
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                  Use our standardized supplier template preloaded with realistic multi-vendor performance data to test data ingestion immediately.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={handleDownloadSampleCsv} 
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                >
                  <Download size={14} />
                  <span>Download Sample CSV</span>
                </button>
                <button 
                  onClick={handleDownloadSampleXlsx} 
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                >
                  <Download size={14} />
                  <span>Download Sample Excel</span>
                </button>
              </div>
            </div>

            {/* Field Specification Guide Card */}
            <div style={{
              padding: '20px 24px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Info size={18} style={{ color: 'var(--teal-primary)' }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                  Supported Canonical Fields
                </h4>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
                Our engine automatically matches column names. Only <strong style={{ color: 'var(--text-main)' }}>Vendor Name</strong> is required; other metrics enable corresponding risk vectors.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {CANONICAL_FIELDS.slice(0, 8).map(f => (
                  <span 
                    key={f.key} 
                    style={{
                      fontSize: '0.72rem',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor: f.required ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-card-elevated)',
                      color: f.required ? 'var(--teal-primary)' : 'var(--text-muted)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    {f.label} {f.required && '(Required)'}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 2: COLUMN MAPPING ================= */}
      {activeStep === 'mapping' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                Map Spreadsheet Columns to Canonical Schema
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                File: <strong style={{ color: 'var(--text-main)' }}>{uploadedFileMeta?.fileName}</strong> ({rawRows.length} rows detected)
              </p>
            </div>

            <button 
              onClick={handleValidateData}
              disabled={!columnMapping.vendorName}
              className="btn btn-primary btn-sm"
            >
              <span>Validate Data</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {!columnMapping.vendorName && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontSize: '0.825rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <span>Please map the <strong>Vendor Name / Supplier Code</strong> field. It is required to identify supplier records.</span>
            </div>
          )}

          {/* Mapping Grid Table */}
          <div style={{
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden'
          }}>
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Canonical System Field</th>
                  <th style={{ width: '35%' }}>Description & Required Range</th>
                  <th style={{ width: '35%' }}>Your Uploaded Column</th>
                </tr>
              </thead>
              <tbody>
                {CANONICAL_FIELDS.map(field => {
                  const currentMapped = columnMapping[field.key] || '';
                  return (
                    <tr key={field.key}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem' }}>
                            {field.label}
                          </span>
                          {field.required && (
                            <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700 }}>*</span>
                          )}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {field.description}
                      </td>
                      <td>
                        <select
                          value={currentMapped}
                          onChange={(e) => handleMappingChange(field.key, e.target.value)}
                          className="input-select"
                          style={{
                            width: '100%',
                            fontSize: '0.8rem',
                            borderColor: field.required && !currentMapped ? '#ef4444' : undefined
                          }}
                        >
                          <option value="">-- Do Not Import / Missing --</option>
                          {rawHeaders.map(header => (
                            <option key={header} value={header}>
                              {header}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button onClick={() => setActiveStep('upload')} className="btn btn-secondary">
              Back to Upload
            </button>
            <button 
              onClick={handleValidateData} 
              disabled={!columnMapping.vendorName} 
              className="btn btn-primary"
            >
              <span>Proceed to Validation</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 3: DATA VALIDATION PREVIEW ================= */}
      {activeStep === 'preview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Validation Summary Bar */}
          <div style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                Data Validation & Row-Level Audit
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                {validationResult?.validRows?.length || 0} valid records ready for risk engine analysis • {validationResult?.totalErrors || 0} errors • {validationResult?.totalWarnings || 0} warnings
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setActiveStep('mapping')} className="btn btn-secondary btn-sm">
                Adjust Mapping
              </button>
              <button 
                onClick={handleAnalyzeSuppliers} 
                disabled={!validationResult?.canAnalyze} 
                className="btn btn-primary btn-sm"
              >
                <span>Analyze Suppliers ({validationResult?.validRows?.length || 0})</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Validation Diagnostic Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div style={{
              padding: '14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Valid Vendors</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>
                {validationResult?.validRows?.length || 0}
              </div>
            </div>

            <div style={{
              padding: '14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Invalid / Fatal Rows</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: (validationResult?.invalidRows?.length || 0) > 0 ? '#ef4444' : 'var(--text-muted)' }}>
                {validationResult?.invalidRows?.length || 0}
              </div>
            </div>

            <div style={{
              padding: '14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Duplicate Vendors</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: (validationResult?.duplicateCount || 0) > 0 ? '#f59e0b' : 'var(--text-muted)' }}>
                {validationResult?.duplicateCount || 0}
              </div>
            </div>

            <div style={{
              padding: '14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Row Warnings</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b' }}>
                {validationResult?.totalWarnings || 0}
              </div>
            </div>
          </div>

          {/* Validation Rows Table */}
          <div style={{
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden'
          }}>
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: '8%' }}>Row</th>
                  <th style={{ width: '22%' }}>Vendor Name</th>
                  <th style={{ width: '12%' }}>Completeness</th>
                  <th style={{ width: '12%' }}>Status</th>
                  <th style={{ width: '46%' }}>Row-Level Diagnostics & Disclosures</th>
                </tr>
              </thead>
              <tbody>
                {(validationResult?.results || []).map((row) => (
                  <tr key={row.rowNumber} style={{ opacity: row.isValid ? 1 : 0.65 }}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      #{row.rowNumber}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem' }}>
                      {row.canonical.vendorName || '(Missing Name)'}
                    </td>
                    <td>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: row.completenessScore >= 60 ? '#10b981' : '#f59e0b'
                      }}>
                        {row.completenessScore}%
                      </span>
                    </td>
                    <td>
                      {row.isValid ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          backgroundColor: 'rgba(16, 185, 129, 0.12)',
                          color: '#10b981'
                        }}>
                          <Check size={12} /> Valid
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          backgroundColor: 'rgba(239, 68, 68, 0.12)',
                          color: '#ef4444'
                        }}>
                          <AlertCircle size={12} /> Invalid
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {row.errors.map((err, eIdx) => (
                          <span key={eIdx} style={{ fontSize: '0.75rem', color: '#ef4444' }}>
                            • {err}
                          </span>
                        ))}
                        {row.warnings.map((warn, wIdx) => (
                          <span key={wIdx} style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            • {warn}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button onClick={() => setActiveStep('mapping')} className="btn btn-secondary">
              Back to Mapping
            </button>
            <button 
              onClick={handleAnalyzeSuppliers} 
              disabled={!validationResult?.canAnalyze} 
              className="btn btn-primary"
            >
              <span>Run Deterministic Risk Engine</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 4: ANALYSIS RESULTS DASHBOARD ================= */}
      {activeStep === 'results' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Executive Results KPI Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px'
          }}>
            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Analyzed Vendors</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
                {analyzedSuppliers.length}
              </div>
            </div>

            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Critical / High Risk</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ef4444', marginTop: '4px' }}>
                {criticalCount + highCount}
              </div>
            </div>

            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Medium Risk</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f59e0b', marginTop: '4px' }}>
                {medCount}
              </div>
            </div>

            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Low Risk</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>
                {lowCount}
              </div>
            </div>

            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Incomplete Data Flags</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: incompleteCount > 0 ? '#f59e0b' : 'var(--text-muted)', marginTop: '4px' }}>
                {incompleteCount}
              </div>
            </div>
          </div>

          {/* Table Controls (Search, Risk Filters, CSV Export) */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative', width: '240px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter uploaded suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-text"
                  style={{ width: '100%', paddingLeft: '32px', height: '34px', fontSize: '0.8125rem' }}
                />
              </div>

              {/* Risk Filter Buttons */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INCOMPLETE'].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setRiskFilter(lvl)}
                    className={`btn btn-sm ${riskFilter === lvl ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={handleExportResultsCsv} 
                className="btn btn-secondary btn-sm"
              >
                <Download size={14} />
                <span>Export Results to CSV</span>
              </button>
            </div>
          </div>

          {/* Supplier Analysis Results Table */}
          <div style={{
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden'
          }}>
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th 
                    onClick={() => {
                      if (sortField === 'name') setSortAsc(!sortAsc);
                      else { setSortField('name'); setSortAsc(true); }
                    }}
                    style={{ cursor: 'pointer', width: '22%' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Vendor Name</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th 
                    onClick={() => {
                      if (sortField === 'riskScore') setSortAsc(!sortAsc);
                      else { setSortField('riskScore'); setSortAsc(false); }
                    }}
                    style={{ cursor: 'pointer', width: '15%' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Calculated Risk</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th style={{ width: '12%' }}>Completeness</th>
                  <th style={{ width: '23%' }}>Primary Risk Signal</th>
                  <th style={{ width: '16%' }}>Top Recommended Action</th>
                  <th style={{ width: '12%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedSuppliers.map((supplier) => {
                  const topAction = supplier.preliminarySummary?.recommendedActions?.[0];
                  return (
                    <tr key={supplier.id}>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem' }}>
                            {supplier.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {supplier.code} • {supplier.itemCategory}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={`badge ${
                            supplier.riskLevel === 'CRITICAL' ? 'badge-risk-critical' :
                            supplier.riskLevel === 'HIGH' ? 'badge-risk-high' :
                            supplier.riskLevel === 'MEDIUM' ? 'badge-risk-med' : 'badge-risk-low'
                          }`}>
                            {supplier.riskLevel} ({supplier.riskScore})
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: supplier.hasIncompleteData ? '#f59e0b' : '#10b981'
                        }}>
                          {supplier.dataCompletenessScore || 0}%
                        </span>
                        {supplier.hasIncompleteData && (
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            Partial Data
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {supplier.preliminarySummary?.primaryRiskDriver || 'Operational indicators nominal'}
                      </td>
                      <td>
                        {topAction ? (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', fontWeight: 500 }}>
                            {topAction.title}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Routine Monitoring</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            onClick={() => setInspectingSupplier(supplier)}
                            className="btn btn-secondary btn-sm"
                            title="View Full Analysis Dossier"
                          >
                            <Eye size={13} />
                            <span>Analyze</span>
                          </button>
                          {topAction && (
                            <button
                              onClick={() => {
                                if (onQueueDecision) {
                                  onQueueDecision({
                                    ...topAction,
                                    supplierId: supplier.id,
                                    supplierCode: supplier.code,
                                    supplierName: supplier.name,
                                    actionTitle: topAction.title,
                                    category: topAction.category || 'Operational',
                                    urgency: topAction.urgency || 'HIGH',
                                    whyRecommended: topAction.whyRecommended || topAction.description,
                                    evidenceSummary: `Calculated from uploaded dataset: ${supplier.riskScore}/100 risk.`
                                  });
                                }
                              }}
                              className="btn btn-subtle btn-sm"
                              title="Stage in Decision Center"
                            >
                              <PlusCircle size={13} style={{ color: 'var(--teal-primary)' }} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {sortedSuppliers.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No suppliers match current filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Supplier Analysis Detail Modal */}
      {inspectingSupplier && (
        <SupplierAnalysisReportModal
          supplier={inspectingSupplier}
          onClose={() => setInspectingSupplier(null)}
          onQueueDecision={onQueueDecision}
          onNavigateDecisions={() => onNavigateTab && onNavigateTab('decisions')}
        />
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="modal-backdrop" onClick={() => setShowResetConfirm(false)} style={{ zIndex: 1300 }}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '440px', padding: '24px', backgroundColor: 'var(--bg-card)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <AlertTriangle size={22} style={{ color: '#ef4444' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Reset Uploaded Dataset?
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 20px 0', lineHeight: 1.4 }}>
              This will remove all uploaded vendor records and calculated risk scores from local storage. The demonstration dataset will become active. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowResetConfirm(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (onClearUploadedDataset) onClearUploadedDataset();
                  setAnalyzedSuppliers([]);
                  setRawRows([]);
                  setUploadedFileMeta(null);
                  setActiveStep('upload');
                  setShowResetConfirm(false);
                }} 
                className="btn btn-danger"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
