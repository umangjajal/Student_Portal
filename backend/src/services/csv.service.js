import fs from "fs";
import csv from "csv-parser";

export const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
};

/**
 * Convert array of objects to CSV format
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Optional headers in order
 * @returns {string} CSV formatted string
 */
export const generateCSV = (data, headers = null) => {
  if (!data || data.length === 0) {
    return "";
  }

  // Determine headers from data if not provided
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create header row
  const headerRow = csvHeaders.map(h => `"${h}"`).join(",");
  
  // Create data rows
  const dataRows = data.map(row => {
    return csvHeaders.map(header => {
      const value = row[header] || "";
      // Escape quotes and wrap in quotes if contains comma, newline, or quotes
      const escapedValue = String(value).replace(/"/g, '""');
      return `"${escapedValue}"`;
    }).join(",");
  });

  return [headerRow, ...dataRows].join("\n");
};
