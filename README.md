# 🚀 BloomBox FY Recruitment Website (2026-27)
### *The Entrepreneurship Cell of KJSSE — First Year Council Recruitment*

> **"The BloomBox poster brought alive as an interactive, scroll-driven digital recruitment experience."**

An interactive, responsive recruitment web application built directly from the official **BloomBox FY Reps Recruitment** poster. Features comic-book halftone visuals, an interactive retro cash register with green LED matrix display, a spooled receipt with line-item benefits, a pop-art illustrated hand, smooth GSAP ScrollTrigger transitions, and an authentic receipt/bill recruitment form that submits to **Google Sheets** via **Google Apps Script** with a visceral rubber stamp confirmation and confetti celebration.

---

## 📑 Table of Contents
1. [Visual Aesthetic & Concept](#-visual-aesthetic--concept)
2. [Tech Stack](#-tech-stack)
3. [Folder Structure](#-folder-structure)
4. [Running Locally](#-running-locally)
5. [Form Fields Configuration](#-form-fields-configuration)
6. [Google Sheets Setup](#-google-sheets-setup)
7. [Google Apps Script Deployment](#-google-apps-script-deployment)
8. [Connecting Frontend to Backend](#-connecting-frontend-to-backend)
9. [Deploying to Vercel](#-deploying-to-vercel)
10. [Customizing Recruitment Content](#-customizing-recruitment-content)
11. [Customizing Colors & Typography](#-customizing-colors--typography)
12. [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🎨 Visual Aesthetic & Concept

The website transforms the physical recruitment poster into an immersive journey:
- **Hero / Poster Intro:** Arched 3D **BLOOMBOX** lettering with comic raster stripes, floating **REGISTRATIONS OPEN!** starburst badge, and institutional crests (Somaiya Vidyavihar University, BloomBox, IIC, Somaiya Trust).
- **The Central Piece:** A retro POS Cash Register featuring a glowing green dot-matrix LED ticker (`ONLY COOL PEOPLE REQUIRED` / `DUE DATE: 27TH SEPTEMBER`), with a paper receipt spooling from the slot held by a comic pop-art crosshatched hand.
- **Scroll Transition:** Smooth scroll down through comic book panels (*What is BloomBox*, *Why Join*, *What's Waiting For You*, and *Recruitment Details*).
- **The Grand Bill / Recruitment Form:** The receipt unrolls into a full-sized interactive paper bill with serrated edges, typewriter fonts, dashed inputs, barcode, and a 3D comic submit button (`CASH IN YOUR OPPORTUNITY`).
- **Confirmation State:** An animated retro red ink rubber stamp slams down onto the bill (`APPLICATION RECEIVED / REGISTERED`) accompanied by a burst of comic confetti and a printable receipt summary.

---

## 🛠 Tech Stack

- **HTML5:** Semantic, accessible markup with ARIA roles and labels.
- **CSS3:** Custom responsive layout, halftone dot matrices, paper textures, 3D text extrusions, and print stylesheets.
- **Vanilla JavaScript:** Zero framework bloat, dynamic form field rendering, and client-side validation.
- **GSAP 3 + ScrollTrigger:** High-performance parallax, sticker entrance, and receipt scroll animations.
- **Canvas Confetti:** Lightweight celebration particle effects.
- **Google Apps Script (`backend/Code.gs`):** Production-ready backend with CORS handling, lock synchronization to prevent race conditions, and automatic column creation in Google Sheets.

---

## 📂 Folder Structure

```
FY-Recruitment/
├── index.html                  # Main webpage structure & semantic layout
├── style.css                   # Complete design system, halftone textures, & responsive styles
├── script.js                   # Form engine, validation, GSAP animations, & API calls
├── README.md                   # Complete documentation & setup instructions
├── backend/
│   └── Code.gs                 # Google Apps Script for Google Sheets integration
└── assets/
    ├── logo/
    │   ├── bloombox-logo.png   # Official BloomBox logo
    │   ├── institutional-logos.svg
    │   └── favicon.svg
    ├── illustrations/
    │   ├── comic-burst.svg     # 'REGISTRATIONS OPEN!' starburst sticker
    │   ├── cash-register.svg   # Vintage POS terminal with LED bezel
    │   ├── hand-holding.svg    # Pop-art comic hand holding the receipt
    │   ├── barcode.svg         # Authentic retail barcode
    │   └── stamp-registered.svg# Gritty rubber ink stamp
    ├── textures/
    │   └── halftone-pattern.svg# Comic halftone dot pattern
    └── reference/              # Reference posters & graphics
```

---

## 💻 Running Locally

No build tools or Node.js required! You can open the project in any browser:

### Option 1: Live Server (VS Code / Cursor / IDE)
1. Open the `FY-Recruitment` folder in your IDE.
2. Right-click `index.html` and select **"Open with Live Server"** (or press `Alt + L, Alt + O`).
3. The site will open at `http://127.0.0.1:5500`.

### Option 2: Python HTTP Server
Run in your terminal:
```bash
# Python 3
python -m http.server 3000
```
Then visit `http://localhost:3000` in your browser.

---

## 📝 Form Fields Configuration

The recruitment form is generated dynamically from a single configuration object in `script.js`. 

To edit existing fields or add new ones (e.g. Portfolio link, Past Experience), open `script.js` and locate `CONFIG.formFields`:

```javascript
const CONFIG = {
  googleScriptUrl: "YOUR_GOOGLE_APPS_SCRIPT_URL",
  sheetName: "Registrations",

  formFields: [
    {
      id: "fullName",
      name: "fullName",
      label: "Full Name",
      type: "text",
      placeholder: "e.g. Aarav Mehta",
      required: true,
      validation: (val) => val.trim().length >= 2,
      errorMessage: "Please enter your full name (at least 2 characters)."
    },
    {
      id: "email",
      name: "email",
      label: "Somaiya Email ID",
      type: "email",
      placeholder: "e.g. aarav.m@somaiya.edu",
      required: true,
      validation: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
      errorMessage: "Please enter a valid Somaiya or college email address."
    },
    {
      id: "phone",
      name: "phone",
      label: "Contact Number",
      type: "tel",
      placeholder: "e.g. 9876543210",
      required: true,
      validation: (val) => val.replace(/[\s\-+()]/g, "").length >= 10,
      errorMessage: "Please enter a valid 10-digit mobile number."
    },
    {
      id: "year",
      name: "year",
      label: "Year",
      type: "select",
      options: [{ value: "FE", label: "FE - First Year Engineering" }],
      defaultValue: "FE",
      required: true
    },
    {
      id: "branch",
      name: "branch",
      label: "Branch",
      type: "select",
      placeholder: "-- Choose your Engineering Branch --",
      options: [
        "Computer Engineering",
        "Information Technology",
        "Artificial Intelligence & Data Science",
        "Electronics & Telecommunication",
        "Electronics and Computer Engineering",
        "Mechanical Engineering",
        "Computer Science and Business Systems",
        "Computer and Communication Engineering",
        "Robotics and Artificial Intelligence",
        "VLSI Design and Technology",
        "Civil Engineering"
      ],
      required: true
    }
  ]
};
```

---

## 📊 Google Sheets Setup

1. Open [Google Sheets](https://sheets.new) in your browser.
2. Name the spreadsheet: **"BloomBox FY Recruitment 2026-27"**.
3. Rename the first sheet tab at the bottom to: `Registrations`.
4. Add the following column headers in Row 1:
   | A | B | C | D | E | F | G | H |
   |---|---|---|---|---|---|---|---|
   | **Timestamp** | **Application ID** | **Full Name** | **Somaiya Email ID** | **Contact Number** | **Year** | **Branch** | **Status** |

*(Note: If you add more fields in `CONFIG.formFields`, `backend/Code.gs` will automatically create matching columns in Google Sheets on new submissions!)*

---

## ⚙️ Google Apps Script Deployment

1. Inside your Google Sheet, click **Extensions** > **Apps Script** in the top menu.
2. Delete any boilerplate code in the script editor.
3. Open `backend/Code.gs` from this project, copy its entire contents, and paste them into the Google Apps Script editor.
4. Set your Google Drive Folder:
   - At line 31 of `Code.gs`, paste your Google Drive Folder Link or Folder ID into `GOOGLE_DRIVE_FOLDER_LINK`:
     ```javascript
     const GOOGLE_DRIVE_FOLDER_LINK = "https://drive.google.com/drive/folders/YOUR_FOLDER_ID";
     ```
   - All uploaded PDF resumes will automatically be saved into this Drive folder (named as `[AppID]_[Student_Name]_Resume.pdf`).
   - The Google Sheet will stay clean with only student details (no PDF column).
5. *(Optional)* If the script was opened directly from the Sheet, `SPREADSHEET_ID = ""` will automatically bind to the sheet. Alternatively, copy the Spreadsheet ID from the browser URL:
   `https://docs.google.com/spreadsheets/d/`**`<YOUR_SPREADSHEET_ID>`**`/edit` and paste it into `SPREADSHEET_ID`.
6. Click the **Save** icon (diskette).
7. Click the blue **Deploy** button (top right) > **New deployment**.
8. Select type: **Web app** (gear icon).
9. Configure deployment settings:
   - **Description:** `BloomBox Recruitment API v1`
   - **Execute as:** `Me (your_email@gmail.com)`
   - **Who has access:** `Anyone` *(Crucial: allows applicants to submit the form without needing to sign into Google).*
10. Click **Deploy**.
11. Google will prompt you to **Authorize Access**:
    - Click **Review permissions**.
    - Select your Google account.
    - Click **Advanced** > **Go to Untitled project (unsafe)**.
    - Click **Allow**.
12. Copy the **Web App URL** provided (it looks like `https://script.google.com/macros/s/AKfycbx.../exec`).

---

## 🔗 Connecting Frontend to Backend

1. Open `script.js` in your editor.
2. In the `CONFIG` object at line 14, replace `YOUR_GOOGLE_APPS_SCRIPT_URL` with your copied Web App URL:
   ```javascript
   const CONFIG = {
     googleScriptUrl: "https://script.google.com/macros/s/AKfycbxYOUR_DEPLOYED_ID/exec",
     sheetName: "Registrations",
     // ...
   };
   ```
3. Save `script.js`. That's it! Every submission will now be appended as a new row in your Google Sheet with an Application ID, timestamp, and status.

> **💡 Demo Mode Note:** If you leave `CONFIG.googleScriptUrl` as `"YOUR_GOOGLE_APPS_SCRIPT_URL"`, the website automatically runs in **Demo Mode**. It simulates the entire network submission with realistic latency, prints the payload in the developer console, and demonstrates the animated rubber stamp and confirmation receipt without throwing errors.

---

## 🌐 Deploying to Vercel

The project is static (HTML, CSS, JS) and deploys to Vercel in seconds:

### Method 1: Using Vercel CLI
```bash
# Install vercel globally (if not already installed)
npm install -g vercel

# Deploy directly from the project directory
vercel
```

### Method 2: Via GitHub & Vercel Dashboard
1. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: BloomBox FY Recruitment site"
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```
2. Log into [Vercel](https://vercel.com).
3. Click **Add New** > **Project** and import your repository.
4. Keep the default settings (Framework Preset: *Other*) and click **Deploy**.
5. Your recruitment site is live with global CDN caching and free HTTPS!

---

## ✏️ Customizing Recruitment Content

All section text is clearly labeled with placeholders for easy modification:
- **Hero Title & Subtitle:** In `index.html`, search for `comic-title-3d` and `hero-subtext`.
- **"What is BloomBox":** Edit the cards inside section `#what-is-bloombox`.
- **"Job Description":** Modify the line items inside section `#job-description` or download `assets/docs/BloomBox_FY_Job_Description.pdf`.
- **Important Dates & Venue:** In `index.html`, edit `#recruitment-details` (e.g. `27TH SEPTEMBER`, `B-113`).
- **Submit Button Text:** In `index.html`, edit `#submit-btn-text` (`CASH IN YOUR OPPORTUNITY`).

---

## 🎨 Customizing Colors & Typography

The entire design system is controlled via CSS custom properties in `style.css` under `:root`:

```css
:root {
  --comic-cyan: #00c2cb;            /* Main cyan accent */
  --comic-yellow: #ffbe0b;          /* Starburst / sticker yellow */
  --comic-red: #d90429;             /* Stamp & CTA red */
  --comic-blue-dark: #03045e;       /* Deep comic shadows */
  --paper-cream: #faf6ea;           /* Authentic receipt background */
  --led-green-bright: #39ff14;      /* Cash register matrix LED */
}
```

Google Fonts are loaded in the `<head>` of `index.html`:
- `Bungee` / `Anton` for high-impact poster headings.
- `Courier Prime` for vintage typewriter receipt text.
- `VT323` for the cash register green dot-matrix screen.
- `Plus Jakarta Sans` for clean, accessible form inputs.

---

## ❓ Troubleshooting & FAQs

### Q1: The form says "The form got lost in transit."
- Verify that your Google Apps Script is deployed with **Who has access: "Anyone"**. If set to "Only myself", submissions from students will be blocked by Google.
- Check that the URL pasted in `script.js` ends with `/exec` and not `/dev`.
- If you made changes to `backend/Code.gs`, remember to create a **New deployment** (or update the version of the existing deployment) in Apps Script.

### Q2: How do I test the print receipt feature?
- After submitting the form, click **"🖨️ PRINT / SAVE RECEIPT"**.
- A custom print stylesheet (`@media print`) will automatically isolate the grand receipt, hiding the navigation bar and background textures for a crisp physical printout or PDF save.

### Q3: Does it work smoothly on mobile?
- Yes! The layout is optimized for 360px, 375px, 390px, 414px, and larger viewports.
- All form inputs, dropdowns, and buttons have minimum touch targets of 44px–60px.
- The receipt becomes full width on mobile devices to prevent any horizontal overflow.

---

**Made with ⚡ for BloomBox — E-Cell, KJSSE.**
