# CSV Bulk Import Guide - Students

## Overview
Universities can now upload CSV files to quickly import multiple students with auto-generated credentials.

---

## CSV File Format

### Required Columns
Your CSV must have exactly these columns (header row is required):
```
name,department,year
```

### Column Details
- **name**: Student's full name (required, string)
- **department**: Department name (required, string)
- **year**: Academic year (required, string)

### Supported Departments
- Computer Science
- Mechanical
- Electrical
- Civil
- Electronics

### Supported Years
- 1st
- 2nd
- 3rd
- 4th

---

## Example CSV Content

```csv
name,department,year
John Doe,Computer Science,1st
Jane Smith,Mechanical,2nd
Bob Johnson,Electrical,3rd
Alice Brown,Civil,4th
Charlie Davis,Electronics,1st
Diana Wilson,Computer Science,2nd
```

---

## How to Use

### Step 1: Prepare Your CSV File
1. Open Excel, Google Sheets, or any text editor
2. Create columns: name, department, year
3. Add your student data (one student per row)
4. Save as CSV format (.csv file)

**Example file: `students.csv`**
```
name,department,year
Rahul Kumar,Computer Science,1st
Priya Singh,Mechanical,2nd
```

### Step 2: Upload in Portal
1. Login as University admin
2. Go to **Students** → **Bulk Upload** button
3. Click **"Download CSV Template"** to see the format (optional)
4. Click the upload area and select your CSV file
5. Review the file size (max 5MB)
6. Click **"Upload & Import"**

### Step 3: View Results
- ✅ Success: See list of created students with their IDs and auto-generated passwords
- ⚠️ Partial: Some rows failed - see error messages for which rows had issues
- ❌ Error: Check file format and try again

### Step 4: Share Credentials
The system generates:
- **Enrollment Number**: `UNI-2026-{uniId}-{random}`
- **Password**: `{8 random hex characters}`

Download/copy the credentials and share with students.

---

## What Gets Generated

For each student imported:

| Field | Auto-Generated | Example |
|---|---|---|
| Enrollment No | ✅ Yes | `UNI-2026-1234-5678` |
| Password | ✅ Yes | `a1b2c3d4` |
| Login ID | Uses Enrollment No | `UNI-2026-1234-5678` |

---

## Error Handling

### Common Errors

**Error: CSV must have columns: name, department, year**
- ❌ Missing one or more required columns
- ✅ Fix: Add all three columns to your CSV

**Error: Row X: Missing required fields**
- ❌ One of the fields is empty
- ✅ Fix: Fill in all required fields for that row

**Error: File is too large**
- ❌ CSV file exceeds 5MB
- ✅ Fix: Reduce number of rows or file size

**Error: Only CSV files are allowed**
- ❌ File is not in CSV format
- ✅ Fix: Export as CSV (not Excel .xlsx)

---

## Tips & Best Practices

✅ **DO**
- Export from Excel as CSV format
- Use simple text for names (avoid special characters initially)
- Keep file size under 5MB
- Test with 2-3 students first
- Save credentials/passwords immediately after upload

❌ **DON'T**
- Include header descriptions or comments in CSV
- Use special characters (€, ©, etc.) in names
- Upload the same file twice


---

## Sample CSV Templates

### Template 1: Basic
```csv
name,department,year
Student1,Computer Science,1st
Student2,Mechanical,2nd
```

### Template 2: Real Example
```csv
name,department,year
Rajesh Patel,Computer Science,1st
Anita Sharma,Electrical,2nd
Vikram Singh,Civil,3rd
Priya Verma,Mechanical,4th
Arjun Kumar,Electronics,1st
```

---

## Technical Details

### Backend Endpoint
```
POST /api/university/students/bulk/upload
```

### Request Format
- **Method**: POST (multipart/form-data)
- **File Field**: `file` (CSV file)
- **Auth**: Required (University token)

### Response Example - Success
```json
{
  "message": "Successfully created 5 students",
  "students": [
    {
      "name": "John Doe",
      "enrollmentNo": "UNI-2026-1234-5678",
      "password": "a1b2c3d4",
      "department": "Computer Science",
      "year": "1st"
    }
  ],
  "errors": null,
  "summary": {
    "total": 5,
    "created": 5,
    "failed": 0
  }
}
```

### Response Example - With Errors
```json
{
  "message": "Successfully created 4 students",
  "students": [...],
  "errors": [
    "Row 2: Missing required fields (name, department, year)",
    "Row 5: Invalid year: 5th"
  ],
  "summary": {
    "total": 5,
    "created": 4,
    "failed": 1
  }
}
```

---

## Troubleshooting

**Q: Upload finished but shows 0 created students**
- Check if all fields have values
- Verify column names match exactly: name, department, year

**Q: Getting password generation errors**
- This shouldn't happen, but if it does, create students manually one by one

**Q: Can I update existing students with CSV?**
- Not yet - currently only supports creating new students
- To update: Edit individually or delete and re-upload

**Q: What if I upload the same CSV twice?**
- Students will be created twice with different enrollment numbers
- You'll need to manually delete duplicates

---

## Future Enhancements

Planned features:
- [ ] Faculty bulk import
- [ ] Update existing records via CSV
- [ ] Email credentials to students automatically
- [ ] Import student photos
- [ ] Batch export to PDF

---

## Support

For issues with CSV uploads:
1. Check the error message in the UI
2. Verify file format matches examples
3. Try with a smaller test file first
4. Contact admin if persistent issues

