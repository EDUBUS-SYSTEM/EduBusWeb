import * as XLSX from "xlsx";

const createWorkbook = (data: Record<string, unknown>[], sheetName: string) => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);

  const columnWidths = [
    { wch: 25 }, 
    { wch: 15 }, 
    { wch: 15 }, 
    { wch: 15 }, 
    { wch: 20 }, 
    { wch: 20 }, 
    { wch: 30 }, 
  ];
  worksheet["!cols"] = columnWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  return new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};

const generateDriverTemplate = () =>
  createWorkbook(
    [
      {
        Email: "driver1@example.com",
        "First Name": "Tran Van",
        "Last Name": "A",
        "Phone Number": "0900000000",
        "Gender (1=Male, 2=Female, 3=Other)": 1,
        "Date of Birth (YYYY-MM-DD)": "1990-05-20",
        Address: "Ho Chi Minh City, Viet Nam",
      },
      {
        Email: "driver2@example.com",
        "First Name": "Nguyen Thi",
        "Last Name": "B",
        "Phone Number": "0911111111",
        "Gender (1=Male, 2=Female, 3=Other)": 2,
        "Date of Birth (YYYY-MM-DD)": "1992-10-10",
        Address: "Ha Noi, Viet Nam",
      },
    ],
    "Drivers Template"
  );

export const generateParentTemplate = () =>
  createWorkbook(
    [
      {
        Email: "parent1@example.com",
        "First Name": "John",
        "Last Name": "Doe",
        "Phone Number": "0901234567",
        "Gender (1=Male, 2=Female, 3=Other)": 1,
        "Date of Birth (YYYY-MM-DD)": "1980-01-01",
        Address: "New York, USA",
      },
      {
        Email: "parent2@example.com",
        "First Name": "Jane",
        "Last Name": "Smith",
        "Phone Number": "0987654321",
        "Gender (1=Male, 2=Female, 3=Other)": 2,
        "Date of Birth (YYYY-MM-DD)": "1985-05-15",
        Address: "Los Angeles, USA",
      },
    ],
    "Parents Template"
  );

const generateSupervisorTemplate = () =>
  createWorkbook(
    [
      {
        Email: "supervisor1@example.com",
        "First Name": "Nguyen Thi",
        "Last Name": "Alice",
        "Phone Number": "0912345678",
        "Gender (1=Male, 2=Female, 3=Other)": 2,
        "Date of Birth (YYYY-MM-DD)": "1980-01-01",
        Address: "Ho Chi Minh City, Viet Nam",
      },
      {
        Email: "supervisor2@example.com",
        "First Name": "Tran Van",
        "Last Name": "Bob",
        "Phone Number": "0933221100",
        "Gender (1=Male, 2=Female, 3=Other)": 1,
        "Date of Birth (YYYY-MM-DD)": "1985-05-15",
        Address: "Ha Noi, Viet Nam",
      },
    ],
    "Supervisors Template"
  );

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const downloadDriverTemplate = () => {
  const blob = generateDriverTemplate();
  downloadBlob(blob, "drivers_template.xlsx");
};

export const downloadParentTemplate = () => {
  const blob = generateParentTemplate();
  downloadBlob(blob, "parents_template.xlsx");
};

export const downloadSupervisorTemplate = () => {
  const blob = generateSupervisorTemplate();
  downloadBlob(blob, "supervisors_template.xlsx");
};
