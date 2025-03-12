import { useState, useEffect } from 'react';

const Loader = ({ isPaginationEnabled, isInternalNavigationEnabled }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [progress, setProgress] = useState(0);

    const quickLoadMessages = [
        // Starting texts
        "Validating the website URL...",
        "Confirming the URL for scraping...",
        "Preparing to extract data...",
        // Quick load-specific texts
        "Loading the data...",
        "Analyzing page structure...",
        "We're almost done...",
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
        "Scraping the data, please wait...",
        "Kindly be patient, we are scraping the data...",
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
        // Start timer
        const startTime = Date.now();
        const targetDuration = 420000; // 7 minutes in milliseconds
        
        // Update elapsed time every second
        const timerInterval = setInterval(() => {
            const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
            setElapsedTime(timeElapsed);
        }, 1000);
        
        const setRandomInterval = () => {
            const randomDelay = Math.floor(Math.random() * (8000 - 3000 + 1)) + 3000;
            return setInterval(() => {
                setCurrentIndex(current => {
                    if (current < messages.length - 1) {
                        // Calculate progress based on elapsed time instead of message index
                        const elapsedMs = Date.now() - startTime;
                        const newProgress = Math.min(95, Math.floor((elapsedMs / targetDuration) * 100));
                        setProgress(newProgress);
                        return current + 1;
                    }
                    // Only set to 100% after target duration
                    if (Date.now() - startTime >= targetDuration) {
                        setProgress(100);
                    }
                    return current;
                });
            }, randomDelay);
        };

        let interval = setRandomInterval();
    
        return () => {
            clearInterval(interval);
            clearInterval(timerInterval);
            interval = null;
        };
    }, [messages.length]);
    
    // Format elapsed time as mm:ss
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-6 max-w-2xl mx-auto">
            {/* Timer display */}
            <div className="text-lg font-mono bg-gray-800 text-green-400 px-4 py-2 rounded-lg shadow-lg">
                Elapsed Time: {formatTime(elapsedTime)}
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
                <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            
            {/* Futuristic console display */}
            <div className="w-full bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg text-left font-mono relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
                
                {/* Console header */}
                <div className="flex justify-between items-center mb-4 text-gray-400 text-sm border-b border-gray-700 pb-2">
                    <div>Web Scraper v1.0</div>
                    <div>Status: <span className="text-green-400">Active</span></div>
                </div>
                
                {/* Current operation display */}
                <div className="text-green-400 mb-4">
                    <span className="text-blue-400">&gt;</span> {messages[currentIndex]}
                    <span className="inline-block w-2 h-4 ml-1 bg-green-400 animate-pulse"></span>
                </div>
                
                {/* Previous operations (show last 3 messages) */}
                <div className="text-gray-500 text-sm space-y-1">
                    {Array.from({length: 3}).map((_, i) => {
                        const msgIndex = currentIndex - (i + 1);
                        if (msgIndex >= 0) {
                            return (
                                <div key={i} className="opacity-70" style={{opacity: 0.7 - (i * 0.2)}}>
                                    <span className="text-blue-400">&gt;</span> {messages[msgIndex]}
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>
            </div>
            
            {/* Animated processing indicator */}
            <div className="flex space-x-3 items-center">
                <div className="relative w-10 h-10">
                    <div className="absolute inset-0 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-1 border-4 border-t-transparent border-r-blue-400 border-b-transparent border-l-transparent rounded-full animate-spin" style={{animationDuration: '1.5s'}}></div>
                </div>
                <div className="text-sm text-gray-500">Processing data...</div>
            </div>
        </div>
    );
};

export default Loader;