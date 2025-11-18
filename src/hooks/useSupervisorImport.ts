import { useState, useCallback } from "react";
import { isAxiosError } from "axios";
import {
  importSupervisorsFromExcel,
  ImportSupervisorsResponse,
  exportSupervisorsToExcel,
} from "@/services/api/supervisors";
import { downloadSupervisorTemplate } from "@/utils/excelTemplate";

export const useSupervisorImport = () => {
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] =
    useState<ImportSupervisorsResponse | null>(null);

  const clearImportResult = useCallback(() => setImportResult(null), []);

  const handleUploadFiles = useCallback(async (files: File[]) => {
    if (!files || !Array.isArray(files) || files.length === 0) return;
    const file = files[0];

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      alert("Please select an .xlsx file for supervisor import");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setImportLoading(true);
    setImportResult(null);
    try {
      const result = await importSupervisorsFromExcel(file);
      setImportResult(result);

      const successCount = result?.successUsers?.length || 0;
      const failedCount = result?.failedUsers?.length || 0;
      const totalProcessed = result?.totalProcessed || 0;

      if (totalProcessed === 0) {
        alert("⚠️ No data was processed. Please check your Excel file format.");
      } else if (successCount > 0 && failedCount === 0) {
        alert(`✅ Import successful! ${successCount} supervisors created.`);
      } else if (successCount > 0 && failedCount > 0) {
        alert(
          `⚠️ Partial success: ${successCount} created, ${failedCount} failed.`
        );
      } else if (successCount === 0 && failedCount > 0) {
        alert(`❌ Import failed: ${failedCount} errors occurred.`);
      } else {
        alert("⚠️ Import completed but no results to show.");
      }
    } catch (err: unknown) {
      console.error("Supervisor import error:", err);
      let errorMessage = "Import failed";
      if (isAxiosError(err)) {
        const data = err.response?.data as { message?: string } | undefined;
        errorMessage = data?.message || err.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      alert(`❌ Import failed: ${errorMessage}`);
    } finally {
      setImportLoading(false);
    }
  }, []);

  const handleDownloadTemplate = useCallback(async () => {
    try {
      downloadSupervisorTemplate();
    } catch (e: unknown) {
      console.error("Supervisor template download error:", e);
      let message: unknown = "Failed to download template";
      if (isAxiosError(e)) {
        message = e.response?.data ?? e.message ?? message;
      } else if (e instanceof Error) {
        message = e.message;
      }
      alert(typeof message === "string" ? message : JSON.stringify(message));
    }
  }, []);

  const handleExportSupervisors = useCallback(async () => {
    try {
      const blob = await exportSupervisorsToExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const today = new Date().toISOString().slice(0, 10);
      a.download = `supervisors_${today}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: unknown) {
      console.error("Supervisor export error:", e);
      let message: unknown = "Failed to export supervisors";
      if (isAxiosError(e)) {
        message = e.response?.data ?? e.message ?? message;
      } else if (e instanceof Error) {
        message = e.message;
      }
      alert(typeof message === "string" ? message : JSON.stringify(message));
    }
  }, []);

  return {
    importLoading,
    importResult,
    handleUploadFiles,
    handleDownloadTemplate,
    handleExportSupervisors,
    clearImportResult,
  };
};


