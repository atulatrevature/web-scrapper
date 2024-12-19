import { useState, useEffect } from 'react';

const Loader = ({ isPaginationEnabled, isInternalNavigationEnabled }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const quickLoadMessages = [
        // Starting texts
        "Validating the website URL...",
        "Confirming the URL for scraping...",
        "Preparing to extract data...",
        // Quick load-specific texts
        "Loading the data...",
        "Analyzing page structure...",
        "We’re almost done...",
        // Ending texts
        "Thanks for waiting...",
        "We are almost finished...",
        "We are processing the result...",
        "Checking for any errors...",
        "Verifying the final data...",
        "The data will be ready shortly...",
      ];
      
      const paginationMessages = [
        // Starting texts
        "Validating the website URL...",
        "Confirming the URL for scraping...",
        "Preparing to extract data...",
        // Pagination-specific texts
        "Checking for pages...",
        "Scraping data from the first page...",
        "Checking for more pages...",
        "Scraping the data, please wait...",
        "Checking for errors within pages...",
        "Scraping data from the next page...",
        "Scraping the data, please wait...",
        "Checking for more pages...",
        "Scraping data from more pages...",
        "Checking for more pages...",
        "Kindly be patient, we are scraping the data...",
        "Looking for dynamic pages...",
        "Verifying data from pages...",
        // Ending texts
        "Thanks for waiting...",
        "We are almost finished...",
        "We are processing the result...",
        "Checking for any errors...",
        "Verifying the final data...",
        "The data will be ready shortly...",
      ];
      
      const navigationMessages = [
        // Starting texts
        "Validating the website URL...",
        "Confirming the URL for scraping...",
        "Preparing to extract data...",
        // Navigation-specific texts
        "Checking for internal sub-links...",
        "Verifying sub-links...",
        "Please wait, we are navigating to sub-links...",
        "Verifying data from sub-links, kindly wait...",
        "Thanks for the patience...",
        "Verifying sub-links...",
        "Please wait, we are navigating to sub-links...",
        "Verifying data from sub-links, kindly wait...",
        "Scraping data from the next page...",
        "Scraping the data, please wait...",
        "Checking for more pages...",
        "Scraping data from more pages...",
        "Checking for more pages...",
        "Kindly be patient, we are scraping the data...",
        "Looking for dynamic pages...",
        "Verifying data from pages...",
        // Ending texts
        "Thanks for waiting...",
        "We are almost finished...",
        "We are processing the result...",
        "Checking for any errors...",
        "Verifying the final data...",
        "The data will be ready shortly...",
      ];
      
      const complexLoadMessages = [
        // Starting texts
        "Verifying website URL...",
        "Checking for URL...",
        "Looking for data to scrape...",
        // Complex load-specific texts
        "Checking for pages...",
        "Scraping data from the first page...",
        "Checking for more pages...",
        "Checking for internal sub-links...",
        "Verifying sub-links...",
        "Scraping the data, please wait...",
        "Checking for errors within pages...",
        "Thanks for the patience...",
        "Scraping the data you need...",
        "Verifying data from sub-links...",
        "Looking for dynamic pages...",
        "Verifying data from pages...",
        "Checking for pages...",
        "Scraping data from the first page...",
        "Checking for more pages...",
        "Checking for internal sub-links...",
        "Verifying sub-links...",
        "Scraping the data, please wait...",
        "Checking for errors within pages...",
        "Thanks for the patience...",
        "Scraping the data you need...",
        "Verifying data from sub-links...",
        "Looking for dynamic pages...",
        "Verifying data from pages...",
        "Checking for more pages...",
        "Checking for internal sub-links...",
        "Verifying sub-links...",
        "Scraping the data, please wait...",
        "Checking for errors within pages...",
        "Scraping the data, please wait...",
        "Checking for errors within pages...",
        "Thanks for the patience...",
        "Scraping the data you need...",
        "Verifying data from sub-links...",
        "Looking for dynamic pages...",
        "Verifying data from pages...",
        "Checking for more pages...",
        "Checking for internal sub-links...",
        "Verifying sub-links...",
        "Scraping the data, please wait...",
        "Checking for errors within pages...",
        // Ending texts
        "Thanks for waiting...",
        "We are almost finished...",
        "We are processing the result...",
        "Checking for any errors...",
        "Verifying the final data...",
        "The data will be ready shortly...",  
      ];
      

    // Select appropriate message array based on enabled features
    const getMessages = () => {
        if (isPaginationEnabled && isInternalNavigationEnabled) {
            return complexLoadMessages;
        } else if (isInternalNavigationEnabled) {
            return navigationMessages;
        } else if (isPaginationEnabled) {
            return paginationMessages;
        }
        return quickLoadMessages;
    };

    const messages = getMessages();

    useEffect(() => {
        const setRandomInterval = () => {
            const randomDelay = Math.floor(Math.random() * (8000 - 3000 + 1)) + 3000;
            return setInterval(() => {
                setCurrentIndex(current => {
                    if (current < messages.length - 1) {
                        return current + 1;
                    }
                    return current;
                });
            }, randomDelay);
        };
    
        let interval = setRandomInterval();
    
        return () => {
            clearInterval(interval);
            interval = null;
        };
    }, [messages.length]);    

    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
            {/* Animated dots */}
            <div className="flex space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
            </div>

            {/* <div className="relative w-48 h-64 bg-gray-100 rounded-lg shadow-lg overflow-hidden">
                <div className="absolute top-4 left-4 right-4 space-y-2">
                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-2 bg-gray-200 rounded w-4/5"></div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="absolute top-0 left-0 right-0 h-1 bg-blue-400 opacity-75 animate-scan">
                    <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-blue-400/50 to-transparent"></div>
                </div>
            </div> */}
            {/* Loading message */}
            <div className="text-lg text-gray-700 min-h-[28px] text-center transition-all duration-300 ease-in-out">
                {messages[currentIndex]}
            </div>
        </div>
    );
};

// const style = document.createElement('style');
// style.textContent = `
//   @keyframes scan {
//     0% {
//       transform: translateY(0);
//     }
//     90%, 100% {
//       transform: translateY(256px);
//     }
//   }
//   .animate-scan {
//     animation: scan 2s ease-in-out infinite;
//   }
// `;
// document.head.appendChild(style);

export default Loader;