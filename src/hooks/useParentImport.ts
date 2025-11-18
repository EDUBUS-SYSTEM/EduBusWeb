import { useState } from "react";
import {
  importParentsFromExcel,
  ImportParentsResponse,
  exportParentsToExcel,
} from "@/services/api/parents";
import { downloadParentTemplate } from "@/utils/excelTemplate";

export const useParentImport = () => {
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] =
    useState<ImportParentsResponse | null>(null);

  const handleUploadFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setImportLoading(true);
    try {
      const result = await importParentsFromExcel(files[0]);
      setImportResult(result);
    } catch (error) {
      console.error("Error importing parents:", error);
      // You might want to show an error message here
    } finally {
      setImportLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      downloadParentTemplate();
    } catch (error) {
      console.error("Error downloading template:", error);
    }
  };

  const handleExportParents = async () => {
    try {
      const blob = await exportParentsToExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const today = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `parents_${today}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting parents:", error);
    }
  };

  const clearImportResult = () => {
    setImportResult(null);
  };

  return {
    importLoading,
    importResult,
    handleUploadFiles,
    handleDownloadTemplate,
    handleExportParents,
    clearImportResult,
  };
};
