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

function renderStats(jobs) {
  const now = new Date()
  const todayStr = now.toLocaleDateString()

  // Month name
  const monthName = now.toLocaleString('default', { month: 'long' })
  document.getElementById('s-thisMonthLabel').textContent = monthName + ' ' + now.getFullYear()
  document.getElementById('s-todayDate').textContent = todayStr

  // This month
  const thisMonth = jobs.filter(j => {
    const d = new Date(j.dateApplied)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
  document.getElementById('s-thisMonth').textContent = thisMonth

  // This week (last 7 days)
  const weekAgo = new Date(now)
  weekAgo.setDate(now.getDate() - 7)
  const thisWeek = jobs.filter(j => new Date(j.dateApplied) >= weekAgo).length
  document.getElementById('s-thisWeek').textContent = thisWeek

  // Today
  const today = jobs.filter(j => j.dateApplied === todayStr).length
  document.getElementById('s-today').textContent = today

  // Status breakdown bars
  const total = jobs.length || 1
  const nApplied   = jobs.filter(j => j.status === 'Applied').length
  const nInterview = jobs.filter(j => j.status === 'Interview').length
  const nOffer     = jobs.filter(j => j.status === 'Offer').length
  const nRejected  = jobs.filter(j => j.status === 'Rejected').length

  document.getElementById('n-applied').textContent   = nApplied
  document.getElementById('n-interview').textContent = nInterview
  document.getElementById('n-offer').textContent     = nOffer
  document.getElementById('n-rejected').textContent  = nRejected

  document.getElementById('bar-applied').style.width   = (nApplied   / total * 100) + '%'
  document.getElementById('bar-interview').style.width = (nInterview / total * 100) + '%'
  document.getElementById('bar-offer').style.width     = (nOffer     / total * 100) + '%'
  document.getElementById('bar-rejected').style.width  = (nRejected  / total * 100) + '%'

  // Portal breakdown bars
  const nLinkedIn = jobs.filter(j => j.site === 'linkedin').length
  const nIndeed   = jobs.filter(j => j.site === 'indeed').length
  const nNaukri   = jobs.filter(j => j.site === 'naukri').length

  document.getElementById('n-linkedin-pct').textContent = 'LinkedIn ' + nLinkedIn
  document.getElementById('n-indeed-pct').textContent   = 'Indeed ' + nIndeed
  document.getElementById('n-naukri-pct').textContent   = 'Naukri ' + nNaukri

  document.getElementById('bar-linkedin').style.width  = (nLinkedIn / total * 100) + '%'
  document.getElementById('bar-indeed-s').style.width  = (nIndeed   / total * 100) + '%'
  document.getElementById('bar-naukri-s').style.width  = (nNaukri   / total * 100) + '%'

  // Recent 5 jobs
  const recent = [...jobs].reverse().slice(0, 5)
  document.getElementById('recentList').innerHTML = recent.map(j => `
    <li>
      <div>${j.title}</div>
      <div class="recent-company">${j.company} · ${getPortalLabel(j.site)} · ${j.dateApplied}</div>
    </li>
  `).join('')
}

function loadJobs() {
  chrome.storage.local.get(['jobs'], (result) => {
    allJobs = result.jobs || []

    document.getElementById('totalCount').textContent     = allJobs.length
    document.getElementById('interviewCount').textContent = allJobs.filter(j => j.status === 'Interview').length
    document.getElementById('offerCount').textContent     = allJobs.filter(j => j.status === 'Offer').length
    document.getElementById('rejectedCount').textContent  = allJobs.filter(j => j.status === 'Rejected').length

    document.getElementById('count-all').textContent      = allJobs.length
    document.getElementById('count-linkedin').textContent = allJobs.filter(j => j.site === 'linkedin').length
    document.getElementById('count-indeed').textContent   = allJobs.filter(j => j.site === 'indeed').length
    document.getElementById('count-naukri').textContent   = allJobs.filter(j => j.site === 'naukri').length

    if (currentTab === 'stats') {
      renderStats(allJobs)
    } else {
      const filtered = currentTab === 'all' ? allJobs : allJobs.filter(j => j.site === currentTab)
      renderTable(filtered)
    }
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

    if (currentTab === 'stats') {
      document.getElementById('jobsPage').style.display = 'none'
      document.getElementById('statsPage').style.display = 'block'
      renderStats(allJobs)
    } else {
      document.getElementById('jobsPage').style.display = 'block'
      document.getElementById('statsPage').style.display = 'none'
      const filtered = currentTab === 'all' ? allJobs : allJobs.filter(j => j.site === currentTab)
      renderTable(filtered)
    }
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