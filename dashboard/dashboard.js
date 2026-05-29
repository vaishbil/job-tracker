function loadJobs() {
  chrome.storage.local.get(['jobs'], (result) => {
    const jobs = result.jobs || []
    const tbody = document.getElementById('jobTableBody')
    const emptyState = document.getElementById('emptyState')

    document.getElementById('totalCount').textContent = jobs.length
    document.getElementById('interviewCount').textContent = jobs.filter(j => j.status === 'Interview').length
    document.getElementById('offerCount').textContent = jobs.filter(j => j.status === 'Offer').length
    document.getElementById('rejectedCount').textContent = jobs.filter(j => j.status === 'Rejected').length

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

// Export to CSV
document.getElementById('exportBtn').addEventListener('click', () => {
  chrome.storage.local.get(['jobs'], (result) => {
    const jobs = result.jobs || []
    if (jobs.length === 0) return alert('No jobs to export!')

    const rows = [
      ['Job Title', 'Company', 'Status', 'Date Applied', 'URL'],
      ...jobs.map(j => [j.title, j.company, j.status, j.dateApplied, j.url || ''])
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
})

loadJobs()