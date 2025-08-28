import { apiClient } from "@/lib/api";

export const downloadTemplate = async (templateType: string) => {
  const response = await apiClient.get(`/file/template/${templateType}`, {
    responseType: "blob",
  });

  const blob = response.data as Blob;
  const url = window.URL.createObjectURL(blob);

  // Try to extract filename from Content-Disposition
  const disposition = response.headers["content-disposition"] as
    | string
    | undefined;
  let fileName = `${templateType}_template.xlsx`;
  if (disposition) {
    const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(
      disposition
    );
    const rawName = decodeURIComponent(match?.[1] || match?.[2] || "");
    if (rawName) fileName = rawName;
  }

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
