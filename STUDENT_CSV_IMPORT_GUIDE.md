# Student CSV Import & Export Guide

## Overview
The student bulk import feature allows universities to upload multiple students at once via a CSV file. The system will automatically generate enrollment numbers and passwords for each student, and return a CSV file with all credentials.

## CSV File Format

### Required Columns
Your CSV file must contain the following columns:
- **name** - Student's full name
- **department** - Department/Faculty name
- **year** - Academic year (1st, 2nd, 3rd, 4th, etc.)

### CSV Template Example
```csv
name,department,year
John Doe,Computer Science,1st
Jane Smith,Mechanical Engineering,2nd
Bob Johnson,Electrical Engineering,3rd
Alice Williams,Civil Engineering,2nd
```

## How to Use

### Step 1: Prepare Your CSV File
Create a CSV file with student information. You can download the template from the Students page in the university dashboard.

### Step 2: Upload CSV
1. Go to **University Dashboard → Students**
2. Click **Bulk Upload** button
3. Click the file area to select your CSV file or drag and drop
4. Click **Upload & Import**

### Step 3: Download Credentials
After successful upload, the system will automatically:
- Create all students in the database
- Generate unique enrollment numbers (format: `UNI-YYYY-XXXX-XXXX`)
- Generate random passwords (8-character hex strings)
- **Download a CSV file** with all credentials

### CSV Output Format
The downloaded credentials CSV will contain:
```csv
enrollmentNo,name,department,year,password
UNI-2026-1234-5678,John Doe,Computer Science,1st,a1b2c3d4
UNI-2026-1234-5679,Jane Smith,Mechanical Engineering,2nd,e5f6g7h8
```

## Export All Credentials

You can export credentials for all existing students:
1. Go to **University Dashboard → Students**
2. Click **Export Credentials** button
3. A CSV file with all student credentials will be downloaded

### Export Format
```csv
enrollmentNo,name,department,year,loginId,isActive
UNI-2026-1234-5678,John Doe,Computer Science,1st,UNI-2026-1234-5678,true
```

## Features

✅ **Bulk Import** - Upload multiple students at once
✅ **Auto-Generated Credentials** - Enrollment numbers and passwords created automatically
✅ **CSV Download** - Credentials CSV automatically downloads after import
✅ **Validation** - Invalid rows are reported without stopping the process
✅ **Export Option** - Export all student credentials on demand

## Error Handling

If there are errors in your CSV:
- Valid rows will be processed normally
- Invalid rows will be listed with error messages
- You can correct and re-upload the file

Example error messages:
- `Row 5: Missing required fields (name, department, year)`
- `Row 7: Database error - Duplicate enrollment number`

## Best Practices

1. **Keep it clean** - Remove any extra spaces or blank rows
2. **Use correct departments** - Ensure department names match your university's structure
3. **Valid year formats** - Use "1st", "2nd", "3rd", "4th", etc.
4. **Save credentials** - Keep the downloaded CSV safe as it contains passwords
5. **Communicate to students** - Share enrollment number and password (one-time setup only)

## Troubleshooting

**Q: CSV not accepted**
- A: Check that columns are named exactly: `name`, `department`, `year` (case-insensitive)

**Q: Some students created, some failed**
- A: Check error messages for specific rows, fix them, and upload again

**Q: Can't find exported CSV**
- A: Check your Downloads folder. File name format: `student-credentials-TIMESTAMP.csv`

**Q: Need to re-export passwords**
- A: Use the "Export Credentials" button to download credentials for all students

## Technical Details

- Maximum CSV file size: **5MB**
- Supported format: **CSV (Comma-Separated Values)**
- Enrollment number format: `UNI-YYYY-XXXX-XXXX` (25+ characters)
- Password format: 8-character hexadecimal random string
- All passwords are securely hashed in the database
