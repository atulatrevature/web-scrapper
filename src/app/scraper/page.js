'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx'; // Importing the xlsx library for Excel download

export default function ScraperPage() {
  const [url, setUrl] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();
      if (response.ok) {
        console.log(result)
        setData(result);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to fetch data.');
    }

    setLoading(false);
  };

  // Function to download the table as an Excel file
  const handleDownloadExcel = () => {
    if (!data || data.length === 0) {
      alert('No data available to download');
      return;
    }

    const headers = ['Name', 'Job Title', 'Email Address'];

    const tableData = data.map(item => ({
      name: item.name,
      jobTitle: item.jobTitle,
      email: item.email,
    }));

    // Create a worksheet from the table data
    const worksheet = XLSX.utils.json_to_sheet(tableData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff Data');

    // Trigger the download
    XLSX.writeFile(workbook, 'staff_data.xlsx');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold mb-5">School Staff List Demo</h1>
      <form onSubmit={handleSubmit} className="mb-5">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter website URL"
          className="border p-2 rounded w-full mb-3"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Scrape
        </button>
      </form>

      {loading && <p>Scraping data, please wait...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Button to download Excel */}
      {data && (
        <div className="mb-5 flex flex-row justify-end">
          <button
            onClick={handleDownloadExcel}
            className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
          >
            Download as Excel
          </button>
        </div>
      )}

      {/* Display the scraped data in a table */}
      {data && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Job Title</th>
                <th className="py-2 px-4 text-left">Email Address</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="py-2 px-4">{item.name}</td>
                  <td className="py-2 px-4">{item.jobTitle}</td>
                  <td className="py-2 px-4">{item.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
