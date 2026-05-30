// Read scraped job from storage with retries
function loadScrapedJob(attempts = 0) {
  chrome.storage.local.get(['scrapedJob'], (result) => {
    if (result.scrapedJob) {
      const { title, company, url, site } = result.scrapedJob
      document.getElementById('jobTitle').value = title || ''
      document.getElementById('company').value = company || ''
      document.getElementById('jobTitle').dataset.url = url || ''
      document.getElementById('jobTitle').dataset.site = site || ''
      chrome.storage.local.remove('scrapedJob')
    } else if (attempts < 10) {
      setTimeout(() => loadScrapedJob(attempts + 1), 300)
    }
  })
}

loadScrapedJob()

// Save Job
document.getElementById('saveBtn').addEventListener('click', () => {
  const jobTitle = document.getElementById('jobTitle').value.trim()
  const company = document.getElementById('company').value.trim()
  const status = document.getElementById('status').value
  const message = document.getElementById('message')
  const url = document.getElementById('jobTitle').dataset.url || ''
  const site = document.getElementById('jobTitle').dataset.site || ''

  if (!jobTitle || !company) {
    message.style.color = '#f87171'
    message.textContent = 'Please fill in both fields!'
    return
  }

  const newJob = {
    id: Date.now(),
    title: jobTitle,
    company: company,
    status: status,
    dateApplied: new Date().toLocaleDateString(),
    url: url,
    site: site
  }

  chrome.storage.local.get(['jobs'], (result) => {
    const existingJobs = result.jobs || []
    existingJobs.push(newJob)
    chrome.storage.local.set({ jobs: existingJobs }, () => {
      message.style.color = '#4ade80'
      message.textContent = '✅ Job saved successfully!'
      document.getElementById('jobTitle').value = ''
      document.getElementById('company').value = ''
    })
  })
})

// Dashboard
document.getElementById('dashboardBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('../dashboard/dashboard.html') })
})