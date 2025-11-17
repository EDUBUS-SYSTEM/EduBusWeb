import React from "react";
import { ImportDriversResponse } from "@/services/api/drivers";
import { ImportParentsResponse } from "@/services/api/parents";
import { ImportSupervisorsResponse } from "@/services/api/supervisors";

type ImportResult =
  | ImportDriversResponse
  | ImportParentsResponse
  | ImportSupervisorsResponse;

type ImportResultType = "driver" | "parent" | "supervisor";

interface ImportResultsProps {
  result: ImportResult;
  type: ImportResultType;
  onExport?: () => void;
  onClose: () => void;
}

const ImportResults: React.FC<ImportResultsProps> = ({
  result,
  type,
  onExport,
  onClose,
}) => {
  return (
    <div className="mb-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Import Results</h3>
        <div className="flex items-center gap-3">
          {result?.successUsers &&
            result.successUsers.length > 0 &&
            onExport && (
              <button
                onClick={onExport}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export {type === "driver" ? "Drivers" : type === "parent" ? "Parents" : "Supervisors"}
              </button>
            )}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ✕ Close
          </button>
        </div>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
        <h4 className="font-semibold text-blue-800 mb-2">Summary</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">Total Processed:</span>
            <span className="ml-2 text-blue-600">
              {result?.totalProcessed || 0}
            </span>
          </div>
          <div>
            <span className="font-medium">Successful:</span>
            <span className="ml-2 text-green-600">
              {result?.successUsers?.length || 0}
            </span>
          </div>
          <div>
            <span className="font-medium">Failed:</span>
            <span className="ml-2 text-red-600">
              {result?.failedUsers?.length || 0}
            </span>
          </div>
        </div>
      </div>

      {result?.successUsers && result.successUsers.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-green-700 mb-2">
            Successfully Imported ({result?.successUsers?.length || 0})
          </h4>
          <div className="max-h-40 overflow-y-auto">
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
                {result.successUsers.map((user, index) => (
                  <tr key={index} className="border-b border-green-100">
                    <td className="p-2">{user.rowNumber}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="p-2">{user.phoneNumber}</td>
                    <td className="p-2">
                      <div className="font-mono text-xs bg-green-50 px-2 py-1 rounded border">
                        {user.password || "No password"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result?.failedUsers && result.failedUsers.length > 0 && (
        <div>
          <h4 className="font-semibold text-red-700 mb-2">
            Failed Imports ({result?.failedUsers?.length || 0})
          </h4>
          <div className="max-h-40 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-red-50">
                <tr>
                  <th className="text-left p-2">Row</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Error</th>
                </tr>
              </thead>
              <tbody>
                {result.failedUsers.map((error, index) => (
                  <tr key={index} className="border-b border-red-100">
                    <td className="p-2">{error.rowNumber}</td>
                    <td className="p-2">{error.email}</td>
                    <td className="p-2">
                      {error.firstName} {error.lastName}
                    </td>
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
  );
};

export default ImportResults;
