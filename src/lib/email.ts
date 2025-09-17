// Email service using native Resend library for optimal performance
import { env } from '$env/dynamic/private';
import { Resend } from 'resend';

export interface EmailData {
	to: string;
	subject: string;
	text: string;
	html?: string;
}

export async function sendEmail(data: EmailData): Promise<boolean> {
	try {
		// If no API key is configured, log to console (dev fallback)
		if (!env.RESEND_API_KEY) {
			console.log('\n📧 ===== MAGIC LINK EMAIL =====');
			console.log(`To: ${data.to}`);
			console.log(`Subject: ${data.subject}`);
			console.log('\n📝 Email Content:');
			console.log(data.text);
			console.log('\n🔗 Magic Link (copy this):');

			// Extract the magic link from the email text
			const linkMatch = data.text.match(/https?:\/\/[^\s]+/);
			if (linkMatch) {
				console.log(`\x1b[32m${linkMatch[0]}\x1b[0m`);
			}

			console.log('==============================\n');
			return true;
		}

		// Use native Resend library for optimal performance
		const resend = new Resend(env.RESEND_API_KEY);
		const startedAtMs = Date.now();
		console.log('[email] Using Resend SDK. EMAIL_FROM configured:', Boolean(env.EMAIL_FROM));
		const result = await resend.emails.send({
			from: env.EMAIL_FROM || 'Job Board <onboarding@resend.dev>',
			to: [data.to],
			subject: data.subject,
			text: data.text,
			html: data.html
		});

		const durationMs = Date.now() - startedAtMs;
		if (result.error) {
			console.error('Resend library error:', result.error);
			console.error(`[email] Resend SDK call failed after ${durationMs}ms`);
			return false;
		}

		console.log('Email sent successfully:', result.data?.id);
		console.log(`[email] Resend SDK call duration: ${durationMs}ms`);
		return true;
	} catch (error) {
		console.error('Error in sendEmail function:', error);
		return false;
	}
}

// Non-blocking email sending for better performance
export async function sendEmailAsync(data: EmailData): Promise<void> {
	// Fire and forget - don't await the result
	sendEmail(data).catch(error => {
		console.error('Background email sending failed:', error);
	});
}

export function createAdminMagicLinkEmail(communityName: string, adminToken: string, baseUrl: string): EmailData {
	const magicLink = `${baseUrl}/admin?token=${adminToken}`;

	return {
		to: '', // Will be set by caller
		subject: `Admin access for ${communityName} job board`,
		text: `
Hello!

Your job board "${communityName}" has been created successfully.

Click the link below to access your admin panel:
${magicLink}

This link will expire in 24 hours for security reasons.

Best regards,
FREN.WORK
		`.trim(),
		html: `
<h2>Your job board is ready!</h2>
<p>Hello!</p>
<p>Your job board "<strong>${communityName}</strong>" has been created successfully.</p>
<p><a href="${magicLink}" style="background-color: #4ADE80; color: white; border-style: solid; font-family:Arial, sans-serif;  border-color: #4ADE80; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Access Admin Panel</a></p>
<p><small>This link doesn't expire. Use it to manage your board.</small></p>
<p>From your frens at</p>
<div style="margin-bottom: 20px;">
  <a href="https://fren.work" 
     style="background-color: #4ADE80; 
            color: white; 
            padding: 10px 20px; 
            font-family: Arial, sans-serif; 
            font-weight: 600; 
            text-decoration: none; 
            display: inline-block;">
    FREN.WORK
  </a>
</div>
<div>
  <a href="mailto:support@fren.work" style="color: #A9A9A9;">support@fren.work</a>
</div>
		`.trim()
	};
}

export function createJobEditMagicLinkEmail(jobTitle: string, editToken: string, baseUrl: string): EmailData {
	const magicLink = `${baseUrl}/edit-job?token=${editToken}`;

	return {
		to: '', // Will be set by caller
		subject: `Edit your job posting: ${jobTitle}`,
		text: `
Hello!

Your job posting "${jobTitle}" has been submitted successfully.

Click the link below to edit or manage your job posting:
${magicLink}

This link doesn't expire. Do not lose it!.

Best regards,
The Job Board Team
		`.trim(),
		html: `
<h2>Job posted successfully!</h2>
<p>Hello!</p>
<p>Your job posting "<strong>${jobTitle}</strong>" has been submitted successfully.</p>
<p><a href="${magicLink}" style="background-color: #4ADE80; color: white; border-style: solid; font-family:Arial, sans-serif;  border-color: #4ADE80; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Manage Job Post</a></p>
<p><small>This link doesn't expire. Use it to manage your job post.</small></p>
<p>From your frens at</p>
<div style="margin-bottom: 20px;">
  <a href="https://fren.work" 
     style="background-color: #4ADE80; 
            color: white; 
            padding: 10px 20px; 
            font-family: Arial, sans-serif; 
            font-weight: 600; 
            text-decoration: none; 
            display: inline-block;">
    FREN.WORK
  </a>
</div>
<div>
  <a href="mailto:support@fren.work" style="color: #A9A9A9;">support@fren.work</a>
</div>
		`.trim()
	};
}