'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx'; // Importing the xlsx library for Excel download
import ClassConfigurationModal from '../components/classesConfig'
import SelectorModal from '../components/selectorModal'
import Loader from '../components/loader'
import axios from 'axios';
import { IconEdit, IconTrash, IconPlus, IconCheck, IconX } from '@tabler/icons-react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function ScraperPage() {
  const searchParams = useSearchParams();

  const [isAdmin, setIsAdmin] = useState(false);
  const [url, setUrl] = useState('');
  const [data, setData] = useState([]); // Initialize data as an empty array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // New state for search input
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [paginationEnabled, setPaginationEnabled] = useState(false);
  const [internalNavigationEnabled, setInternalNavigationEnabled] = useState(false);
  const [newRow, setNewRow] = useState({
    name: '',
    jobTitle: '',
    email: '',
    url: ''
  });

  useEffect(() => {
    const userType = searchParams?.get('userType') || '';

    if (userType === 'oks-admin') {
      setIsAdmin(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Please Enter a valid URL to scrape")
      return
    }

    setLoading(true);
    setError(null);
    setShowModal(false);

    try {
      const response = await axios.post(apiUrl + '/scrape', { url, paginationEnabled, internalNavigationEnabled });
      if (response.status === 200) {
        if (response.data.length) {
          const updatedData = response.data.map((item) => ({
            ...item,
            url, // Add the scraped URL to each item
          }));
          setData((prevData) => [...prevData, ...updatedData]);
        } else if (!response.data.length) {
          setShowModal(true);
        } else {
          setError(response.data.message);
        }
      }
    } catch (error) {
      alert("Error fetching data from url, Please verify the url and try again")
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

    const headers = ['S.No', 'Name', 'Job Title', 'Email Address', 'Scraped URL'];

    const tableData = data.map((item, index) => ({
      'S.No': index + 1,
      'Name': item.name || '',
      'Job Title': item.jobTitle || '',
      'Email Address': item.email || '',
      'Scraped URL': item.url || '', 
    }));

    // Create a worksheet from the table data
    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff Data');

    // Trigger the download
    XLSX.writeFile(workbook, 'staff_data.xlsx');
  };

  // Function to clear the table data
  const handleClearData = () => {
    setPaginationEnabled(false);
    setInternalNavigationEnabled(false);
    setData([]);
    setSearchTerm('');
  };

  // Filter data based on searchTerm (case insensitive)
  const filteredData = data.filter((item, index) => {
    item['originalIndex'] = index;
    return item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase())
  }
  );

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditForm(data[index]);
  };

  const handleSaveEdit = () => {
    const newData = [...data];
    newData[editingIndex] = editForm;
    setData(newData);
    setEditingIndex(null);
    setEditForm({});
  };

  const handleDelete = (index) => {
    if (confirm('Are you sure you want to delete this row? This action cannot be undone.')) {
      const newData = data.filter((_, i) => i !== index);
      setData(newData);
    }
  };

  const handleAddRow = () => {
    setData([...data, newRow]);
    setNewRow({ name: '', jobTitle: '', email: '', url: '' });
    setShowAddForm(false);
  };

  const copyTableAsCSV = () => {
    const table = document.querySelector('#data-table');
    const headers = Array.from(table.querySelectorAll('thead th'))
      .slice(1, -1)
      .map(header => header.textContent.trim())
      .join('\t');

    const rows = Array.from(table.querySelectorAll('tbody tr'))
      .map(row => {
        return Array.from(row.querySelectorAll('td'))
          .slice(1, -1)
          .map(cell => cell.textContent.trim())
          .join('\t');
      })
      .join('\n');
    const tableData = `${headers}\n${rows}`;
    // navigator.clipboard.writeText(tableData)
    //   .then(() => {
    //     alert('Table copied to clipboard!');
    //   })
    //   .catch((error) => {
    //     console.error('Failed to copy table:', error);
    //     alert('Failed to copy table. Please try again.');
    //   });

    const textarea = document.createElement('textarea');
    textarea.value = tableData;
    document.body.appendChild(textarea);
    textarea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        alert('Table copied to clipboard!');
      } else if (window.clipboardData) {
        try {
          window.clipboardData.setData('Text', tableData);
          alert('Table copied to clipboard!');
        } catch (error) {
          console.error('Failed to copy table:', error);
          alert('Failed to copy table. Please try again.');
        }
      } else {
        throw new Error('Copy command failed.');
      }
    } catch (error) {
      console.error('Failed to copy table:', error);
      alert('Failed to copy table. Please try again.');
    } finally {
      document.body.removeChild(textarea);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-5 px-10 text-gray-100">
      {/* Logo at the top */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <img src="/oksgroups.jpg" alt="Logo" className="h-16 rounded-lg shadow-lg border border-blue-400" />
          <h1 className="ml-4 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Web Scraper
          </h1>
        </div>
        {isAdmin && <ClassConfigurationModal />}
      </div>

      {/* URL input and Scrape button on the same row */}
      <form onSubmit={handleSubmit} className="my-8 flex items-center space-x-4 bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter website URL"
          className="border border-gray-600 bg-gray-900 p-3 rounded-lg w-full text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Scraping...
            </span>
          ) : (
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm1 4h12v1H4V7zm0 2h12v1H4V9zm0 2h12v1H4v-1zm0 2h12v1H4v-1z" clipRule="evenodd" />
              </svg>
              Scrape
            </span>
          )}
        </button>

        <label className="inline-flex items-center cursor-pointer bg-gray-800 p-2 rounded-lg border border-gray-700">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={paginationEnabled}
              disabled={loading}
              onChange={(e) => setPaginationEnabled(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-300 after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </div>
          <span className="ml-3 text-sm font-medium text-gray-300">Enable Pagination</span>
        </label>

        <label className="inline-flex items-center cursor-pointer bg-gray-800 p-2 rounded-lg border border-gray-700">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={internalNavigationEnabled}
              disabled={loading}
              onChange={(e) => setInternalNavigationEnabled(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-300 after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </div>
          <span className="ml-3 text-sm font-medium text-gray-300 no-wrap">Enable Internal Navigation</span>
        </label>
      </form>


      {error && <p className="text-red-400 text-center p-3 bg-red-900/30 border border-red-700 rounded-lg my-4">{error}</p>}

      {loading && <Loader isPaginationEnabled={paginationEnabled} isInternalNavigationEnabled={internalNavigationEnabled} />}

      {/* Search, Download, and Clear buttons on the same row */}
      {data.length > 0 && (
        <div className="mt-10 mb-4 flex justify-between items-center bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700">
          <div className="relative w-[50%]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="border border-gray-600 bg-gray-900 p-3 pl-10 rounded-lg w-full text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={copyTableAsCSV}
              className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 flex items-center shadow-lg border border-indigo-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
              Copy Table
            </button>
            <button
              onClick={handleDownloadExcel}
              className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-all duration-300 flex items-center shadow-lg border border-green-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download Excel
            </button>
            <button
              onClick={handleClearData}
              className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-all duration-300 flex items-center shadow-lg border border-red-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Display the scraped data in a table */}
      {data.length > 0 && (
        <>
          {/* Show the count of data items */}
          <p className="mt-1 mb-4 text-sm font-semibold text-blue-400 bg-gray-800/50 p-2 rounded-lg inline-block">
            Showing {filteredData.length} {filteredData.length === 1 ? 'record' : 'records'} out of {data.length} total
          </p>

          {/* Display the scraped data in a table */}
          <div className="overflow-x-auto rounded-xl shadow-2xl border border-gray-700">
            <table id="data-table" className="min-w-full bg-gray-800 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-blue-900 to-purple-900 text-white">
                  <th className="py-3 px-4 text-left">S.No</th>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Job Title</th>
                  <th className="py-3 px-4 text-left">Email Address</th>
                  <th className="py-3 px-4 text-left">Scraped URL</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={index} className="border-t border-gray-700 hover:bg-gray-700/50 transition-colors duration-150">
                    <td className="py-3 px-4">
                      {item.originalIndex + 1}
                    </td>
                    <td className="py-3 px-4">
                      {editingIndex === item.originalIndex ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full p-2 border border-gray-600 bg-gray-900 rounded-lg text-gray-100"
                        />
                      ) : (
                        item.name
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingIndex === item.originalIndex ? (
                        <input
                          type="text"
                          value={editForm.jobTitle}
                          onChange={(e) => setEditForm({ ...editForm, jobTitle: e.target.value })}
                          className="w-full p-2 border border-gray-600 bg-gray-900 rounded-lg text-gray-100"
                        />
                      ) : (
                        item.jobTitle
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingIndex === item.originalIndex ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full p-2 border border-gray-600 bg-gray-900 rounded-lg text-gray-100"
                        />
                      ) : (
                        <span className="text-blue-400">{item.email}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-green-400 truncate max-w-xs">{item.url}</td>
                    <td className="py-3 px-4">
                      {editingIndex === item.originalIndex ? (
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <IconCheck size={20} stroke={1.5} />
                          </button>
                          <button
                            onClick={() => setEditingIndex(null)}
                            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <IconX size={20} stroke={1.5} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item.originalIndex)}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <IconEdit size={20} stroke={1.5} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.originalIndex)}
                            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <IconTrash size={20} stroke={1.5} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {showAddForm && (
                  <tr className="border-t border-gray-700 bg-gray-700/30">
                    <td className="py-3 px-4">{data.length + 1}</td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={newRow.name}
                        onChange={(e) => setNewRow({ ...newRow, name: e.target.value })}
                        className="w-full p-2 border border-gray-600 bg-gray-900 rounded-lg text-gray-100"
                        placeholder="Name"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={newRow.jobTitle}
                        onChange={(e) => setNewRow({ ...newRow, jobTitle: e.target.value })}
                        className="w-full p-2 border border-gray-600 bg-gray-900 rounded-lg text-gray-100"
                        placeholder="Job Title"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="email"
                        value={newRow.email}
                        onChange={(e) => setNewRow({ ...newRow, email: e.target.value })}
                        className="w-full p-2 border border-gray-600 bg-gray-900 rounded-lg text-gray-100"
                        placeholder="Email"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={newRow.url}
                        onChange={(e) => setNewRow({ ...newRow, url: e.target.value })}
                        className="w-full p-2 border border-gray-600 bg-gray-900 rounded-lg text-gray-100"
                        placeholder="URL"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddRow}
                          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <IconCheck size={20} stroke={1.5} />
                        </button>
                        <button
                          onClick={() => setShowAddForm(false)}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <IconX size={20} stroke={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="m-3 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
              >
                <IconPlus size={20} stroke={1.5} />
                Add Row
              </button>
            )}
          </div>
        </>
      )}
      {showModal && <SelectorModal url={url} setIsOpen={setShowModal} isOpen={showModal} isAdmin={isAdmin} />}
    </div>
  );
}
