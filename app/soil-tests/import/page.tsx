'use client';

import React, { useState } from 'react';
import { SoilImportService } from '@/lib/services/soilImportService';
import { SoilValidationService, RawSoilDataRow, RowValidationResult } from '@/lib/services/soilValidationService';

const SAMPLE_CSV = `sample_code,report_number,laboratory,collection_date,grid_code,depth_cm,ph,ec,organic_carbon,nitrogen,phosphorus,potassium
SMP-G041-02,SR-2026-00450,National Ag Labs,2026-09-01,G041,15,6.4,1.1,0.82,185,42,210
SMP-G042-02,SR-2026-00450,National Ag Labs,2026-09-01,G042,15,6.5,1.2,0.85,190,44,215
SMP-G047-02,SR-2026-00450,National Ag Labs,2026-09-01,G047,15,6.4,1.2,0.85,195,75,220
SMP-G048-02,SR-2026-00450,National Ag Labs,2026-09-01,G048,15,6.8,2.1,1.10,210,32,195`;

export default function SoilTestImportPage() {
  const [csvContent, setCsvContent] = useState<string>(SAMPLE_CSV);
  const [parsedRows, setParsedRows] = useState<RawSoilDataRow[]>([]);
  const [validationResults, setValidationResults] = useState<RowValidationResult[]>([]);
  const [previewActive, setPreviewActive] = useState<boolean>(false);
  const [importing, setImporting] = useState<boolean>(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const handlePreview = () => {
    try {
      const { rows } = SoilImportService.parseCsv(csvContent);
      setParsedRows(rows);
      const validation = SoilValidationService.validateBatch(rows);
      setValidationResults(validation.results);
      setPreviewActive(true);
      setImportSuccess(null);
    } catch (err: any) {
      alert(`CSV Parsing Error: ${err.message}`);
    }
  };

  const handleDownloadTemplate = () => {
    const template = SoilImportService.generateCsvTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'soiliq_soil_test_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirmImport = async () => {
    setImporting(true);
    // Simulates API commit call
    setTimeout(() => {
      setImporting(false);
      setImportSuccess(`Successfully committed ${validationResults.filter(r => r.isValid).length} soil test samples and updated active field baselines!`);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Data Ingestion & Extraction
            </span>
            <h1 className="text-2xl font-black text-white mt-1">Import Laboratory Soil Test Data</h1>
            <p className="text-xs text-slate-400 mt-1">
              Upload or paste certified laboratory CSV data. Columns are auto-mapped via canonical aliases.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs text-slate-200 border border-slate-700 font-semibold flex items-center gap-1.5"
            >
              <span>📄</span>
              <span>Download CSV Template</span>
            </button>
            <a
              href="/soil-tests"
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs text-slate-200 border border-slate-700"
            >
              &larr; Soil Dashboard
            </a>
          </div>
        </div>

        {/* Input Area */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white uppercase tracking-wider">
              Paste CSV Data (or drop file)
            </label>
            <span className="text-[11px] text-slate-400">Comma-separated format with header</span>
          </div>

          <textarea
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            rows={7}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 font-mono text-xs text-emerald-300 focus:border-emerald-500 focus:outline-none"
            placeholder="sample_code,report_number,collection_date,grid_code,ph,ec,organic_carbon,nitrogen,phosphorus,potassium..."
          />

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setCsvContent(SAMPLE_CSV)}
              className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 border border-slate-700"
            >
              Load Sample Data
            </button>
            <button
              onClick={handlePreview}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2 text-xs font-bold text-slate-950 shadow"
            >
              Validate & Preview Data &rarr;
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {importSuccess && (
          <div className="rounded-xl border border-emerald-700 bg-emerald-950/60 p-4 text-xs text-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">✓</span>
              <span>{importSuccess}</span>
            </div>
            <a
              href="/soil-tests"
              className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-slate-950"
            >
              Return to Dashboard
            </a>
          </div>
        )}

        {/* Preview & Validation Table */}
        {previewActive && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden space-y-4 p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white">Import Validation Preview</h2>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>Total Rows: <strong className="text-white">{validationResults.length}</strong></span>
                  <span>Valid: <strong className="text-emerald-400">{validationResults.filter(r => r.isValid).length}</strong></span>
                  <span>Warnings: <strong className="text-amber-400">{validationResults.filter(r => r.hasWarnings).length}</strong></span>
                  <span>Errors: <strong className="text-rose-400">{validationResults.filter(r => !r.isValid).length}</strong></span>
                </div>
              </div>

              <button
                onClick={handleConfirmImport}
                disabled={importing || validationResults.filter(r => r.isValid).length === 0}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-5 py-2 text-xs font-bold text-slate-950 shadow"
              >
                {importing ? 'Importing...' : 'Confirm & Commit Import'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Sample Code</th>
                    <th className="p-3">Grid</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">pH</th>
                    <th className="p-3">EC</th>
                    <th className="p-3">N (kg/ha)</th>
                    <th className="p-3">P (ppm)</th>
                    <th className="p-3">K (ppm)</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {validationResults.map((r, idx) => {
                    const row = parsedRows[idx];
                    return (
                      <tr key={idx} className="hover:bg-slate-850/40">
                        <td className="p-3 font-bold text-white">{row?.sampleCode || 'Row ' + (idx + 1)}</td>
                        <td className="p-3 text-emerald-400">{row?.gridCode || 'Field-Level'}</td>
                        <td className="p-3 text-slate-400">{row?.collectionDate}</td>
                        <td className="p-3 text-slate-300">{row?.pH}</td>
                        <td className="p-3 text-slate-300">{row?.ec}</td>
                        <td className="p-3 text-slate-200">{row?.nitrogen}</td>
                        <td className="p-3 text-emerald-300 font-bold">{row?.phosphorus}</td>
                        <td className="p-3 text-slate-200">{row?.potassium}</td>
                        <td className="p-3">
                          <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            r.status === 'VALID'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                              : r.status === 'WARNING'
                              ? 'bg-amber-950 text-amber-300 border border-amber-700'
                              : 'bg-rose-950 text-rose-300 border border-rose-700'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
