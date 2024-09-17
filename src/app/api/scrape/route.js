import puppeteer from 'puppeteer';

export async function POST(request) {
  const { url } = await request.json();

  // Mapping domains to their corresponding staff data selectors
  const schools = {
    'aisd': '.ws-dd-person-information',
    'mansfieldisd': '.fsConstituentItem',
    'lmsd': '.fsConstituentItem',
    'd11':'.fsConstituentItem'
  };

  // Function to extract the domain name
  const extractDomainName = (url) => {
    const hostname = new URL(url).hostname;
    return hostname.split('.').slice(-2, -1)[0];
  };

  const domainName = extractDomainName(url);
  
  if (!schools[domainName]) {
    return new Response(JSON.stringify({ message: 'Domain not supported.' }), { status: 400 });
  }

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const staffData = await page.evaluate((schools, domainName) => {
      let staffData = [];
      const nameClasses = ['fsFullName', 'ws-dd-person-name'];
      const jobTitleClasses = ['fsTitles', 'ws-dd-person-position'];

      const findFirstMatch = (element, classArray) => {
        for (const className of classArray) {
          const found = element.querySelector(`.${className}`);
          if (found) return found.textContent.trim();
        }
        return null;
      };

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
      
      return staffData;
    }, schools, domainName);

    await browser.close();

    return new Response(JSON.stringify(staffData), { status: 200 });
  } catch (error) {
    console.error('Scraping failed:', error);
    return new Response(JSON.stringify({ message: 'Failed to scrape data.' }), { status: 500 });
  }
}
