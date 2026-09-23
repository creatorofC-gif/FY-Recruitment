/**
 * ==============================================================================
 * BLOOMBOX FY RECRUITMENT 2026-27 | CLIENT SCRIPT
 * Interactive Comic Poster, Dynamic Receipt Form, & GSAP Animations
 * ==============================================================================
 */

// ==============================================================================
// 1. CONFIGURATION
// ==============================================================================
const ENV = window.ENV || {};

const CONFIG = {
  // Google Apps Script Web App URL from env.js / Vercel Environment Variables
  googleScriptUrl:
    ENV.GOOGLE_APPS_SCRIPT_URL ||
    "https://script.google.com/a/macros/somaiya.edu/s/AKfycbzH7XKf1CpiR7oJaJO7f0CLKIOKSlA5b7PegQB3O1nyrT1Gt7vJ4U1rKXV7qb2hLJtg8g/exec",
  sheetName: ENV.SHEET_NAME || "Registrations",
  spreadsheetId: ENV.SPREADSHEET_ID || "",
  googleDriveFolderLink: ENV.GOOGLE_DRIVE_FOLDER_LINK || "",
  templateDownloadUrl:
    ENV.TEMPLATE_DOWNLOAD_URL ||
    "https://drive.google.com/file/d/1CduZsoCi3-rLxUYmu-p9im5kQkzUJjHv/view?usp=sharing",
  jobDescriptionUrl:
    ENV.JOB_DESCRIPTION_URL ||
    "https://drive.google.com/file/d/1VBnrb0XzE63MFTMkqZ7oa2tfcV9OA-jW/view?usp=sharing",

  // Form Fields Configuration
  // Easy to add, modify, or reorder recruitment fields
  formFields: [
    {
      id: "fullName",
      name: "fullName",
      label: "Full Name",
      type: "text",
      placeholder: "Your Name",
      required: true,
      validation: (val) => val.trim().length >= 2,
      errorMessage: "Please enter your full name (at least 2 characters)."
    },
    {
      id: "email",
      name: "email",
      label: "Somaiya Email ID",
      type: "email",
      placeholder: "Your Somaiya ID",
      required: true,
      validation: (val) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(val.trim());
      },
      errorMessage: "Please enter a valid Somaiya or college email address."
    },
    {
      id: "phone",
      name: "phone",
      label: "Contact Number",
      type: "tel",
      placeholder: "Your Contact Number",
      required: true,
      validation: (val) => {
        const cleaned = val.replace(/[\s\-+()]/g, "");
        return cleaned.length >= 10 && cleaned.length <= 15;
      },
      errorMessage: "Please enter a valid 10-digit mobile number."
    },
    {
      id: "year",
      name: "year",
      label: "Year",
      type: "select",
      options: [
        { value: "FE", label: "FE - First Year Engineering" }
      ],
      defaultValue: "FE",
      required: true,
      validation: (val) => val && val.trim() !== "",
      errorMessage: "Please select your academic year."
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
      required: true,
      validation: (val) => val && val.trim() !== "",
      errorMessage: "Please select your engineering branch."
    },
    {
      id: "resume",
      name: "resume",
      label: "Resume (PDF Format)",
      type: "file",
      accept: ".pdf,application/pdf",
      required: true,
      validation: (val, file) => {
        if (!file) return false;
        const isPdf = file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf";
        const isUnderLimit = file.size <= 10 * 1024 * 1024; // 10MB limit
        return isPdf && isUnderLimit;
      },
      errorMessage: "Please upload your resume in PDF format (under 10MB)."
    }
  ]
};

// ==============================================================================
// 2. DOM CONTENT LOADED & INITIALIZATION
// ==============================================================================
function getDirectDownloadUrl(url) {
  if (!url) return "";
  const cleanUrl = url.replace(/^["']|["']$/g, "").trim();
  // Transform Google Drive share / view link into direct file download stream
  const gDriveMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (gDriveMatch && gDriveMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${gDriveMatch[1]}`;
  }
  return cleanUrl;
}

async function loadEnvConfig() {
  try {
    const res = await fetch(".env");
    if (res.ok) {
      const text = await res.text();
      text.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const idx = trimmed.indexOf("=");
          const key = trimmed.substring(0, idx).trim();
          const val = trimmed.substring(idx + 1).trim();
          if (key === "GOOGLE_APPS_SCRIPT_URL" && val) CONFIG.googleScriptUrl = val;
          if (key === "SPREADSHEET_ID" && val) CONFIG.spreadsheetId = val;
          if (key === "GOOGLE_DRIVE_FOLDER_LINK" && val) CONFIG.googleDriveFolderLink = val;
          if (key === "SHEET_NAME" && val) CONFIG.sheetName = val;
          if (key === "TEMPLATE_DOWNLOAD_URL" && val) CONFIG.templateDownloadUrl = val.replace(/^["']|["']$/g, "").trim();
          if (key === "JOB_DESCRIPTION_URL" && val) CONFIG.jobDescriptionUrl = val.replace(/^["']|["']$/g, "").trim();
        }
      });
    }
  } catch (e) {
    // Fallback to window.ENV if .env is not fetchable
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Load environment from .env
  await loadEnvConfig();

  // Dynamically update Section 4 Job Description download button link
  const jdBtn = document.getElementById("btn-download-jd");
  if (jdBtn && CONFIG.jobDescriptionUrl) {
    jdBtn.href = getDirectDownloadUrl(CONFIG.jobDescriptionUrl);
  }

  // Generate dynamic Application Number and set Timestamps
  initReceiptHeader();

  // Render Dynamic Form Fields based on CONFIG
  renderFormFields();

  // Initialize GSAP & ScrollTrigger Animations
  initAnimations();

  // Attach Form Event Handlers
  initFormHandlers();
});

// ==============================================================================
// 3. RECEIPT HEADER TIMESTAMPS & APPLICATION NUMBER
// ==============================================================================
let currentAppId = "";

function initReceiptHeader() {
  const dateEl = document.getElementById("bill-current-date");
  const timeEl = document.getElementById("bill-current-time");
  const appNumEl = document.getElementById("bill-app-number");

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  const timeStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }) + " IST";

  if (dateEl) dateEl.textContent = dateStr;
  if (timeEl) timeEl.textContent = timeStr;

  // Generate unique Application ID
  currentAppId = "BB-FY26-" + Math.floor(1000 + Math.random() * 9000);
  if (appNumEl) appNumEl.textContent = currentAppId;
}

// ==============================================================================
// 4. DYNAMIC FORM GENERATOR
// ==============================================================================
function renderFormFields() {
  const container = document.getElementById("dynamic-form-fields");
  if (!container) return;

  container.innerHTML = "";

  CONFIG.formFields.forEach((field, index) => {
    const itemCode = `[FIELD_0${index + 1}]`;
    const group = document.createElement("div");
    group.className = "form-field-group";
    group.dataset.fieldId = field.id;

    // Label row
    const labelRow = document.createElement("div");
    labelRow.className = "field-label-row";

    const label = document.createElement("label");
    label.className = "field-label";
    label.htmlFor = `input-${field.id}`;
    label.innerHTML = `${field.label} ${field.required ? '<span class="field-required-star" aria-hidden="true">*</span>' : ''}`;

    const codeSpan = document.createElement("span");
    codeSpan.className = "field-item-code";
    codeSpan.textContent = itemCode;

    labelRow.appendChild(label);
    labelRow.appendChild(codeSpan);
    group.appendChild(labelRow);

    // Input Control based on type
    if (field.type === "select") {
      const wrapper = document.createElement("div");
      wrapper.className = "form-select-wrapper";

      const select = document.createElement("select");
      select.id = `input-${field.id}`;
      select.name = field.name;
      select.className = "form-select-ctrl";
      select.required = !!field.required;
      select.setAttribute("aria-required", field.required ? "true" : "false");

      if (field.placeholder) {
        const defaultOpt = document.createElement("option");
        defaultOpt.value = "";
        defaultOpt.textContent = field.placeholder;
        defaultOpt.disabled = true;
        defaultOpt.selected = !field.defaultValue;
        select.appendChild(defaultOpt);
      }

      field.options.forEach((opt) => {
        const optionEl = document.createElement("option");
        if (typeof opt === "object") {
          optionEl.value = opt.value;
          optionEl.textContent = opt.label;
          if (field.defaultValue && opt.value === field.defaultValue) {
            optionEl.selected = true;
          }
        } else {
          optionEl.value = opt;
          optionEl.textContent = opt;
          if (field.defaultValue && opt === field.defaultValue) {
            optionEl.selected = true;
          }
        }
        select.appendChild(optionEl);
      });

      const arrow = document.createElement("span");
      arrow.className = "select-dropdown-arrow";
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = "▼";

      wrapper.appendChild(select);
      wrapper.appendChild(arrow);
      group.appendChild(wrapper);

    } else if (field.type === "file") {
      // Official Resume Template Download Button (OVER / ABOVE upload dropzone)
      const helperBar = document.createElement("div");
      helperBar.className = "resume-helper-bar";
      helperBar.innerHTML = `
        <div class="resume-helper-header">
          <span class="helper-hint-badge">OFFICIAL FORMAT</span>
          <span class="helper-hint-text">Download the official format before uploading:</span>
        </div>
        <div class="resume-helper-actions">
          <a href="${getDirectDownloadUrl(CONFIG.templateDownloadUrl)}" 
             target="_blank" 
             rel="noopener noreferrer" 
             class="comic-download-btn resume-template-btn" 
             title="Download official BloomBox Resume Template (PDF)">
            <span class="btn-icon">📑</span>
            <span class="btn-text">
              <span class="btn-label">DOWNLOAD RESUME TEMPLATE</span>
              <span class="btn-subtext">OFFICIAL COUNCIL FORMAT (.PDF) ↓</span>
            </span>
          </a>
        </div>
      `;
      group.appendChild(helperBar);

      // Upload Resume Dropzone (BELOW download template button)
      const dropzone = document.createElement("div");
      dropzone.className = "form-file-dropzone";
      dropzone.id = `dropzone-${field.id}`;
      dropzone.tabIndex = 0;
      dropzone.setAttribute("role", "button");
      dropzone.setAttribute("aria-label", "Upload your resume in PDF format");

      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.id = `input-${field.id}`;
      fileInput.name = field.name;
      fileInput.accept = field.accept || ".pdf,application/pdf";
      fileInput.className = "form-file-input-hidden";
      fileInput.required = !!field.required;
      fileInput.setAttribute("aria-required", field.required ? "true" : "false");

      dropzone.innerHTML = `
        <div class="dropzone-content">
          <span class="dropzone-icon" aria-hidden="true">📄</span>
          <div class="dropzone-info">
            <span class="dropzone-title" id="filename-${field.id}">Click or Drag &amp; Drop Resume (PDF)</span>
            <span class="dropzone-sub">Max file size: 10MB • Format: .pdf</span>
          </div>
          <span class="dropzone-browse-btn" aria-hidden="true">BROWSE</span>
        </div>
      `;

      dropzone.appendChild(fileInput);
      group.appendChild(dropzone);

      // Click to open file picker
      dropzone.addEventListener("click", () => fileInput.click());
      dropzone.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          fileInput.click();
        }
      });

      // Drag & Drop
      ["dragenter", "dragover"].forEach((evt) => {
        dropzone.addEventListener(evt, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.add("dragover");
        });
      });

      ["dragleave", "drop"].forEach((evt) => {
        dropzone.addEventListener(evt, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.remove("dragover");
        });
      });

      dropzone.addEventListener("drop", (e) => {
        const dt = e.dataTransfer;
        if (dt && dt.files && dt.files.length > 0) {
          fileInput.files = dt.files;
          fileInput.dispatchEvent(new Event("change"));
        }
      });

      // File selection change
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        const titleEl = document.getElementById(`filename-${field.id}`);
        if (file) {
          const isPdf = file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf";
          if (!isPdf) {
            group.classList.add("has-error");
            if (titleEl) titleEl.textContent = "❌ Please select a PDF file (.pdf)";
            fileInput.value = "";
            dropzone.classList.remove("file-selected");
            return;
          }
          if (file.size > 10 * 1024 * 1024) {
            group.classList.add("has-error");
            if (titleEl) titleEl.textContent = "❌ PDF too large! Must be under 10MB.";
            fileInput.value = "";
            dropzone.classList.remove("file-selected");
            return;
          }
          const sizeKb = Math.round(file.size / 1024);
          const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
          if (titleEl) titleEl.innerHTML = `📄 <strong>${file.name}</strong> (${sizeStr})`;
          dropzone.classList.add("file-selected");
          group.classList.remove("has-error");
        } else {
          dropzone.classList.remove("file-selected");
          if (titleEl) titleEl.textContent = "Click or Drag & Drop Resume (PDF)";
        }
      });

    } else {
      const input = document.createElement("input");
      input.type = field.type || "text";
      input.id = `input-${field.id}`;
      input.name = field.name;
      input.className = "form-input-ctrl";
      input.placeholder = field.placeholder || "";
      input.required = !!field.required;
      input.setAttribute("aria-required", field.required ? "true" : "false");
      group.appendChild(input);
    }

    // Inline Error Message Bubble
    const errorBubble = document.createElement("div");
    errorBubble.className = "field-error-bubble";
    errorBubble.id = `error-${field.id}`;
    errorBubble.role = "alert";
    errorBubble.textContent = field.errorMessage || "Please fill this field correctly.";
    group.appendChild(errorBubble);

    container.appendChild(group);
  });
}

// ==============================================================================
// 5. FORM VALIDATION & SUBMISSION
// ==============================================================================
function initFormHandlers() {
  const form = document.getElementById("bloombox-recruitment-form");
  const submitBtn = document.getElementById("submit-btn");
  const submitBtnText = document.getElementById("submit-btn-text");
  const errorBanner = document.getElementById("form-error-banner");
  const printBtn = document.getElementById("print-receipt-btn");
  const newAppBtn = document.getElementById("new-app-btn");

  if (!form) return;

  // Real-time error dismissal on input
  form.addEventListener("input", (e) => {
    const group = e.target.closest(".form-field-group");
    if (group && group.classList.contains("has-error")) {
      const fieldId = group.dataset.fieldId;
      const configItem = CONFIG.formFields.find((f) => f.id === fieldId);
      if (configItem && configItem.validation) {
        if (configItem.validation(e.target.value)) {
          group.classList.remove("has-error");
        }
      } else {
        group.classList.remove("has-error");
      }
    }
  });

  form.addEventListener("change", (e) => {
    const group = e.target.closest(".form-field-group");
    if (group && group.classList.contains("has-error")) {
      group.classList.remove("has-error");
    }
  });

  // Form Submit Event
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Reset banner
    if (errorBanner) errorBanner.style.display = "none";

    // 1. Validate All Fields
    let isValid = true;
    let firstInvalidElement = null;
    const formData = {
      appId: currentAppId,
      timestamp: new Date().toISOString()
    };

    CONFIG.formFields.forEach((field) => {
      const inputEl = document.getElementById(`input-${field.id}`);
      const groupEl = inputEl ? inputEl.closest(".form-field-group") : null;
      if (!inputEl || !groupEl) return;

      let fieldValid = true;

      if (field.type === "file") {
        const file = inputEl.files && inputEl.files[0];
        if (field.required && !file) {
          fieldValid = false;
        } else if (file && field.validation && !field.validation("", file)) {
          fieldValid = false;
        }
        if (file) {
          formData.resumeFileName = file.name;
          formData.resumeFileSize = file.size;
        }
      } else {
        const value = inputEl.value;
        formData[field.name] = value;

        if (field.required && (!value || value.trim() === "")) {
          fieldValid = false;
        } else if (field.validation && !field.validation(value)) {
          fieldValid = false;
        }
      }

      if (!fieldValid) {
        groupEl.classList.add("has-error");
        isValid = false;
        if (!firstInvalidElement) firstInvalidElement = inputEl;
      } else {
        groupEl.classList.remove("has-error");
      }
    });

    // If validation fails
    if (!isValid) {
      if (errorBanner) {
        errorBanner.style.display = "flex";
        errorBanner.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      if (firstInvalidElement) {
        firstInvalidElement.focus();
      }
      return;
    }

    // Convert Resume File to Base64 before sending
    const resumeInput = document.getElementById("input-resume");
    if (resumeInput && resumeInput.files && resumeInput.files[0]) {
      const file = resumeInput.files[0];
      try {
        formData.resumeBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => resolve("");
          reader.readAsDataURL(file);
        });
      } catch (fErr) {
        console.warn("Could not read resume as base64:", fErr);
      }
    }

    // 2. Transition to SUBMITTING State
    submitBtn.disabled = true;
    submitBtnText.textContent = "PRINTING YOUR APPLICATION...";
    const originalSubtext = submitBtn.querySelector(".btn-subtext");
    if (originalSubtext) originalSubtext.textContent = "COMMUNICATING WITH THE COUNCIL...";

    try {
      // 3. Send Data to Google Apps Script
      let responseSuccess = false;
      let responseMessage = "";

      // Check if user has configured an actual Google Apps Script URL
      const isPlaceholderUrl =
        !CONFIG.googleScriptUrl ||
        CONFIG.googleScriptUrl === "YOUR_GOOGLE_APPS_SCRIPT_URL" ||
        CONFIG.googleScriptUrl.trim() === "";

      if (isPlaceholderUrl) {
        // DEMO / TESTING MODE:
        // Gracefully simulate network request so the client can immediately preview
        // the full comic stamp, receipt generation, and confirmation animation!
        console.info(
          "%c[BloomBox Recruitment]%c Form submitted successfully in Demo Mode! (Replace CONFIG.googleScriptUrl in script.js with your deployed Apps Script URL)",
          "background:#0077b6; color:#fff; font-weight:bold; padding:2px 5px;",
          "color:#000;"
        );
        console.table(formData);

        // Realistic network delay
        await new Promise((resolve) => setTimeout(resolve, 1100));
        responseSuccess = true;
        responseMessage = "Application successfully submitted!";
      } else {
        // PRODUCTION MODE:
        // Send JSON directly (with text/plain to avoid preflight issues and prevent base64 truncation)
        const jsonPayload = JSON.stringify(formData);
        try {
          const response = await fetch(CONFIG.googleScriptUrl, {
            method: "POST",
            headers: {
              "Content-Type": "text/plain;charset=utf-8"
            },
            body: jsonPayload
          });

          if (response.ok) {
            const resData = await response.json();
            responseSuccess = resData.success !== false;
            responseMessage = resData.message || "Registration completed!";
          } else {
            throw new Error(`Status: ${response.status}`);
          }
        } catch (fetchErr) {
          // Google Apps Script redirects across origins on POST.
          // Fallback to mode: "no-cors" ensures Google Apps Script receives the full JSON payload
          await fetch(CONFIG.googleScriptUrl, {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "text/plain;charset=utf-8"
            },
            body: jsonPayload
          });
          responseSuccess = true;
          responseMessage = "Application successfully submitted!";
        }
      }

      if (responseSuccess) {
        // Trigger Success Celebration State
        showSuccessState(formData);
      } else {
        throw new Error(responseMessage || "Submission rejected by server.");
      }

    } catch (err) {
      console.error("[BloomBox Submission Error]", err);
      // Re-enable form on error
      submitBtn.disabled = false;
      submitBtnText.textContent = "CASH IN YOUR OPPORTUNITY";
      if (originalSubtext) originalSubtext.textContent = "SUBMIT APPLICATION TO THE COUNCIL →";

      if (errorBanner) {
        const bannerText = document.getElementById("form-error-text");
        if (bannerText) {
          bannerText.textContent = "THE FORM GOT LOST IN TRANSIT. Please check your connection and retry.";
        }
        errorBanner.style.display = "flex";
        errorBanner.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  });

  // Print Receipt Button Handler
  if (printBtn) {
    printBtn.addEventListener("click", () => {
      window.print();
    });
  }

  // Submit Another Response Handler
  if (newAppBtn) {
    newAppBtn.addEventListener("click", () => {
      // 1. Reset standard form fields
      form.reset();

      // 2. Clear all hidden file inputs & reset dropzones
      form.querySelectorAll('input[type="file"]').forEach((fi) => {
        fi.value = "";
      });
      form.querySelectorAll(".form-file-dropzone").forEach((dz) => {
        dz.classList.remove("file-selected", "dragover");
        const titleEl = dz.querySelector(".dropzone-title");
        if (titleEl) {
          titleEl.textContent = "Click or Drag & Drop Resume (PDF)";
        }
      });

      // 3. Clear all validation error states
      form.querySelectorAll(".form-field-group").forEach((grp) => {
        grp.classList.remove("has-error");
      });
      form.querySelectorAll(".field-error-bubble").forEach((bubble) => {
        bubble.textContent = "";
      });
      if (errorBanner) {
        errorBanner.style.display = "none";
      }

      // 4. Reset submit button state
      submitBtn.disabled = false;
      submitBtnText.textContent = "CASH IN YOUR OPPORTUNITY";
      const originalSubtext = submitBtn.querySelector(".btn-subtext");
      if (originalSubtext) {
        originalSubtext.textContent = "SUBMIT APPLICATION TO THE COUNCIL →";
      }

      // 5. Generate a brand new Application ID and fresh timestamp
      initReceiptHeader();

      // 6. Switch view back to form
      const confirmationPanel = document.getElementById("bill-confirmation-panel");
      if (confirmationPanel) confirmationPanel.style.display = "none";
      form.style.display = "block";

      // 7. Smoothly scroll to the receipt form
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

// ==============================================================================
// 6. SUCCESS STATE & CONFIRMATION
// ==============================================================================
function showSuccessState(formData) {
  const form = document.getElementById("bloombox-recruitment-form");
  const confirmationPanel = document.getElementById("bill-confirmation-panel");
  const summaryContainer = document.getElementById("confirmed-summary");

  // Populate itemized confirmed receipt summary
  if (summaryContainer) {
    summaryContainer.innerHTML = "";

    // Add Application ID Row
    const appRow = createSummaryRow("APPLICATION NO.", formData.appId || currentAppId);
    summaryContainer.appendChild(appRow);

    // Add each submitted field
    CONFIG.formFields.forEach((field) => {
      let val = formData[field.name] || "-";
      if (field.type === "file") {
        val = formData.resumeFileName ? `📄 ${formData.resumeFileName} (Attached)` : "None";
      }
      const row = createSummaryRow(field.label.toUpperCase(), val);
      summaryContainer.appendChild(row);
    });

    const statusRow = createSummaryRow("STATUS", "OFFICIALLY RECORDED IN COUNCIL LEDGER");
    summaryContainer.appendChild(statusRow);
  }

  // Hide form inputs and reveal confirmation
  if (form) form.style.display = "none";
  if (confirmationPanel) confirmationPanel.style.display = "block";

  // Fire celebratory comic confetti
  fireComicConfetti();

  // Smoothly center the confirmation receipt in view
  confirmationPanel.scrollIntoView({ behavior: "smooth", block: "center" });
}

function createSummaryRow(label, value) {
  const div = document.createElement("div");
  div.className = "summary-row";

  const lbl = document.createElement("span");
  lbl.className = "summary-label";
  lbl.textContent = label;

  const val = document.createElement("span");
  val.className = "summary-val";
  val.textContent = value;

  div.appendChild(lbl);
  div.appendChild(val);
  return div;
}

// ==============================================================================
// 7. CONFETTI CELEBRATION EFFECT
// ==============================================================================
function fireComicConfetti() {
  if (typeof confetti !== "function") return;

  const confettiCanvas = document.getElementById("confetti-canvas");
  const myConfetti = confetti.create(confettiCanvas, { resize: true, useWorker: true });

  // Comic Color Palette: Cyan, Yellow, Red, Electric Blue
  const comicColors = ["#00c2cb", "#ffbe0b", "#d90429", "#0055ff", "#ffffff"];

  // Burst 1: Left
  myConfetti({
    particleCount: 45,
    spread: 70,
    origin: { x: 0.25, y: 0.6 },
    colors: comicColors,
    shapes: ["square", "circle"]
  });

  // Burst 2: Right
  setTimeout(() => {
    myConfetti({
      particleCount: 45,
      spread: 70,
      origin: { x: 0.75, y: 0.6 },
      colors: comicColors,
      shapes: ["square", "circle"]
    });
  }, 200);

  // Big center burst
  setTimeout(() => {
    myConfetti({
      particleCount: 65,
      spread: 100,
      origin: { x: 0.5, y: 0.5 },
      colors: comicColors
    });
  }, 450);
}

// ==============================================================================
// 8. GSAP & SCROLLTRIGGER ANIMATIONS
// ==============================================================================
function initAnimations() {
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion || !window.gsap) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // 1. Hero Poster Entrance
  const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

  heroTl
    .from(".hero-poster-frame", {
      opacity: 0,
      scale: 0.92,
      y: 30,
      duration: 0.9,
      ease: "back.out(1.4)"
    })
    .from(".hero-scroll-prompt", {
      opacity: 0,
      y: 15,
      duration: 0.6
    }, "-=0.3");

  // Subtle parallax on the poster as user scrolls
  gsap.to(".hero-poster-frame", {
    scrollTrigger: {
      trigger: "#hero-poster",
      start: "top top",
      end: "bottom top",
      scrub: 1
    },
    y: 40,
    scale: 0.98
  });

  // 4. Scroll reveals for "What is BloomBox" section
  gsap.from(".main-story-card", {
    scrollTrigger: {
      trigger: "#what-is-bloombox",
      start: "top 80%"
    },
    x: -40,
    opacity: 0,
    duration: 0.8,
    ease: "power2.out"
  });

  gsap.from(".sub-story-card", {
    scrollTrigger: {
      trigger: "#what-is-bloombox",
      start: "top 80%"
    },
    x: 40,
    opacity: 0,
    duration: 0.8,
    delay: 0.15,
    ease: "power2.out"
  });

  // 5. Staggered reveal for "Why Join?" cards
  gsap.from(".feature-comic-box", {
    scrollTrigger: {
      trigger: "#why-join",
      start: "top 78%"
    },
    y: 50,
    opacity: 0,
    duration: 0.6,
    stagger: 0.12,
    ease: "back.out(1.4)"
  });

  // 6. Stack card slide-in for Job Description roles
  gsap.from(".stack-card", {
    scrollTrigger: {
      trigger: "#job-description",
      start: "top 80%"
    },
    x: (i) => (i % 2 === 0 ? -40 : 40),
    opacity: 0,
    duration: 0.7,
    stagger: 0.14,
    ease: "power2.out"
  });

  // 7. Recruitment ticket stub unfold
  gsap.from(".comic-ticket", {
    scrollTrigger: {
      trigger: "#recruitment-details",
      start: "top 82%"
    },
    scale: 0.94,
    opacity: 0,
    duration: 0.7,
    ease: "back.out(1.3)"
  });

  // 8. The Grand Receipt Transition (The Bill enters the viewport)
  gsap.from("#grand-receipt", {
    scrollTrigger: {
      trigger: "#recruitment-form-section",
      start: "top 85%",
      toggleActions: "play none none none"
    },
    y: 80,
    opacity: 0.4,
    duration: 0.9,
    ease: "power3.out"
  });
}
