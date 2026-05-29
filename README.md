# 🗂️ Job Tracker — Chrome Extension

A Chrome extension to track your job applications directly from your browser — no more spreadsheets or forgetting where you applied!

---

## ✨ Features

- 📋 **Track applications** — Save job applications while browsing
- 🔔 **Notifications & reminders** — Get alerted to follow up on applications
- 📊 **Dashboard** — View all your applications in one place
- 🤝 **Auto-detect job sites** — Works seamlessly on LinkedIn, Indeed, and Naukri

---

## 🌐 Supported Job Sites

- [LinkedIn](https://linkedin.com)
- [Naukri](https://naukri.com)

---

## 🛠️ Installation (Load Unpacked)

Since this extension is not yet on the Chrome Web Store, you can install it manually:

1. Clone or download this repository
   ```bash
   git clone https://github.com/vaishbil/job-tracker.git
   ```
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer Mode** (toggle in the top right)
4. Click **Load Unpacked**
5. Select the `job-tracker` folder
6. The extension icon will appear in your toolbar ✅

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

## 🔧 Tech Stack

- **Manifest V3** — Latest Chrome Extension standard
- **Vanilla JavaScript** — No frameworks
- **Chrome Storage API** — For saving application data locally
- **Chrome Alarms & Notifications API** — For follow-up reminders

---

## 👩‍💻 Author

Made by [vaishbil](https://github.com/vaishbil)