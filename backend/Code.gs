// Configuration & Environment Settings
// You can set these directly below, OR in Google Apps Script under:
// Project Settings (gear icon) > Script Properties (SPREADSHEET_ID, GOOGLE_DRIVE_FOLDER_LINK, SHEET_NAME)
const SCRIPT_PROPS = PropertiesService.getScriptProperties();

const SPREADSHEET_ID = SCRIPT_PROPS.getProperty("SPREADSHEET_ID") || ""; 
const SHEET_NAME = SCRIPT_PROPS.getProperty("SHEET_NAME") || "Registrations";
const GOOGLE_DRIVE_FOLDER_LINK = SCRIPT_PROPS.getProperty("GOOGLE_DRIVE_FOLDER_LINK") || "148khR8YTpYfPiv3bOzsYP1h0opD4IGOJ";

// Default column order in Google Sheets (Resume column removed as requested)
const DEFAULT_HEADERS = [
  "Timestamp",
  "Application ID",
  "Full Name",
  "Somaiya Email ID",
  "Contact Number",
  "Year",
  "Branch",
  "Status"
];

/**
 * Handles GET requests (Health check and ping)
 */
function doGet(e) {
  const output = {
    status: "online",
    message: "BloomBox Recruitment API is active and ready.",
    timestamp: new Date().toISOString()
  };
  return ContentService
    .createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handles POST requests from the recruitment form
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  
  // Wait up to 30 seconds for concurrent submissions to prevent race conditions
  try {
    lock.waitLock(30000);
  } catch (err) {
    return createJsonResponse({
      success: false,
      message: "Server is busy processing other applications. Please retry."
    });
  }

  try {
    let data = {};

    // Support both application/json and application/x-www-form-urlencoded
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        // Fallback for form-encoded payload
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    // Basic payload check
    if (!data || Object.keys(data).length === 0) {
      return createJsonResponse({
        success: false,
        message: "No submission data received."
      });
    }

    // Get the target spreadsheet
    let ss;
    if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "" && SPREADSHEET_ID !== "YOUR_SPREADSHEET_ID") {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    } else {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    }

    if (!ss) {
      return createJsonResponse({
        success: false,
        message: "Target Google Spreadsheet could not be opened. Check SPREADSHEET_ID."
      });
    }

    // Get or create the sheet
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      // Auto-populate default headers if brand new sheet
      sheet.appendRow(DEFAULT_HEADERS);
      formatHeaderRow(sheet);
    }

    // Read existing headers
    const lastCol = Math.max(sheet.getLastColumn(), 1);
    let headers = [];
    if (sheet.getLastRow() > 0) {
      headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    }

    // If headers are completely missing, initialize them
    if (headers.length === 0 || !headers[0]) {
      headers = DEFAULT_HEADERS;
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      formatHeaderRow(sheet);
    }

    // Create unique Application ID if not provided
    const appId = data.appId || "BB-FY" + Math.floor(100000 + Math.random() * 900000);
    const now = new Date();
    const formattedTimestamp = Utilities.formatDate(now, "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");

    // Standardize incoming data mapping strictly to the 8 council columns
    const submissionMap = {
      "timestamp": formattedTimestamp,
      "application id": appId,
      "full name": data.fullName || data["Full Name"] || data["full name"] || "",
      "somaiya email id": data.email || data["Somaiya Email ID"] || data["somaiya email id"] || "",
      "contact number": data.phone || data["Contact Number"] || data["contact number"] || "",
      "year": data.year || data["Year"] || "",
      "branch": data.branch || data["Branch"] || "",
      "status": "Received"
    };

    // Handle PDF Resume upload directly into specified Google Drive folder
    let resumeStatus = "No file";
    if (data.resumeBase64 && data.resumeFileName) {
      try {
        let base64Data = data.resumeBase64;
        if (base64Data.indexOf(",") > -1) {
          base64Data = base64Data.split(",")[1];
        }
        base64Data = base64Data.replace(/[\s\r\n]/g, "").replace(/ /g, "+");
        const decoded = Utilities.base64Decode(base64Data);
        const safeStudentName = (data.fullName || "Applicant").replace(/[^a-zA-Z0-9_-]/g, "_");
        const safeFileName = appId + "_" + safeStudentName + "_Resume.pdf";
        const blob = Utilities.newBlob(decoded, "application/pdf", safeFileName);

        // Try primary target folder: 148khR8YTpYfPiv3bOzsYP1h0opD4IGOJ
        const targetFolderId = "148khR8YTpYfPiv3bOzsYP1h0opD4IGOJ";
        let targetFolder = null;
        try {
          targetFolder = DriveApp.getFolderById(targetFolderId);
          targetFolder.createFile(blob);
          resumeStatus = "Saved to Drive";
        } catch (folderErr) {
          // If permission is denied or folder not found, fallback to script owner's Drive folder
          const fallbackName = "BloomBox FY Resumes 2026-27";
          const fallbackFolders = DriveApp.getFoldersByName(fallbackName);
          const fallback = fallbackFolders.hasNext() ? fallbackFolders.next() : DriveApp.createFolder(fallbackName);
          fallback.createFile(blob);
          resumeStatus = "Saved to Fallback (Check 148kh permissions: " + folderErr.message + ")";
        }
      } catch (driveErr) {
        resumeStatus = "Drive Error: " + driveErr.message;
        Logger.log("Drive save error: " + driveErr.toString());
      }
    }

    if (resumeStatus !== "No file") {
      submissionMap["status"] = "Received - " + resumeStatus;
    }

    // Map values strictly matching the 8 predefined headers
    const rowValues = DEFAULT_HEADERS.map(header => {
      const hLower = header.toLowerCase().trim();
      return submissionMap[hLower] !== undefined ? submissionMap[hLower] : "";
    });

    // Append the row
    sheet.appendRow(rowValues);

    return createJsonResponse({
      success: true,
      message: "Application received and registered successfully!",
      appId: appId,
      timestamp: formattedTimestamp
    });

  } catch (error) {
    return createJsonResponse({
      success: false,
      message: "Server error occurred: " + error.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Formats the header row for a clean retro/professional look in Google Sheets
 */
function formatHeaderRow(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn() || DEFAULT_HEADERS.length);
  headerRange.setBackground("#008080"); // Teal header
  headerRange.setFontColor("#ffffff");
  headerRange.setFontWeight("bold");
  headerRange.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
}

/**
 * Returns a CORS-friendly JSON response
 */
function createJsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function testDriveConnection() {
  const targetFolderId = "148khR8YTpYfPiv3bOzsYP1h0opD4IGOJ";
  try {
    const folder = DriveApp.getFolderById(targetFolderId);
    Logger.log("SUCCESS! Connected to target folder: " + folder.getName());
    const testFile = folder.createFile("test_connection.txt", "BloomBox Google Drive Integration Test");
    Logger.log("SUCCESS! File created in folder: " + testFile.getUrl());
  } catch (err) {
    Logger.log("ERROR accessing folder: " + err.toString());
  }
}
