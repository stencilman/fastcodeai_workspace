import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

// Get sender email from environment variables
const SENDER_EMAIL = process.env.SENDGRID_SENDER_EMAIL || '';

// Document submission email template (for admins)
const DOCUMENT_SUBMISSION_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <title>New Document Submission</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #0070f3;
      color: white;
      padding: 20px;
      text-align: center;
    }
    .content {
      padding: 20px;
      background-color: #ffffff;
    }
    .footer {
      background-color: #f6f6f6;
      padding: 15px;
      text-align: center;
      font-size: 12px;
      color: #666666;
    }
    .button {
      display: inline-block;
      background-color: #0070f3;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 4px;
      margin-top: 20px;
    }
    .document-info {
      background-color: #f9f9f9;
      border-left: 4px solid #0070f3;
      padding: 15px;
      margin: 20px 0;
    }
    .document-info p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Document Submission</h1>
    </div>
    <div class="content">
      <p>Hello Admin,</p>
      <p>A new document has been submitted for your review.</p>
      
      <div class="document-info">
        <p><strong>User:</strong> {{user_name}} ({{user_email}})</p>
        <p><strong>Document Type:</strong> {{document_type}}</p>
        <p><strong>Submitted On:</strong> {{submission_date}}</p>
        <p><strong>File Name:</strong> {{file_name}}</p>
      </div>
      
      <p>Please review this document at your earliest convenience.</p>
      
      <a href="{{review_url}}" class="button" style="color: white !important; text-decoration: none;">Review Document</a>
      
      <p>Thank you,<br>Fast Code AI Team</p>
    </div>
    <div class="footer">
      <p>This is an automated message from the Fast Code AI document management system.</p>
      <p>© 2025 Fast Code AI. All rights reserved.</p>
      <div data-role="module-unsubscribe" class="module" role="module" data-type="unsubscribe" style="color:#444444; font-size:12px; line-height:20px; padding:16px 16px 16px 16px; text-align:Center;" data-muid="4e838cf3-9892-4a6d-94d6-170e474d21e5">
        <p style="font-size:12px; line-height:20px;">
          <a class="Unsubscribe--unsubscribeLink" href="{{{unsubscribe}}}" target="_blank" style="font-family:sans-serif;text-decoration:none;">
            Unsubscribe
          </a>
          -
          <a href="{{{unsubscribe_preferences}}}" target="_blank" class="Unsubscribe--unsubscribePreferences" style="font-family:sans-serif;text-decoration:none;">
            Unsubscribe Preferences
          </a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// Document status email template (for users)
const DOCUMENT_STATUS_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <title>Document {{status}} Notification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: {{status_color}};
      color: white;
      padding: 20px;
      text-align: center;
    }
    .content {
      padding: 20px;
      background-color: #ffffff;
    }
    .footer {
      background-color: #f6f6f6;
      padding: 15px;
      text-align: center;
      font-size: 12px;
      color: #666666;
    }
    .button {
      display: inline-block;
      background-color: {{status_color}};
      color: white !important;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 4px;
      margin-top: 20px;
      font-weight: bold;
    }
    .document-info {
      background-color: #f9f9f9;
      border-left: 4px solid {{status_color}};
      padding: 15px;
      margin: 20px 0;
    }
    .document-info p {
      margin: 5px 0;
    }
    .status-approved {
      color: #10b981;
      font-weight: bold;
    }
    .status-rejected {
      color: #ef4444;
      font-weight: bold;
    }
    .notes {
      background-color: #fffbeb;
      border: 1px solid #fbbf24;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Document {{status}}</h1>
    </div>
    <div class="content">
      <p>Hello {{user_name}},</p>
      
      {{#if is_approved}}
      <p>We're pleased to inform you that your document has been <span class="status-approved">APPROVED</span>.</p>
      {{else}}
      <p>We regret to inform you that your document has been <span class="status-rejected">REJECTED</span>.</p>
      {{/if}}
      
      <div class="document-info">
        <p><strong>Document Type:</strong> {{document_type}}</p>
        <p><strong>Submitted On:</strong> {{submission_date}}</p>
        <p><strong>Reviewed On:</strong> {{review_date}}</p>
        <p><strong>File Name:</strong> {{file_name}}</p>
        {{#if is_rejected}}
        <p><strong style="color: #ef4444;">Reason for Rejection:</strong> {{notes}}</p>
        {{/if}}
      </div>
      
      {{#if is_approved}}
      {{#if notes}}
      <div class="notes">
        <p><strong>Reviewer Notes:</strong></p>
        <p>{{notes}}</p>
      </div>
      {{/if}}
      {{/if}}
      
      {{#if is_rejected}}
      <p>Please address the issues mentioned and resubmit your document.</p>
      <a href="{{upload_url}}" class="button" style="color: white !important; text-decoration: none;">Reupload Document</a>
      {{else}}
      <p>No further action is required for this document.</p>
      <a href="{{dashboard_url}}" class="button" style="color: white !important; text-decoration: none;">View Documents</a>
      {{/if}}
      
      <p>If you have any questions, please contact our support team.</p>
      
      <p>Thank you,<br>Fast Code AI Team</p>
    </div>
    <div class="footer">
      <p>This is an automated message from the Fast Code AI document management system.</p>
      <p>© 2025 Fast Code AI. All rights reserved.</p>
      <div data-role="module-unsubscribe" class="module" role="module" data-type="unsubscribe" style="color:#444444; font-size:12px; line-height:20px; padding:16px 16px 16px 16px; text-align:Center;" data-muid="4e838cf3-9892-4a6d-94d6-170e474d21e5">
        <p style="font-size:12px; line-height:20px;">
          <a class="Unsubscribe--unsubscribeLink" href="{{{unsubscribe}}}" target="_blank" style="font-family:sans-serif;text-decoration:none;">
            Unsubscribe
          </a>
          -
          <a href="{{{unsubscribe_preferences}}}" target="_blank" class="Unsubscribe--unsubscribePreferences" style="font-family:sans-serif;text-decoration:none;">
            Unsubscribe Preferences
          </a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

/**
 * Interface for document submission notification data
 */
export interface DocumentSubmissionEmailData {
  user_name: string;
  user_email: string;
  document_type: string;
  submission_date: string;
  file_name: string;
  review_url: string;
}

/**
 * Interface for document status notification data
 */
export interface DocumentStatusEmailData {
  status: 'Approved' | 'Rejected';
  status_color: string;
  user_name: string;
  document_type: string;
  submission_date: string;
  review_date: string;
  file_name: string;
  notes?: string;
  is_approved: boolean;
  is_rejected: boolean;
  upload_url?: string;
  dashboard_url?: string;
}

/**
 * Helper function to manually process templates with conditionals and variables
 */
function replaceTemplateVariables(template: string, data: Record<string, any>): string {
  // Process template line by line for better control
  const lines = template.split('\n');
  let processedLines: string[] = [];
  let skipUntilEndIf = false;
  let skipUntilElse = false;
  let currentCondition = '';
  let i = 0;

  while (i < lines.length) {
    let line = lines[i];

    // Check for conditional start
    const ifMatch = line.match(/\{\{#if\s+([^\}]+)\}\}/);
    if (ifMatch) {
      const condition = ifMatch[1].trim();
      currentCondition = condition;

      // Check if condition is true
      if (data[condition] === true) {
        // Remove the {{#if condition}} part
        line = line.replace(/\{\{#if\s+([^\}]+)\}\}/, '');
        skipUntilElse = false;
      } else {
        // Skip until we find {{else}} or {{/if}}
        skipUntilElse = true;
        i++;
        continue;
      }
    }

    // Check for else
    if (line.includes('{{else}}')) {
      if (skipUntilElse) {
        // We were skipping, but now we found else, so stop skipping
        skipUntilElse = false;
        // Remove the {{else}} part
        line = line.replace(/\{\{else\}\}/, '');
      } else {
        // We weren't skipping, so now skip until end if
        skipUntilEndIf = true;
        i++;
        continue;
      }
    }

    // Check for conditional end
    if (line.includes('{{/if}}')) {
      // Reset flags
      skipUntilEndIf = false;
      skipUntilElse = false;
      currentCondition = '';
      // Remove the {{/if}} part
      line = line.replace(/\{\{\/if\}\}/, '');
    }

    // Skip if we're in a skip state
    if (skipUntilEndIf || skipUntilElse) {
      i++;
      continue;
    }

    // Replace variables in the line
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string' || typeof value === 'number') {
        const regex = new RegExp(`\{\{${key}\}\}`, 'g');
        line = line.replace(regex, String(value));
      }
    }

    // Add non-empty lines to result
    if (line.trim()) {
      processedLines.push(line);
    }

    i++;
  }

  return processedLines.join('\n');
}

/**
 * Send document submission notification to admin
 */
export async function sendDocumentSubmissionEmail(
  adminEmail: string,
  data: DocumentSubmissionEmailData
): Promise<boolean> {
  try {
    // Replace template variables
    const html = replaceTemplateVariables(DOCUMENT_SUBMISSION_TEMPLATE, data);

    const msg = {
      to: adminEmail,
      from: SENDER_EMAIL,
      subject: 'New Document Submission',
      html: html,
    };

    await sgMail.send(msg);
    console.log(`Document submission notification sent to admin: ${adminEmail}`);
    return true;
  } catch (error) {
    console.error('Failed to send document submission email:', error);
    return false;
  }
}

/**
 * Send document approval notification to user
 */
export async function sendDocumentApprovalEmail(
  userEmail: string,
  data: Omit<DocumentStatusEmailData, 'status' | 'status_color' | 'is_approved' | 'is_rejected'>
): Promise<boolean> {
  try {
    // Prepare complete data with approval-specific fields
    const completeData = {
      ...data,
      status: 'Approved',
      status_color: '#10b981',
      is_approved: true,
      is_rejected: false,
    };

    // Replace template variables
    const html = replaceTemplateVariables(DOCUMENT_STATUS_TEMPLATE, completeData);

    const msg = {
      to: userEmail,
      from: SENDER_EMAIL,
      subject: 'Document Approved',
      html: html,
    };

    await sgMail.send(msg);
    console.log(`Document approval notification sent to user: ${userEmail}`);
    return true;
  } catch (error) {
    console.error('Failed to send document approval email:', error);
    return false;
  }
}

/**
 * Send document rejection notification to user
 */
export async function sendDocumentRejectionEmail(
  userEmail: string,
  data: Omit<DocumentStatusEmailData, 'status' | 'status_color' | 'is_approved' | 'is_rejected'>
): Promise<boolean> {
  try {
    // Prepare complete data with rejection-specific fields
    const completeData = {
      ...data,
      status: 'Rejected',
      status_color: '#ef4444',
      is_approved: false,
      is_rejected: true,
    };

    // Replace template variables
    const html = replaceTemplateVariables(DOCUMENT_STATUS_TEMPLATE, completeData);

    const msg = {
      to: userEmail,
      from: SENDER_EMAIL,
      subject: 'Document Rejected',
      html: html,
    };

    await sgMail.send(msg);
    console.log(`Document rejection notification sent to user: ${userEmail}`);
    return true;
  } catch (error) {
    console.error('Failed to send document rejection email:', error);
    return false;
  }
}

/**
 * Format date for email templates
 */
export function formatDateForEmail(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
}
