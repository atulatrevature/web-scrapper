import puppeteer from 'puppeteer';

export async function POST(request) {
  const { url } = await request.json();

  // Mapping domains to their corresponding staff data selectors
  const schools = {
    'aisd': '.ws-dd-person-information',
    'mansfieldisd': '.fsConstituentItem',
    'lmsd': '.fsConstituentItem',
    'd11': '.fsConstituentItem',
    'mnps': '.DIR-item'
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

      console.log(schools[domainName])
      if(schools[domainName]){
          // First, attempt to extract data using the mapped domain selectors
          console.log("Got into class search")
        document.querySelectorAll(schools[domainName]).forEach((element) => {
          const name = findFirstMatch(element, nameClasses);
          const jobTitle = findFirstMatch(element, jobTitleClasses);
          let email = null;
          const emailLink = element.querySelector('a[href^="mailto:"]');
          if (emailLink) {
            email = emailLink.href.replace('mailto:', '').trim();
          }
          if (name) {
            staffData.push({ name, jobTitle, email });
          } 
        });
      }else{ 
        console.log("Got into table search")
          document.querySelectorAll('table tbody tr').forEach((row) => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 1) {
              const name = cells[0]?.innerText.trim();
              const email = (cells[1].innerText.includes('@')) ? cells[1].innerText.trim() : null;
              const jobTitle = cells[0]?.querySelector('br')?.nextSibling?.nodeValue?.trim() || null;
  
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
