import * as XLSX from 'xlsx';

export const generateParentTemplate = () => {
  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  
  // Sample data for template
  const templateData = [
    {
      Email: 'parent1@example.com',
      'First Name': 'John',
      'Last Name': 'Doe',
      'Phone Number': '0901234567',
      'Gender (1=Male, 2=Female, 3=Other)': 1,
      'Date of Birth (YYYY-MM-DD)': '1980-01-01',
      'Address': 'New York, USA'
    },
    {
      Email: 'parent2@example.com',
      'First Name': 'Jane',
      'Last Name': 'Smith',
      'Phone Number': '0987654321',
      'Gender (1=Male, 2=Female, 3=Other)': 2,
      'Date of Birth (YYYY-MM-DD)': '1985-05-15',
      'Address': 'Los Angeles, USA'
    }
  ];

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(templateData);

  // Set column widths
  const columnWidths = [
    { wch: 25 }, // Email
    { wch: 15 }, // First Name
    { wch: 15 }, // Last Name
    { wch: 15 }, // Phone Number
    { wch: 25 }, // Gender
    { wch: 25 }, // Date of Birth
    { wch: 30 }  // Address
  ];
  worksheet['!cols'] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Parents Template');

  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  return blob;
};

export const downloadParentTemplate = () => {
  const blob = generateParentTemplate();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'parents_template.xlsx';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
