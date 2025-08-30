import { useState } from 'react';
import { importParentsFromExcel } from '@/services/api/parents';
import { ImportParentsResponse } from '@/services/api/parents';
import { downloadParentTemplate } from '@/utils/excelTemplate';

export const useParentImport = () => {
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportParentsResponse | null>(null);

  const handleUploadFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setImportLoading(true);
    try {
      const result = await importParentsFromExcel(files[0]);
      setImportResult(result);
    } catch (error) {
      console.error('Error importing parents:', error);
      // You might want to show an error message here
    } finally {
      setImportLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      downloadParentTemplate();
    } catch (error) {
      console.error('Error downloading template:', error);
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
    clearImportResult,
  };
};
