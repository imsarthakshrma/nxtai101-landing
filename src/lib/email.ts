import { Resend } from 'resend';
import type { Session, Enrollment } from '@/types/database';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Generate calendar invite (.ics file) for session
 */
function generateCalendarInvite(session: Session): string {
  const startDate = new Date(session.session_date);
  const endDate = new Date(startDate.getTime() + session.duration_minutes * 60000);

  const formatICSDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//NXTAI101//Spark 101//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${session.id}@nxtai101.com
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:Spark 101 - NXTAI101
DESCRIPTION:Join us for Spark 101\n\nMeeting Link: ${session.zoom_link}${session.zoom_meeting_id ? `\nMeeting Code: ${session.zoom_meeting_id}` : ''}${session.zoom_passcode ? `\nPIN: ${session.zoom_passcode}` : ''}
LOCATION:${session.zoom_link}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT30M
ACTION:DISPLAY
DESCRIPTION:Spark 101 starts in 30 minutes
END:VALARM
END:VEVENT
END:VCALENDAR`;

  return ics;
}

/**
 * Format date for email display
 */
function formatSessionDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format time for email display
 */
function formatSessionTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Generate confirmation email HTML
 */
function generateConfirmationEmailHTML(enrollment: Enrollment, session: Session): string {
  const sessionDate = formatSessionDate(session.session_date);
  const sessionTime = formatSessionTime(session.session_date);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background: #f9fafb; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; }
    .header { background: #4f46e5; color: white; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 32px; }
    .content p { margin: 0 0 16px 0; color: #4b5563; }
    .session-box { background: #f3f4f6; border-left: 3px solid #4f46e5; padding: 16px; margin: 24px 0; border-radius: 4px; }
    .session-box p { margin: 4px 0; color: #1f2937; }
    .session-box strong { color: #1f2937; }
    .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; font-weight: 500; }
    .credentials { background: #eff6ff; padding: 12px; border-radius: 4px; margin: 16px 0; font-size: 14px; }
    .footer { text-align: center; padding: 24px; color: #9ca3af; font-size: 13px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Enrollment Confirmed</h1>
    </div>
    
    <div class="content">
      <p>Hi ${enrollment.name},</p>
      
      <p>Your enrollment for Spark 101 is confirmed. Payment of ₹${enrollment.amount_paid / 100} received.</p>
      
      <div class="session-box">
        <p><strong>Session Details</strong></p>
        <p>${sessionDate}</p>
        <p>${sessionTime} IST · ${session.duration_minutes} minutes</p>
      </div>
      
      <a href="${session.zoom_link}" class="button">Join Session</a>
      
      ${session.zoom_meeting_id || session.zoom_passcode ? `
      <div class="credentials">
        ${session.zoom_meeting_id ? `<p><strong>Meeting ID:</strong> ${session.zoom_meeting_id}</p>` : ''}
        ${session.zoom_passcode ? `<p><strong>Passcode:</strong> ${session.zoom_passcode}</p>` : ''}
      </div>
      ` : ''}
      
      <p>A calendar invite is attached to this email.</p>
      
      <p>Join 5 minutes early to test your setup.</p>
      
      <p style="margin-top: 32px;">Best,<br>NXTAI101 Team</p>
    </div>
    
    <div class="footer">
      <p>Questions? Reply to this email or contact hello@nxtai101.com</p>
      <p>© 2025 NXTAI101</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Send confirmation email with meeting link
 */
export async function sendConfirmationEmail(
  enrollment: Enrollment,
  session: Session
): Promise<{ success: boolean; emailId?: string; error?: string }> {
  try {
    const emailHtml = generateConfirmationEmailHTML(enrollment, session);
    const icsFile = generateCalendarInvite(session);

    const { data, error } = await resend.emails.send({
      from: 'NXTAI101 <no-reply@nxtai101.com>',
      to: enrollment.email,
      subject: `Thankyou for enrolling in Spark 101 - ${formatSessionDate(session.session_date)}`,
      html: emailHtml,
      attachments: [
        {
          filename: 'spark101-session.ics',
          content: Buffer.from(icsFile).toString('base64'),
        },
      ],
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, emailId: data?.id };
  } catch (error: unknown) {
    console.error('Email send error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

/**
 * Send reminder email (24 hours before session)
 */
export async function sendReminderEmail(
  enrollment: Enrollment,
  session: Session
): Promise<{ success: boolean; error?: string }> {
  try {
    const sessionDate = formatSessionDate(session.session_date);
    const sessionTime = formatSessionTime(session.session_date);

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background: #f9fafb; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; }
    .header { background: #4f46e5; color: white; padding: 24px; text-align: center; }
    .content { padding: 32px; }
    .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; font-weight: 500; }
    .footer { text-align: center; padding: 24px; color: #9ca3af; font-size: 13px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Session Tomorrow</h1>
    </div>
    <div class="content">
      <p>Hi ${enrollment.name},</p>
      <p>Your Spark 101 session is tomorrow:</p>
      <p><strong>${sessionDate}</strong><br>${sessionTime} IST</p>
      <a href="${session.zoom_link}" class="button">Join Session</a>
      <p>Join 5 minutes early to test your setup.</p>
      <p>Best,<br>NXTAI101 Team</p>
    </div>
    <div class="footer">
      <p>© 2025 NXTAI101</p>
    </div>
  </div>
</body>
</html>
    `;

    const { error } = await resend.emails.send({
      from: 'NXTAI101 <no-reply@nxtai101.com>',
      to: enrollment.email,
      subject: `⏰ Spark 101 starts tomorrow at ${sessionTime}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Reminder email error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: unknown) {
    console.error('Reminder email error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}
