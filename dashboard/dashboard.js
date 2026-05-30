let currentTab = 'all'
let allJobs = []

function getPortalLabel(site) {
  if (site === 'linkedin') return '<span class="portal-badge portal-linkedin">LinkedIn</span>'
  if (site === 'indeed')   return '<span class="portal-badge portal-indeed">Indeed</span>'
  if (site === 'naukri')   return '<span class="portal-badge portal-naukri">Naukri</span>'
  return '<span class="portal-badge portal-unknown">Other</span>'
}

function renderTable(jobs) {
  const tbody = document.getElementById('jobTableBody')
  const emptyState = document.getElementById('emptyState')

  if (jobs.length === 0) {
    emptyState.style.display = 'block'
    tbody.innerHTML = ''
    return
  }

  emptyState.style.display = 'none'

  tbody.innerHTML = jobs.map(job => `
    <tr>
      <td>${job.title}</td>
      <td>${job.company}</td>
      <td>${getPortalLabel(job.site)}</td>
      <td>
        <select class="status-select" data-id="${job.id}">
          <option ${job.status === 'Applied'   ? 'selected' : ''}>Applied</option>
          <option ${job.status === 'Interview' ? 'selected' : ''}>Interview</option>
          <option ${job.status === 'Offer'     ? 'selected' : ''}>Offer</option>
          <option ${job.status === 'Rejected'  ? 'selected' : ''}>Rejected</option>
        </select>
      </td>
      <td>${job.dateApplied}</td>
      <td><button class="delete-btn" data-id="${job.id}">🗑️</button></td>
    </tr>
  `).join('')

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteJob(Number(btn.dataset.id)))
  })

  document.querySelectorAll('.status-select').forEach(select => {
    select.addEventListener('change', () => updateStatus(Number(select.dataset.id), select.value))
  })
}

function loadJobs() {
  chrome.storage.local.get(['jobs'], (result) => {
    allJobs = result.jobs || []

    // Update stats (always based on ALL jobs)
    document.getElementById('totalCount').textContent = allJobs.length
    document.getElementById('interviewCount').textContent = allJobs.filter(j => j.status === 'Interview').length
    document.getElementById('offerCount').textContent = allJobs.filter(j => j.status === 'Offer').length
    document.getElementById('rejectedCount').textContent = allJobs.filter(j => j.status === 'Rejected').length

    // Update tab counts
    document.getElementById('count-all').textContent = allJobs.length
    document.getElementById('count-linkedin').textContent = allJobs.filter(j => j.site === 'linkedin').length
    document.getElementById('count-indeed').textContent = allJobs.filter(j => j.site === 'indeed').length
    document.getElementById('count-naukri').textContent = allJobs.filter(j => j.site === 'naukri').length

    // Filter by active tab
    const filtered = currentTab === 'all' ? allJobs : allJobs.filter(j => j.site === currentTab)
    renderTable(filtered)
  })
}

function updateStatus(id, newStatus) {
  chrome.storage.local.get(['jobs'], (result) => {
    const jobs = result.jobs || []
    const updated = jobs.map(job => job.id === id ? { ...job, status: newStatus } : job)
    chrome.storage.local.set({ jobs: updated }, loadJobs)
  })
}

function deleteJob(id) {
  chrome.storage.local.get(['jobs'], (result) => {
    const jobs = result.jobs || []
    const filtered = jobs.filter(job => job.id !== id)
    chrome.storage.local.set({ jobs: filtered }, loadJobs)
  })
}

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    currentTab = btn.dataset.tab
    const filtered = currentTab === 'all' ? allJobs : allJobs.filter(j => j.site === currentTab)
    renderTable(filtered)
  })
})

// Export CSV
document.getElementById('exportBtn').addEventListener('click', () => {
  if (allJobs.length === 0) return alert('No jobs to export!')
  const rows = [
    ['Job Title', 'Company', 'Portal', 'Status', 'Date Applied', 'URL'],
    ...allJobs.map(j => [j.title, j.company, j.site || 'unknown', j.status, j.dateApplied, j.url || ''])
  ]
  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'job-applications.csv'
  a.click()
  URL.revokeObjectURL(url)
})

loadJobs()