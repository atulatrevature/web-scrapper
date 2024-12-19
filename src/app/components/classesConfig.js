
import { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';
import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const ClassConfigurationModal = () => {
    const [isOpen, setIsOpen] = useState(false); // Modal state
    const [classes, setClasses] = useState([]); // State to store the classes

    // Fetch potential classes from API
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await axios.get(apiUrl + '/potentialClasses', {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.status === 200) {
                    setClasses(response.data);
                }
            } catch (error) {
                console.error('Error fetching potential classes:', error);
            }
        };

        fetchClasses();
    }, []);

    const handleDelete = (category, index) => {
        // Logic to delete a class
        if (Array.isArray(classes[category])) {
            const updatedClasses = { ...classes };
            updatedClasses[category].splice(index, 1);
            setClasses(updatedClasses);
        } else {
            const key = Object.keys(classes[category])[index];
            const updatedClasses = {
                ...classes,
                [category]: {
                    ...classes[category],
                    [key]: undefined,
                },
            };
            delete updatedClasses[category][key];
            setClasses(updatedClasses);
        }
    };

    const handleAddClass = (category) => {
        if (Array.isArray(classes[category])) {
            const className = prompt("Enter the class name:");
            if (className) {
                setClasses((prevClasses) => ({
                    ...prevClasses,
                    [category]: [...prevClasses[category], className],
                }));
            }
        } else {
            const domainName = prompt("Enter the domain name:");
            if (domainName) {
                const className = prompt(`Enter the class name for ${category}:`);
                if (className) {
                    setClasses((prevClasses) => ({
                        ...prevClasses,
                        [category]: {
                            ...prevClasses[category],
                            [domainName]: {
                                domain: domainName,
                                selector: className
                            },
                        },
                    }));
                }
            }
        }
    };

    const handleSave = async () => {
        try {
            const response = await axios.post(apiUrl + '/potentialClasses', classes,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.status === 200 && response.data.success) {
                setIsOpen(false);
            } else {
                alert('Failed to save classes:', response.data.message);
            }
        } catch (error) {
            console.error('Error saving potential classes:', error);
        }
    };

    return (
        <>
            {/* Button to open modal */}
            <button
                onClick={() => setIsOpen(true)}
                className="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
                Open Configuration
            </button>

            {/* Modal */}
            {isOpen && (
                <div
                    id="default-modal"
                    className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-gray-500/50"
                    aria-hidden="true"
                >
                    <div className="relative w-full max-w-2xl max-h-full bg-white rounded-lg shadow">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900">
                                Potential Classes Configuration
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                type="button"
                                className="text-gray-600 bg-transparent hover:bg-gray-100 hover:text-gray-800 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                            >
                                <span className="sr-only">Close modal</span>
                                &times;
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 md:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
                            {Object.keys(classes).map((category) => (
                                <div key={category} className="mb-4">
                                    <h4 className="font-semibold text-lg text-gray-900">{category.replace(/([A-Z])/g, ' $1')}</h4>
                                    <table className="min-w-full text-left text-gray-600">
                                        <thead>
                                            <tr className='bg-gray-100'>
                                                {typeof classes[category] === 'object' && !Array.isArray(classes[category]) ? (
                                                    <>
                                                        <th className="px-6 py-3 text-gray-800">Domain</th>
                                                        <th className="px-6 py-3 text-gray-800">Class</th>
                                                        <th className="px-6 py-3 text-gray-800">Action</th>
                                                    </>
                                                ) : (
                                                    <>
                                                        <th className="px-6 py-3 text-gray-800">Class Name</th>
                                                        <th className="px-6 py-3 text-gray-800">Action</th>
                                                    </>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {typeof classes[category] === 'object' && !Array.isArray(classes[category])
                                                ? Object.entries(classes[category]).map(([domain, classValue], index) => (
                                                    <tr key={index} className="bg-gray-50 border-b border-gray-200">
                                                        <td className="px-6 py-4 text-gray-700">{domain}</td>
                                                        <td className="px-6 py-4 text-gray-700">{classValue.selector}</td>
                                                        <td className="px-6 py-4">
                                                            <button
                                                                onClick={() => handleDelete(category, index)}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                                : classes[category].map((classItem, index) => (
                                                    <tr key={index} className="bg-gray-50 border-b border-gray-200">
                                                        <td className="px-6 py-4 text-gray-700">{classItem}</td>
                                                        <td className="px-6 py-4">
                                                            <button
                                                                onClick={() => handleDelete(category, index)}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                    {/* Add new class button */}
                                    <div className="mt-4">
                                        <button
                                            onClick={() => handleAddClass(category)}
                                            className="text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                        >
                                            Add New Class
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Modal Footer */}
                        <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b">
                            <button
                                onClick={handleSave}
                                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ClassConfigurationModal;
