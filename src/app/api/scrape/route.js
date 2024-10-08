// import puppeteer from 'puppeteer';
const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");
export async function POST(request) {
  const { url } = await request.json();

  // Mapping domains to their corresponding staff data selectors
  const schools = {
    'aisd': '.ws-dd-person-information',
    'mansfieldisd': '.fsConstituentItem',
    'lmsd': '.fsConstituentItem',
    'd11': '.fsConstituentItem',
    'mnps': '.DIR-item',
    'edwardsburgpublicschools':'.staff',
    'rcboe':'.ui-article-description',
    'prsd1435':'.staff',
    'ga':'.fsConstituentItem',
    'benzieschools':'.vc_grid-item',
    'lausd':'.staff',
    'bufsd':'.fsConstituentItem',
    'southwestr1':'.wixui-column-strip'
  };

  // Function to extract the domain name
  const extractDomainName = (url) => {
    const hostname = new URL(url).hostname;
    return hostname.split('.').slice(-2, -1)[0];
  };
  const domainName = extractDomainName(url);
  try {
     const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: '/usr/bin/chromium-browser',
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    // Add a delay to wait for the JavaScript-rendered content
    await page.waitForSelector(`table,  ${schools[domainName]}`, { timeout: 15000 }); // Adjust the selector if needed

    const staffData = await page.evaluate((schools, domainName) => {
      let staffData = [];
      const nameClasses = ['fsFullName', 'ws-dd-person-name', 'DIR-name','email','vc_custom_heading'];
      const jobTitleClasses = ['fsTitles', 'ws-dd-person-position', 'DIR-title','user-position'];

      const findFirstMatch = (element, classArray) => {
        for (const className of classArray) {
          const found = element.querySelector(`.${className}`);
          if (found) return found.textContent.trim();
        }
        return null;
      };

      // Helper function to check if the job title is valid
      const isValidJobTitle = (jobTitle) => {
        if (!jobTitle) return false;
        
        // Ensure job title doesn't contain email or invalid placeholders
        const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
        const invalidPatterns = ['@', 'TBD', 'N/A', 'None', '/','?']; // Add more if necessary
        
        return !emailPattern.test(jobTitle) && !invalidPatterns.some(pattern => jobTitle.includes(pattern));
      };

      // Helper function to extract a clean email
      const extractCleanEmail = (emailText) => {
        const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
        const parts = emailText.split(' ');
        for (const part of parts) {
          if (emailPattern.test(part)) {
            return part.trim();
          }
        }
        return null;
      };

      const extractEmail=(text)=>{
        // Regular expression to match email patterns
        const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
        // Search for the email within the text using the regex
        const foundEmail = text.match(emailPattern);
        // Return the found email or null if no email is found
        return foundEmail ? foundEmail[0].trim() : null;
      }

      const cleanName=(fullName)=>{
        // Define an array of unwanted words to remove from the full name
        const unwantedWords = ['Email', 'Name', 'Title', 'Main', 'Phone']; 
        const unwantedPattern = new RegExp(`\\b(${unwantedWords.join('|')})\\b`, 'gi'); 
        const cleanedName = fullName.replace(unwantedPattern, '').trim(); 
        return cleanedName.replace(/\s+/g, ' ').trim();
      }
 
        const elements = document.querySelectorAll(schools[domainName]); 
        if (elements.length === 0) {
          document.querySelectorAll('table tbody tr').forEach((row) => {
            const cells = row.querySelectorAll('td');
  
            if (cells.length > 0) {
              const name = cleanName(cells[0]?.innerText.trim());  // Name is always in the first cell
              let email = null;
              let jobTitle = null;
  
              // Job title could be in the second or third cell
              if (cells[1]?.innerText && !cells[1].innerText.includes('@')) {
                jobTitle = cells[1]?.innerText.trim();
              } else if (cells[2]?.innerText && !cells[2].innerText.includes('@')) {
                jobTitle = cells[2]?.innerText.trim();
              }
  
              // Validate the job title
              jobTitle = isValidJobTitle(jobTitle) ? jobTitle : null;
  
              // Find email in any cell dynamically
              cells.forEach((cell) => {
                const cellText = cell.innerText.trim();
                const extractedEmail = extractCleanEmail(cellText);
                if (extractedEmail) {
                  email = extractEmail(extractedEmail);
                }
              });
  
              if (name || email) {
                staffData.push({ name, jobTitle, email });
              }
            }
          });
        }
        
        elements.forEach((element) => {
            let name = findFirstMatch(element, nameClasses);
            name = cleanName(name)
            let jobTitle = findFirstMatch(element, jobTitleClasses);
            let email = null;
        
            const emailLink = element.querySelector('a[href^="mailto:"]');
            if (emailLink) {
                email = extractCleanEmail(emailLink.href.replace('mailto:', '').trim());
                email = extractEmail(email)
            } else {
                const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
                const elementText = element.textContent.trim();
                const foundEmail = elementText.match(emailPattern);
                if (foundEmail) {
                    email = extractEmail(foundEmail[0].trim());
                }
            }
        
            jobTitle = isValidJobTitle(jobTitle) ? jobTitle : null;
        
            if (name) {
                staffData.push({ name, jobTitle, email });
            }
        }); 

      return staffData;
    }, schools, domainName);

    await browser.close();
    return new Response(JSON.stringify(staffData), { status: 200 });
  } catch (error) {
    console.error('Scraping failed:', error);
    return new Response(JSON.stringify({ message: 'Failed to scrape data.' }), { status: 500 });
  }
}
