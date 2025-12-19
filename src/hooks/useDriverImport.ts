import { useState, useCallback } from "react";
import { isAxiosError } from "axios";
import {
  importDriversFromExcel,
  ImportDriversResponse,
  exportDriversToExcel,
} from "@/services/api/drivers";
import { downloadTemplate } from "@/services/api/file";
import { downloadDriverTemplate } from "@/utils/excelTemplate";

export const useDriverImport = () => {
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] =
    useState<ImportDriversResponse | null>(null);

  const clearImportResult = useCallback(() => setImportResult(null), []);

  const testImportResultLogic = useCallback(
    (testResult: ImportDriversResponse) => {
      const successCount = testResult?.successUsers?.length || 0;
      const failedCount = testResult?.failedUsers?.length || 0;
      const totalProcessed = testResult?.totalProcessed || 0;

      if (totalProcessed === 0) {
        return "⚠️ No data was processed. Please check your Excel file format.";
      } else if (successCount > 0 && failedCount === 0) {
        return `✅ Import successful! ${successCount} drivers created.`;
      } else if (successCount > 0 && failedCount > 0) {
        return `⚠️ Partial success: ${successCount} created, ${failedCount} failed.`;
      } else if (successCount === 0 && failedCount > 0) {
        return `❌ Import failed: ${failedCount} errors occurred.`;
      } else {
        return "⚠️ Import completed but no results to show.";
      }
    },
    []
  );

  const handleUploadFiles = useCallback(async (files: File[]) => {
    if (!files || !Array.isArray(files) || files.length === 0) return;
    const file = files[0];

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      alert("Please select an .xlsx file for driver import");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setImportLoading(true);
    setImportResult(null);
    try {
      const result = await importDriversFromExcel(file);
      setImportResult(result);

      const successCount = result?.successUsers?.length || 0;
      const failedCount = result?.failedUsers?.length || 0;
      const totalProcessed = result?.totalProcessed || 0;

      if (totalProcessed === 0) {
        alert("⚠️ No data was processed. Please check your Excel file format.");
      } else if (successCount > 0 && failedCount === 0) {
        alert(`✅ Import successful! ${successCount} drivers created.`);
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
      console.error("Import error:", err);
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
      await downloadTemplate("driver");
    } catch (e: unknown) {
      if (isAxiosError(e) && e.response?.status === 404) {
        console.warn("Server template not found (404). Generating local template.");
      } else {
        console.error("Template download error:", e);
        console.warn("Falling back to local template due to error.");
      }
      downloadDriverTemplate();
    }
  }, []);

  const handleExportDrivers = useCallback(async () => {
    try {
      const blob = await exportDriversToExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const today = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `drivers_${today}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: unknown) {
      console.error("Driver export error:", e);
      let message: unknown = "Failed to export drivers";
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
    handleExportDrivers,
    clearImportResult,
    testImportResultLogic, 
  };
};
