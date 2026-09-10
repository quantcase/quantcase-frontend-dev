"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Upload, AlertTriangle, CheckCircle, X, FileText, Loader2 } from "lucide-react";
import { authFetch, authHeaders } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PreviewResult {
  total_rows: number;
  valid_rows: number;
  error_rows: number;
  errors: Array<{ row: number; errors: string[]; data: Record<string, any> }>;
  sample_valid: Array<Record<string, any>>;
}

export function ClientImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setError(null);
    setPreview(null);
    setSuccessMessage(null);

    // Automatically trigger preview
    await uploadAndPreview(selected);
  };

  const uploadAndPreview = async (targetFile: File) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", targetFile);
      formData.append("entity_type", "clients");

      const res = await authFetch(`${BACKEND_URL}/api/wealthos/import/preview`, {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to preview import file");
      }

      setPreview(data.data);
    } catch (err: any) {
      setError(err.message || "Failed to analyze file");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!file) return;

    try {
      setExecuting(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      const res = await authFetch(`${BACKEND_URL}/api/wealthos/import/execute`, {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to execute import");
      }

      setSuccessMessage(`Successfully imported ${data.data.success_rows} client(s)!`);
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to import clients");
    } finally {
      setExecuting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setSuccessMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-xl border border-hair bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-hair">
          <div>
            <h2 className="font-serif text-xl text-ink">Import Clients</h2>
            <p className="text-xs text-ink-2 mt-0.5">Upload a CSV or Excel spreadsheet containing your client roster.</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-ink-2 hover:text-ink hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4">
          {/* Upload Area */}
          {!preview && !loading && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-hair hover:border-primary/50 rounded-xl p-8 text-center cursor-pointer transition-colors bg-secondary/30"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-ink">Click or drag & drop file to upload</p>
              <p className="text-xs text-ink-2 mt-1">Supports CSV or Excel (.xlsx) up to 10MB</p>
              <div className="mt-4 inline-flex items-center gap-2 text-xs text-ink-3 bg-card px-3 py-1.5 rounded-md border border-hair">
                <FileText className="w-3.5 h-3.5" />
                Required headers: <span className="font-mono text-ink">name, segment, risk_profile</span>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
              <p className="text-sm text-ink-2">Analyzing spreadsheet format & validating rows...</p>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-lg bg-down-soft border border-down/20 text-down flex items-start gap-2.5 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3.5 rounded-lg bg-up-soft border border-up/20 text-up flex items-center gap-2.5 text-xs font-medium">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <p>{successMessage}</p>
            </div>
          )}

          {/* Preview State */}
          {preview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-hair text-xs">
                <span className="font-medium text-ink truncate max-w-xs">{file?.name}</span>
                <button
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="text-xs text-primary hover:underline ml-2"
                >
                  Change file
                </button>
              </div>

              {/* Stat Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border border-hair bg-card text-center">
                  <span className="text-xs text-ink-2">Total Rows</span>
                  <p className="text-lg font-mono font-bold text-ink mt-0.5">{preview.total_rows}</p>
                </div>
                <div className="p-3 rounded-lg border border-hair bg-card text-center">
                  <span className="text-xs text-ink-2">Valid to Import</span>
                  <p className="text-lg font-mono font-bold text-up mt-0.5">{preview.valid_rows}</p>
                </div>
                <div className="p-3 rounded-lg border border-hair bg-card text-center">
                  <span className="text-xs text-ink-2">Invalid Rows</span>
                  <p className={`text-lg font-mono font-bold mt-0.5 ${preview.error_rows > 0 ? "text-down" : "text-ink-3"}`}>
                    {preview.error_rows}
                  </p>
                </div>
              </div>

              {/* Errors List */}
              {preview.errors.length > 0 && (
                <div className="border border-hair rounded-lg p-3 max-h-36 overflow-y-auto bg-down-soft/30 space-y-1.5 text-xs">
                  <p className="font-semibold text-down mb-1">Errors detected (these rows will be skipped):</p>
                  {preview.errors.map((err, i) => (
                    <div key={i} className="text-ink-2 flex gap-2">
                      <span className="font-mono text-down font-medium">Row {err.row}:</span>
                      <span>{err.errors.join(", ")}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Sample Valid Rows */}
              {preview.sample_valid.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-ink mb-1.5">Preview of valid records:</p>
                  <div className="border border-hair rounded-lg overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-secondary text-ink-2 border-b border-hair">
                        <tr>
                          <th className="p-2 font-medium">Name</th>
                          <th className="p-2 font-medium">Segment</th>
                          <th className="p-2 font-medium">Risk</th>
                          <th className="p-2 font-medium text-right">AUM (₹Cr)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-hair text-ink">
                        {preview.sample_valid.map((c, i) => (
                          <tr key={i} className="hover:bg-secondary/20">
                            <td className="p-2 font-medium">{c.name}</td>
                            <td className="p-2">{c.segment}</td>
                            <td className="p-2 capitalize">{c.risk_profile}</td>
                            <td className="p-2 text-right font-mono">{c.aum_cr || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-hair flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={executing}>
            Cancel
          </Button>
          {preview && preview.valid_rows > 0 && (
            <Button
              size="sm"
              onClick={handleConfirmImport}
              disabled={executing}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {executing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                `Confirm Import (${preview.valid_rows} clients)`
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
