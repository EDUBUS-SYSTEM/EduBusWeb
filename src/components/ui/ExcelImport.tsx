"use client";

import React, { useState } from "react";
import {
  ImportDriversResponse,
  ImportUserSuccess,
  ImportUserError,
} from "@/services/api/drivers";

interface ExcelImportProps {
  onImport: (file: File) => Promise<ImportDriversResponse>;
  onExport?: () => Promise<Blob>;
  title: string;
  acceptFileType?: string;
  templateDownloadUrl?: string;
}

const ExcelImport: React.FC<ExcelImportProps> = ({
  onImport,
  onExport,
  title,
  acceptFileType = ".xlsx",
  templateDownloadUrl,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] =
    useState<ImportDriversResponse | null>(null);
  const [error, setError] = useState<string>("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".xlsx")) {
        setError("Please select an .xlsx file");
        return;
      }
      setSelectedFile(file);
      setError("");
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await onImport(selectedFile);
      setImportResult(result);
    } catch (err: unknown) {
      console.error("Import error:", err);
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(
        error?.response?.data?.message || error?.message || "Import failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!onExport) return;

    setLoading(true);
    try {
      const blob = await onExport();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "drivers.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: unknown) {
      console.error("Export error:", err);
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(
        error?.response?.data?.message || error?.message || "Export failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    if (templateDownloadUrl) {
      const a = document.createElement("a");
      a.href = templateDownloadUrl;
      a.download = "driver_import_template.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>

      {/* File Selection */}
      <div className="mb-4">
        <input
          type="file"
          accept={acceptFileType}
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleImport}
          disabled={!selectedFile || loading}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Importing..." : "Import Excel"}
        </button>

        {onExport && (
          <button
            onClick={handleExport}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Exporting..." : "Export to Excel"}
          </button>
        )}

        {templateDownloadUrl && (
          <button
            onClick={downloadTemplate}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Download Template
          </button>
        )}
      </div>

      {/* Import Results */}
      {importResult && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Import Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Processed:</span>
                <span className="ml-2 text-blue-600">
                  {importResult.totalProcessed}
                </span>
              </div>
              <div>
                <span className="font-medium">Successful:</span>
                <span className="ml-2 text-green-600">
                  {importResult.successUsers.length}
                </span>
              </div>
              <div>
                <span className="font-medium">Failed:</span>
                <span className="ml-2 text-red-600">
                  {importResult.failedUsers.length}
                </span>
              </div>
            </div>
          </div>

          {/* Successful Imports */}
          {importResult.successUsers.length > 0 && (
            <div>
              <h4 className="font-semibold text-green-700 mb-2">
                Successfully Imported ({importResult.successUsers.length})
              </h4>
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-green-50">
                    <tr>
                      <th className="text-left p-2">Row</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Phone</th>
                      <th className="text-left p-2">Password</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importResult.successUsers.map((user, index) => (
                      <tr key={index} className="border-b border-green-100">
                        <td className="p-2">{user.rowNumber}</td>
                        <td className="p-2">{user.email}</td>
                        <td className="p-2">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="p-2">{user.phoneNumber}</td>
                        <td className="p-2 font-mono text-xs bg-green-50 px-2 py-1 rounded">
                          {user.password}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Failed Imports */}
          {importResult.failedUsers.length > 0 && (
            <div>
              <h4 className="font-semibold text-red-700 mb-2">
                Failed Imports ({importResult.failedUsers.length})
              </h4>
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-red-50">
                    <tr>
                      <th className="text-left p-2">Row</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Phone</th>
                      <th className="text-left p-2">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importResult.failedUsers.map((error, index) => (
                      <tr key={index} className="border-b border-red-100">
                        <td className="p-2">{error.rowNumber}</td>
                        <td className="p-2">{error.email}</td>
                        <td className="p-2">
                          {error.firstName} {error.lastName}
                        </td>
                        <td className="p-2">{error.phoneNumber}</td>
                        <td className="p-2 text-red-600 text-xs">
                          {error.errorMessage}
                        </td>
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
  );
};

export default ExcelImport;
