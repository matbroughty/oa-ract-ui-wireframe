/**
 * Utility functions for exporting table data to CSV/Excel format
 */

/**
 * Convert an array of objects to CSV format
 * @param data Array of objects to convert
 * @param headers Optional custom headers (if not provided, will use object keys)
 * @returns CSV string
 */
export function convertToCSV<T extends Record<string, any>>(
  data: T[],
  headers?: { key: keyof T; label: string }[]
): string {
  if (!data || !data.length) return '';

  // If headers not provided, use object keys
  const keys = headers ? headers.map(h => h.key) : Object.keys(data[0]) as (keyof T)[];
  const headerLabels = headers ? headers.map(h => h.label) : keys as string[];

  // Create CSV header row
  const headerRow = headerLabels.map(label => `"${String(label).replace(/"/g, '""')}"`).join(',');

  // Create CSV data rows
  const rows = data.map(row => {
    return keys.map(key => {
      const value = row[key];
      // Handle different data types
      if (value === null || value === undefined) return '""';
      if (value !== null && typeof value === 'object' && (value as object) instanceof Date) {
        return `"${value.toLocaleString()}"`;
      }
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
  }).join('\n');

  return `${headerRow}\n${rows}`;
}

/**
 * Download data as a CSV file
 * @param csvData CSV string data
 * @param filename Filename for the downloaded file
 */
export function downloadCSV(csvData: string, filename: string): void {
  // Create a blob with the CSV data
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });

  // Create a download link
  const link = document.createElement('a');

  // Create a URL for the blob
  const url = URL.createObjectURL(blob);

  // Set link properties
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  // Add link to document, click it, and remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export table data to CSV and download it
 * @param data Array of objects to export
 * @param filename Filename for the downloaded file
 * @param headers Optional custom headers
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: { key: keyof T; label: string }[]
): void {
  const csvData = convertToCSV(data, headers);
  downloadCSV(csvData, filename);
}
