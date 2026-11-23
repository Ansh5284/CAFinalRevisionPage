/**
 * ============================================================================
 * CHARTERED ARCHIVE — FREE PRIVATE GOOGLE SHEET & PRIVATE DRIVE RECEIVER
 * ============================================================================
 *
 * COST: 100% FREE (Google Apps Script included with your standard Google account).
 * PRIVACY: Your Google Sheet and Descriptive Submissions Drive folder remain
 *          STRICTLY PRIVATE (shared with NOBODY). Only this script executes
 *          under your account when deployed with:
 *            - Execute as: Me (your email)
 *            - Who has access: Anyone
 *
 * SETUP INSTRUCTIONS (2 minutes):
 * 1. Open Google Sheets -> Create a new PRIVATE spreadsheet (do NOT share it).
 * 2. Rename Sheet 1 to `Feedback` and add a second tab named `DescriptiveSubmissions`.
 * 3. (Optional, for future Descriptive PDF uploads) Create a PRIVATE folder in your
 *    Google Drive for student answer sheets and copy its Folder ID below.
 * 4. In Google Sheets, click Extensions -> Apps Script -> Paste this entire file.
 * 5. Click Deploy -> New Deployment -> Web App:
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 6. Copy the generated Web App URL (`https://script.google.com/macros/s/.../exec`)
 *    and paste it into `FEEDBACK_CONFIG.appsScriptUrl` (and `DESCRIPTIVE_CONFIG.appsScriptUrl`)
 *    in `src/config/driveConfig.ts` (or `.env`).
 */

const PRIVATE_SUBMISSIONS_FOLDER_ID = ''; // Optional: Private Drive folder ID for future Descriptive PDF/text uploads

function doPost(e) {
  try {
    const rawBody = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const payload = JSON.parse(rawBody);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // ------------------------------------------------------------------------
    // ROUTE 1: Website User Feedback -> Private "Feedback" Sheet
    // ------------------------------------------------------------------------
    if (payload.type === 'feedback' || !payload.type) {
      let sheet = ss.getSheetByName('Feedback');
      if (!sheet) {
        sheet = ss.insertSheet('Feedback');
      }
      if (sheet.getLastRow() === 0) {
        sheet.appendRow([
          'Timestamp',
          'Name',
          'Anonymous',
          'Attempt',
          'Subject',
          'Category',
          'Rating (1-5)',
          'Message',
        ]);
      }

      sheet.appendRow([
        new Date().toISOString(),
        payload.anonymous ? 'Anonymous' : String(payload.name || '').slice(0, 120),
        Boolean(payload.anonymous),
        String(payload.attempt || '').slice(0, 60),
        String(payload.subject || 'All Subjects').slice(0, 80),
        String(payload.category || 'General').slice(0, 80),
        Number(payload.rating) || 5,
        String(payload.message || '').slice(0, 4000),
      ]);

      return jsonResponse({ ok: true, mode: 'feedback-logged' });
    }

    // ------------------------------------------------------------------------
    // ROUTE 2: Future Descriptive Answer Upload (Typed or PDF) -> Private Drive
    // ------------------------------------------------------------------------
    if (payload.type === 'descriptive_submission') {
      const trackingId =
        payload.trackingId ||
        'CA-' + new Date().getFullYear() + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();

      let driveFileUrl = '';
      if (PRIVATE_SUBMISSIONS_FOLDER_ID) {
        const folder = DriveApp.getFolderById(PRIVATE_SUBMISSIONS_FOLDER_ID);
        if (payload.mode === 'pdf' && payload.pdfBase64) {
          const decoded = Utilities.base64Decode(payload.pdfBase64);
          const safeFileName = trackingId + '_' + String(payload.pdfFileName || 'answer.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
          const blob = Utilities.newBlob(decoded, 'application/pdf', safeFileName);
          const savedFile = folder.createFile(blob);
          driveFileUrl = savedFile.getUrl();
        } else {
          const textContent =
            'Tracking ID: ' + trackingId + '\n' +
            'Subject: ' + (payload.subjectId || '') + '\n' +
            'Question ID: ' + (payload.questionId || '') + '\n' +
            'Student: ' + (payload.studentName || 'Anonymous') + '\n\n' +
            String(payload.typedAnswer || '');
          const savedFile = folder.createFile(trackingId + '_answer.txt', textContent, MimeType.PLAIN_TEXT);
          driveFileUrl = savedFile.getUrl();
        }
      }

      let descSheet = ss.getSheetByName('DescriptiveSubmissions');
      if (!descSheet) {
        descSheet = ss.insertSheet('DescriptiveSubmissions');
      }
      if (descSheet.getLastRow() === 0) {
        descSheet.appendRow([
          'TrackingId',
          'SubmittedAt',
          'SubjectId',
          'QuestionId',
          'StudentName',
          'Mode',
          'DriveFileUrl',
          'Status',
          'EvaluationJson',
        ]);
      }

      descSheet.appendRow([
        trackingId,
        new Date().toISOString(),
        String(payload.subjectId || ''),
        String(payload.questionId || ''),
        String(payload.studentName || 'Anonymous').slice(0, 120),
        String(payload.mode || 'typed'),
        driveFileUrl,
        'queued-for-analysis',
        '', // Gemini Argon task writes the evaluated JSON object into this cell
      ]);

      return jsonResponse({ ok: true, trackingId: trackingId, status: 'queued-for-analysis' });
    }

    return jsonResponse({ ok: false, error: 'Unknown submission type.' });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

/**
 * Allows a student to check their Gemini Argon evaluation result by Tracking ID
 * without exposing anyone else's answers or your private Google Sheet.
 * GET ?action=lookup&trackingId=CA-2026-XXXXX
 */
function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : '';
    const trackingId = e && e.parameter ? String(e.parameter.trackingId || '').trim() : '';

    if (action !== 'lookup' || !trackingId) {
      return jsonResponse({ ok: true, service: 'Chartered Archive Receiver' });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('DescriptiveSubmissions');
    if (!sheet) {
      return jsonResponse({ ok: false, error: 'Submission not found.' });
    }

    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]).trim().toUpperCase() === trackingId.toUpperCase()) {
        const status = String(rows[i][7] || 'queued-for-analysis');
        const evalRaw = String(rows[i][8] || '').trim();
        return jsonResponse({
          ok: true,
          trackingId: rows[i][0],
          status: evalRaw ? 'evaluated' : status,
          evaluation: evalRaw ? JSON.parse(evalRaw) : null,
        });
      }
    }

    return jsonResponse({ ok: false, error: 'Tracking ID not found.' });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
