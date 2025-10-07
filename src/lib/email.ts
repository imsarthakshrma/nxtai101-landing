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
DESCRIPTION:Join us for Spark 101\\n\\nZoom Link: ${session.zoom_link}${session.zoom_meeting_id ? `\\nMeeting ID: ${session.zoom_meeting_id}` : ''}${session.zoom_passcode ? `\\nPasscode: ${session.zoom_passcode}` : ''}
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
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .session-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
    .session-details h2 { margin-top: 0; color: #667eea; font-size: 20px; }
    .session-details p { margin: 8px 0; }
    .zoom-section { margin: 25px 0; }
    .zoom-button { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0; font-weight: bold; }
    .zoom-credentials { background: #e0e7ff; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .what-to-expect { margin: 25px 0; }
    .what-to-expect ul { padding-left: 20px; }
    .what-to-expect li { margin: 8px 0; }
    .pro-tip { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; margin-top: 30px; }
    .footer a { color: #667eea; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to NXTAI101!</h1>
    </div>
    
    <div class="content">
      <p>Hi <strong>${enrollment.name}</strong>,</p>
      
      <p>Your payment of <strong>₹${enrollment.amount_paid / 100}</strong> for Spark 101 is confirmed.</p>
      
      <div class="session-details">
        <h2>📅 Session Details</h2>
        <p><strong>Date:</strong> ${sessionDate}</p>
        <p><strong>Time:</strong> ${sessionTime} IST</p>
        <p><strong>Duration:</strong> ${session.duration_minutes} minutes</p>
      </div>
      
      <div class="zoom-section">
        <h3 style="color: #667eea;">🔗 Join via Zoom</h3>
        <a href="${session.zoom_link}" class="zoom-button">Join Zoom Session</a>
        
        ${session.zoom_meeting_id || session.zoom_passcode ? `
        <div class="zoom-credentials">
          ${session.zoom_meeting_id ? `<p><strong>Meeting ID:</strong> ${session.zoom_meeting_id}</p>` : ''}
          ${session.zoom_passcode ? `<p><strong>Passcode:</strong> ${session.zoom_passcode}</p>` : ''}
        </div>
        ` : ''}
      </div>
      
      <p>📎 <strong>Calendar invite attached</strong> - Add to your calendar so you don't miss it!</p>
      
      <div class="what-to-expect">
        <h3 style="color: #667eea;">What to expect:</h3>
        <ul>
          <li>AI fundamentals explained simply</li>
          <li>Prompt engineering do's and don'ts</li>
          <li>Introduction to context engineering</li>
          <li>Live Q&A with 150 fellow learners</li>
        </ul>
      </div>
      
      <div class="pro-tip">
        <strong>💡 Pro tip:</strong> Join 5 minutes early to test your audio/video.
      </div>
      
      <p>See you there! 🚀</p>
      
      <p style="margin-top: 30px;">
        <strong>Team NXTAI101</strong><br>
        <a href="mailto:hello@nxtai101.com">hello@nxtai101.com</a>
      </p>
    </div>
    
    <div class="footer">
      <p>© 2025 NXTAI101. All rights reserved.</p>
      <p style="font-size: 12px; color: #9ca3af;">Payment ID: ${enrollment.razorpay_payment_id || enrollment.razorpay_order_id}</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Send confirmation email with Zoom link
 */
export async function sendConfirmationEmail(
  enrollment: Enrollment,
  session: Session
): Promise<{ success: boolean; emailId?: string; error?: string }> {
  try {
    const emailHtml = generateConfirmationEmailHTML(enrollment, session);
    const icsFile = generateCalendarInvite(session);

    const { data, error } = await resend.emails.send({
      from: 'NXTAI101 <hello@nxtai101.com>',
      to: enrollment.email,
      subject: `✅ You're enrolled in Spark 101 - ${formatSessionDate(session.session_date)}`,
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
  } catch (error: any) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
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
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 8px; }
    .content { padding: 20px; }
    .zoom-button { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Spark 101 starts tomorrow!</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${enrollment.name}</strong>,</p>
      <p>Just a friendly reminder — your Spark 101 session is tomorrow!</p>
      <p><strong>📅 Tomorrow, ${sessionDate}</strong><br>
      <strong>🕐 ${sessionTime} IST</strong></p>
      <a href="${session.zoom_link}" class="zoom-button">Join Zoom Session</a>
      <p><strong>💡 Pro tip:</strong> Join 5 minutes early to test your audio/video.</p>
      <p>Excited to see you there!</p>
      <p><strong>Team NXTAI101</strong></p>
    </div>
  </div>
</body>
</html>
    `;

    const { error } = await resend.emails.send({
      from: 'NXTAI101 <hello@nxtai101.com>',
      to: enrollment.email,
      subject: `⏰ Spark 101 starts tomorrow at ${sessionTime}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Reminder email error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Reminder email error:', error);
    return { success: false, error: error.message };
  }
}
