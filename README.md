# Job Tracker — Chrome Extension
 
A Chrome extension that auto-detects job listings and lets you track all your applications in one dashboard.
 
---
 
## Features
 
- **Auto-scrape** — Reads job title and company from the page automatically
- **One-click save** — Save any job from the popup without typing
- **Dashboard** — View all applications with status tracking and stats
- **Portal tabs** — Filter by LinkedIn, Indeed, or Naukri
- **Stats page** — Track applications by day, week, and month
- **Notes** — Add personal notes to each application
- **Export CSV** — Download all applications as a spreadsheet
---

## 🌐 Supported Job Sites

- [LinkedIn](https://linkedin.com)
- [Naukri](https://naukri.com)
- [Indeed](https://indeed.com)

---

## 🛠️ Installation 

Since this extension is not yet on the Chrome Web Store, you can install it manually:

1. Clone or download this repository
   ```bash
   git clone https://github.com/vaishbil/job-tracker.git
   ```
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer Mode** (toggle in the top right)
4. Click **Load Unpacked**
5. Select the `job-tracker` folder
6. The extension icon will appear in your toolbar 

---

## 📁 Project Structure

```
job-tracker/
├── manifest.json          # Extension configuration (Manifest V3)
├── background.js          # Service worker for alarms & notifications
├── content.js             # Runs on LinkedIn, Indeed, Naukri pages
├── popup/
│   ├── popup.html         # Extension popup UI
│   └── popup.js           # Popup logic
├── dashboard/
│   ├── dashboard.html     # Full dashboard page
│   └── dashboard.js       # Dashboard logic
└── icons/                 # Extension icons
```
---

## 🚀 How to Use

1. Visit a job listing on LinkedIn, Indeed, or Naukri
2. Click the **Job Tracker** icon in your Chrome toolbar
3. Save the job with its details
4. Open the **Dashboard** to view and manage all your saved applications

---

## Tech Stack
 
- Chrome Extension API (Manifest V3)
- Vanilla JavaScript
- Chrome Storage API
- Chrome Scripting API
- JSON-LD + document.title parsing for scraping
---

> 🚧 **Work in Progress** — This project is actively being developed. Features may change!

---

## Author

Made by [vaishbil](https://github.com/vaishbil)