import puppeteer from 'puppeteer';

export async function POST(request) {
  const { url } = await request.json();

  // Mapping domains to their corresponding staff data selectors
  const schools = {
    'aisd': '.ws-dd-person-information',
    'mansfieldisd': '.fsConstituentItem',
    'lmsd': '.fsConstituentItem',
    'd11': '.fsConstituentItem',
    'mnps': '.DIR-item',
  };

  // Function to extract the domain name
  const extractDomainName = (url) => {
    const hostname = new URL(url).hostname;
    return hostname.split('.').slice(-2, -1)[0];
  };
  const domainName = extractDomainName(url);

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Add a delay to wait for the JavaScript-rendered content
    await page.waitForSelector(`table, ${schools[domainName]}`, { timeout: 5000 }); // Adjust the selector if needed

    const staffData = await page.evaluate((schools, domainName) => {
      let staffData = [];
      const nameClasses = ['fsFullName', 'ws-dd-person-name', 'DIR-name'];
      const jobTitleClasses = ['fsTitles', 'ws-dd-person-position', 'DIR-title'];

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

      if (schools[domainName]) {
        // First, attempt to extract data using the mapped domain selectors
        document.querySelectorAll(schools[domainName]).forEach((element) => {
          const name = findFirstMatch(element, nameClasses);
          let jobTitle = findFirstMatch(element, jobTitleClasses);
          let email = null;
          const emailLink = element.querySelector('a[href^="mailto:"]');
          if (emailLink) {
            email = extractCleanEmail(emailLink.href.replace('mailto:', '').trim());
          }

          // Validate the job title
          jobTitle = isValidJobTitle(jobTitle) ? jobTitle : null;

          if (name) {
            staffData.push({ name, jobTitle, email });
          }
        });
      } else {
        // For sites with a table-based structure
        document.querySelectorAll('table tbody tr').forEach((row) => {
          const cells = row.querySelectorAll('td');

          if (cells.length > 0) {
            const name = cells[0]?.innerText.trim();  // Name is always in the first cell
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
                email = extractedEmail;
              }
            });

            if (name || email) {
              staffData.push({ name, jobTitle, email });
            }
          }
        });
      }

      return staffData;
    }, schools, domainName);

    await browser.close();
    return new Response(JSON.stringify(staffData), { status: 200 });
  } catch (error) {
    console.error('Scraping failed:', error);
    return new Response(JSON.stringify({ message: 'Failed to scrape data.' }), { status: 500 });
  }
}
