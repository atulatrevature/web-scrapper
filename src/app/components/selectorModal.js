import React, { useEffect, useState } from 'react';
import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const SelectorModal = ({ url, isOpen, setIsOpen, isAdmin }) => {
    const [data, setData] = useState([]);
    const [selectedKeys, setSelectedKeys] = useState({});
    const [loading, setLoading] = useState(true);
    const [htmlSnippets, setHtmlSnippets] = useState({});
    const [selectedClasses, setSelectedClasses] = useState({
        staffClasses: null,
        nameClasses: null,
        jobTitleClasses: null,
    });
    const [currentStep, setCurrentStep] = useState('staffClasses');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(apiUrl + `/scrapeWebsiteSnippets`, { params: { url: url } });
                setHtmlSnippets(response.data.htmlSnippets);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };
        isAdmin ? fetchData() : '';
    }, [url, isAdmin]);

    const handleClassSelection = () => {
        if (currentStep === 'staffClasses') {
            const tempDiv = document.createElement('div');

            tempDiv.innerHTML = htmlSnippets[selectedClasses.staffClasses];

            const elements = Array.from(tempDiv.querySelectorAll('*'));
            let snippets = {};

            elements.forEach(element => {
                const outerHTML = element.outerHTML.trim();
                const textContent = element.textContent.trim();

                if (outerHTML && textContent) {
                    let selector = '';

                    if (element.className) {
                        selector = `.${element.className.split(' ').join('.')}`;
                    } else if (element.id) {
                        selector = `#${element.id}`;
                    } else {
                        selector = element.tagName.toLowerCase();
                    }

                    if (!snippets[selector]) {
                        snippets[selector] = outerHTML;
                    }
                    const childElements = Array.from(element.children);
                    childElements.forEach(child => {
                        const childOuterHTML = child.outerHTML.trim();
                        const childTextContent = child.textContent.trim();
                        let childSelector = '';

                        if (child.className) {
                            childSelector = `${selector} .${child.className.split(' ').join('.')}`;
                        } else {
                            childSelector = `${selector} ${child.tagName.toLowerCase()}`;
                        }

                        if (childOuterHTML && childTextContent) {
                            snippets[childSelector] = childOuterHTML;
                        }
                    });
                }
            });

            setHtmlSnippets({ ...htmlSnippets, ...snippets })
            setCurrentStep('nameClasses');
        } else if (currentStep === 'nameClasses') {
            setCurrentStep('jobTitleClasses');
        } else if (currentStep === 'jobTitleClasses') {
            savePotentialClasses({ url, ...selectedClasses });
        }
    };

    const handleBack = () => {
        if (currentStep === 'nameClasses') {
            setCurrentStep('staffClasses');
        } else if (currentStep === 'jobTitleClasses') {
            setCurrentStep('nameClasses');
        }
    };

    const savePotentialClasses = async (data) => {
        try {
            const response = await axios.put(apiUrl + '/potentialClasses', data);
            if (response.status === 200 && response.data.success) {
                setIsOpen(false);
            } else {
                alert('Failed to save classes:', response.data.message);
            }
        } catch (error) {
            console.error('Error saving classes:', error.response?.data?.message || error.message);
        }
    };

    return (
        isOpen && (
            <div
                id="default-modal"
                className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
                <div className="relative w-full max-w-3xl max-h-full bg-white rounded-lg shadow-lg">
                    {/* Modal Header */}
                    {isAdmin ? <>
                        <div className="flex items-center justify-between p-4 border-b border-gray-300 rounded-t">
                            <div className="text-gray-700">
                                <h3 className="text-xl font-semibold text-gray-800">Content Mappings</h3>
                                {currentStep === 'staffClasses' && <p>Select Staff Classes:</p>}
                                {currentStep === 'nameClasses' && <p>Select Name Classes:</p>}
                                {currentStep === 'jobTitleClasses' && <p>Select Job Title Classes:</p>}
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                type="button"
                                className="text-gray-600 hover:bg-gray-200 hover:text-gray-800 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                            >
                                <span className="sr-only">Close modal</span>&times;
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
                            {htmlSnippets && Object.keys(htmlSnippets).length > 0 ? (
                                Object.entries(htmlSnippets).reverse().map(([selector, snippet], index) => (
                                    <div key={index}
                                        className={`mb-4 border p-4 cursor-pointer ${selectedClasses[currentStep] === selector ? 'border-blue-600 bg-blue-100' : 'border-gray-300 bg-white'}`}
                                        onClick={() => setSelectedClasses({ ...selectedClasses, [currentStep]: selector })}>
                                        <div className="font-semibold text-blue-700">
                                            Selector: {selector}
                                        </div>
                                        <div
                                            className="mt-2 p-2"
                                            dangerouslySetInnerHTML={{ __html: snippet }}
                                        />
                                    </div>
                                ))
                            ) : (<p>{loading ? "Loading..." : "No snippets available."}</p>)}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-300">
                            {currentStep !== 'staffClasses' && (
                                <button onClick={handleBack}
                                    className="mr-2 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400">
                                    Back
                                </button>
                            )}
                            <button onClick={handleClassSelection} disabled={selectedClasses[currentStep] === null}
                                className={`px-4 py-2 ${selectedClasses[currentStep] !== null ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'} rounded-lg hover:bg-blue-700`}>
                                {currentStep === 'jobTitleClasses' ? 'Confirm Selection' : 'Next'}
                            </button>
                        </div>
                    </> : <>
                        <div className="flex items-center justify-between p-4 border-b border-gray-300 rounded-t">
                            <div className="text-gray-700">
                                <h3 className="text-xl font-semibold text-gray-800">Website Needs to be configured</h3>
                                <p>Kindly contact the admin</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                type="button"
                                className="text-gray-600 hover:bg-gray-200 hover:text-gray-800 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                            >
                                <span className="sr-only">Close modal</span>&times;
                            </button>
                        </div>
                    </>}
                </div>
            </div>
        )
    );
};

export default SelectorModal;
