let lastJobId = ''

// Detect which site we're on
function getSite() {
  const host = window.location.hostname
  if (host.includes('linkedin.com')) return 'linkedin'
  if (host.includes('indeed.com')) return 'indeed'
  if (host.includes('naukri.com')) return 'naukri'
  return null
}

// Get job ID from URL depending on site
function getJobIdFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const site = getSite()

  if (site === 'linkedin') return params.get('currentJobId') || ''
  if (site === 'indeed') return params.get('vjk') || ''
  if (site === 'naukri') {
    // Naukri job pages have a long slug URL like /job-listings-title-company-...
    const path = window.location.pathname
    if (path.includes('/job-listings-')) return path
    return ''
  }
  return ''
}

function scrapeJob() {
  let title = ''
  let company = ''
  const site = getSite()

  // STRATEGY 1 — JSON-LD (works on all sites that embed it)
  try {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]')
    for (const script of scripts) {
      const data = JSON.parse(script.innerText)
      if (data['@type'] === 'JobPosting') {
        title = data.title || ''
        company = data.hiringOrganization?.name || ''
        if (title || company) break
      }
    }
  } catch (e) {}

  // STRATEGY 2 — Site specific DOM selectors
  if (!title || !company) {
    if (site === 'linkedin') {
      // LinkedIn job view links
      if (!title) {
        const jobLinks = document.querySelectorAll('a[href*="/jobs/view/"]')
        for (const link of jobLinks) {
          const text = link.innerText.trim()
          if (text.length > 2 && text.length < 100 && !text.includes('\n')) {
            title = text
            break
          }
        }
      }
      if (!company) {
        const companyLinks = document.querySelectorAll('a[href*="/company/"]')
        for (const link of companyLinks) {
          const text = link.innerText.trim()
          if (text.length > 1 && text.length < 50 && !text.includes('\n')) {
            company = text
            break
          }
        }
      }
    }

    if (site === 'indeed') {
      // Indeed job title is in h1 inside the job panel
      if (!title) {
        const h1 = document.querySelector('h1.jobsearch-JobInfoHeader-title, h1[class*="jobTitle"], h1')
        if (h1) title = h1.innerText.trim().split('\n')[0]
      }
      // Indeed company name
      if (!company) {
        const companyEl = document.querySelector('[data-company-name], [class*="companyName"], a[data-tn-element="companyName"]')
        if (companyEl) company = companyEl.innerText.trim()
      }
    }

    if (site === 'naukri') {
      // Naukri job title
      if (!title) {
        const h1 = document.querySelector('h1.styles_jd-header-title__rZwM1, h1[class*="title"], h1')
        if (h1) title = h1.innerText.trim()
      }
      // Naukri company name
      if (!company) {
        const companyEl = document.querySelector('a.styles_comp-name__PXZZo, [class*="comp-name"], a[class*="company"]')
        if (companyEl) company = companyEl.innerText.trim()
      }
    }
  }

  // STRATEGY 3 — document.title fallback (works everywhere)
  if (!title || !company) {
    const t = document.title

    // LinkedIn: "Frontend Developer at Google | LinkedIn"
    if (site === 'linkedin' && t.includes(' at ')) {
      const cleaned = t.replace(/\s*\|.*$/i, '').trim()
      const parts = cleaned.split(' at ')
      if (!title) title = parts[0]?.trim() || ''
      if (!company) company = parts[parts.length - 1]?.trim() || ''
    }

    // Indeed: "Junior Java Developer - Appex Innovation - Indeed"
    if (site === 'indeed' && t.includes(' - ')) {
      const parts = t.split(' - ')
      if (!title) title = parts[0]?.trim() || ''
      if (!company) company = parts[1]?.trim() || ''
    }

    // Naukri: "Software Developer Trainee - Liangtuang Technologies - Naukri.com"
    if (site === 'naukri' && t.includes(' - ')) {
      const parts = t.split(' - ')
      if (!title) title = parts[0]?.trim() || ''
      if (!company) company = parts[1]?.trim() || ''
    }
  }

  if (title || company) {
    chrome.storage.local.set({
      scrapedJob: { title, company, url: window.location.href, site }
    })
    console.log(`Job Tracker ✅ [${site}]`, title, 'at', company)
    return true
  }

  return false
}

function scrapeWithRetry() {
  let attempts = 0
  const timer = setInterval(() => {
    attempts++
    const found = scrapeJob()
    if (found || attempts >= 20) clearInterval(timer)
  }, 500)
}

// Poll URL every 500ms
setInterval(() => {
  const jobId = getJobIdFromUrl()
  if (jobId && jobId !== lastJobId) {
    lastJobId = jobId
    console.log('Job Tracker: new job detected')
    scrapeWithRetry()
  }
}, 500)

// Run on first load
const firstJobId = getJobIdFromUrl()
if (firstJobId) {
  lastJobId = firstJobId
  scrapeWithRetry()
}