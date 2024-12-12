'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx'; // Importing the xlsx library for Excel download
import ClassConfigurationModal from '../components/classesConfig'
import SelectorModal from '../components/selectorModal'
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

  return (
    <div className="min-h-screen bg-gray-100 py-5 px-10">
      {/* Logo at the top */}
      <div className="flex justify-between">
        <img src="/oksgroups.jpg" alt="Logo" className="h-16" /> {/* Adjust the path and size */}
        {isAdmin && <ClassConfigurationModal />}
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
        <label className="inline-flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={paginationEnabled}
              onChange={(e) => setPaginationEnabled(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </div>
          <span className="ml-3 text-sm font-medium text-gray-700">Enable Pagination</span>
        </label>
        <label className="inline-flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={internalNavigationEnabled}
              onChange={(e) => setInternalNavigationEnabled(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </div>
          <span className="ml-3 text-sm font-medium text-gray-700">Enable Internal Navigation</span>
        </label>
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
                  <th className="py-2 px-4 text-left">S.No</th>
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">Job Title</th>
                  <th className="py-2 px-4 text-left">Email Address</th>
                  <th className="py-2 px-4 text-left">Scraped URL</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="py-2 px-4">
                      {item.originalIndex + 1}
                    </td>
                    <td className="py-2 px-4">
                      {editingIndex === item.originalIndex ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        item.name
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {editingIndex === item.originalIndex ? (
                        <input
                          type="text"
                          value={editForm.jobTitle}
                          onChange={(e) => setEditForm({ ...editForm, jobTitle: e.target.value })}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        item.jobTitle
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {editingIndex === item.originalIndex ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        item.email
                      )}
                    </td>
                    <td className="py-2 px-4">{item.url}</td>
                    <td className="py-2 px-4">
                      {editingIndex === item.originalIndex ? (
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            className="p-1 text-green-600 hover:text-green-800"
                          >
                            <IconCheck size={20} stroke={1.5} />
                          </button>
                          <button
                            onClick={() => setEditingIndex(null)}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <IconX size={20} stroke={1.5} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item.originalIndex)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                          >
                            <IconEdit size={20} stroke={1.5} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.originalIndex)}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <IconTrash size={20} stroke={1.5} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {showAddForm && (
                  <tr className="border-t">
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        value={newRow.name}
                        onChange={(e) => setNewRow({ ...newRow, name: e.target.value })}
                        className="w-full p-1 border rounded"
                        placeholder="Name"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        value={newRow.jobTitle}
                        onChange={(e) => setNewRow({ ...newRow, jobTitle: e.target.value })}
                        className="w-full p-1 border rounded"
                        placeholder="Job Title"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="email"
                        value={newRow.email}
                        onChange={(e) => setNewRow({ ...newRow, email: e.target.value })}
                        className="w-full p-1 border rounded"
                        placeholder="Email"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        value={newRow.url}
                        onChange={(e) => setNewRow({ ...newRow, url: e.target.value })}
                        className="w-full p-1 border rounded"
                        placeholder="URL"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddRow}
                          className="p-1 text-green-600 hover:text-green-800"
                        >
                          <IconCheck size={20} stroke={1.5} />
                        </button>
                        <button
                          onClick={() => setShowAddForm(false)}
                          className="p-1 text-red-600 hover:text-red-800"
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
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
