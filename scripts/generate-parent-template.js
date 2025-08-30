const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Create workbook and worksheet
const workbook = XLSX.utils.book_new();

// Sample data for template
const templateData = [
  {
    Email: 'parent1@example.com',
    'First Name': 'Nguyễn Văn',
    'Last Name': 'An',
    'Phone Number': '0901234567',
    'Gender (1=Male, 2=Female, 3=Other)': 1,
    'Date of Birth (YYYY-MM-DD)': '1980-01-01',
    'Address': 'Hà Nội, Việt Nam'
  },
  {
    Email: 'parent2@example.com',
    'First Name': 'Trần Thị',
    'Last Name': 'Bình',
    'Phone Number': '0987654321',
    'Gender (1=Male, 2=Female, 3=Other)': 2,
    'Date of Birth (YYYY-MM-DD)': '1985-05-15',
    'Address': 'TP.HCM, Việt Nam'
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

// Write to file
const outputPath = path.join(__dirname, '../public/parents_template.xlsx');
XLSX.writeFile(workbook, outputPath);

console.log('Parent template generated successfully at:', outputPath);
