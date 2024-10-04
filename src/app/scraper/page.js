'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx'; // Importing the xlsx library for Excel download
import ClassConfigurationModal from '../components/classesConfig'
import SelectorModal from '../components/selectorModal'
import axios from 'axios';

export default function ScraperPage() {
  const [url, setUrl] = useState('');
  const [data, setData] = useState([]); // Initialize data as an empty array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // New state for search input
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Please Enter a valid URL to scrape")
      return
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`http://localhost:3000/getStaffClassByDomain`, { params: { url: url } });

      const data = response.data;
      if (data.success && data.data) {
        setShowModal(false);
        try {
          const response = await axios.post('http://localhost:3000/scrape', { url },
            {
              headers: {
                'Content-Type': 'application/json',
              }
            }
          );
          if (response.status === 200) {
            const updatedData = response.data.map((item) => ({
              ...item,
              url, // Add the scraped URL to each item
            }));
            // Append new scraped data to the existing data
            setData((prevData) => [...prevData, ...updatedData]);
          } else {
            setError(response.data.message);
          }
        } catch (err) {
          setError('Failed to fetch data.');
        }
      } else {
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching domain data:', error);
    }

    setLoading(false);
  };

  // Function to download the table as an Excel file
  const handleDownloadExcel = () => {
    if (!data || data.length === 0) {
      alert('No data available to download');
      return;
    }

    const headers = ['Name', 'Job Title', 'Email Address', 'Scraped URL'];

    const tableData = data.map(item => ({
      name: item.name,
      jobTitle: item.jobTitle,
      email: item.email,
      url: item.url, // Include the URL in the Excel data
    }));

    // Create a worksheet from the table data
    const worksheet = XLSX.utils.json_to_sheet(tableData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff Data');

    // Trigger the download
    XLSX.writeFile(workbook, 'staff_data.xlsx');
  };

  // Function to clear the table data
  const handleClearData = () => {
    setData([]);
    setSearchTerm('');
  };

  // Filter data based on searchTerm (case insensitive)
  const filteredData = data.filter((item) =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 py-5 px-10">
      {/* Logo at the top */}
      <div className="flex justify-between">
        <img src="/oksgroups.jpg" alt="Logo" className="h-16" /> {/* Adjust the path and size */}
        <ClassConfigurationModal />
      </div>

      {/* URL input and Scrape button on the same row */}
      <form onSubmit={handleSubmit} className="my-5 flex items-center space-x-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter website URL"
          className="border p-2 rounded w-full"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          disabled={loading} // Disable button while loading
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle className="text-white" cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" /></svg>
              Loading...
            </span>
          ) : (
            "Scrape"
          )}
        </button>
      </form>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* Search, Download, and Clear buttons on the same row */}
      {data.length > 0 && (

        <div className="mt-10 mb-1 flex justify-between items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="border p-2 rounded w-[70%]"
          />
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadExcel}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Download Excel
            </button>
            <button
              onClick={handleClearData}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Display the scraped data in a table */}
      {data.length > 0 && (
        <>
          {/* Show the count of data items */}
          <p className="mt-1 mb-2 text-sm font-semibold text-gray-600">
            Showing {filteredData.length} {filteredData.length === 1 ? 'record' : 'records'} out of {data.length} total
          </p>

          {/* Display the scraped data in a table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded shadow">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">Job Title</th>
                  <th className="py-2 px-4 text-left">Email Address</th>
                  <th className="py-2 px-4 text-left">Scraped URL</th> {/* New Column */}
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="py-2 px-4">{item.name}</td>
                      <td className="py-2 px-4">{item.jobTitle}</td>
                      <td className="py-2 px-4">{item.email}</td>
                      <td className="py-2 px-4">{item.url}</td> {/* Display the URL */}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-2 px-4 text-center">No matching results found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
      {showModal && <SelectorModal url={url} setIsOpen={setShowModal} isOpen={showModal} />}
    </div>
  );
}
