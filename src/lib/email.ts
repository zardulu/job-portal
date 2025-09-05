// Simple email service for sending magic links
// In production, you'd want to use a service like SendGrid, Mailgun, or similar

export interface EmailData {
	to: string;
	subject: string;
	text: string;
	html?: string;
}

export async function sendEmail(data: EmailData): Promise<boolean> {
	try {
		// For development, just log the email content
		console.log('\n📧 ===== MAGIC LINK EMAIL =====');
		console.log(`To: ${data.to}`);
		console.log(`Subject: ${data.subject}`);
		console.log('\n📝 Email Content:');
		console.log(data.text);
		console.log('\n🔗 Magic Link (copy this):');
		
		// Extract the magic link from the email text
		const linkMatch = data.text.match(/https?:\/\/[^\s]+/);
		if (linkMatch) {
			console.log(`\x1b[32m${linkMatch[0]}\x1b[0m`); // Green color for the link
		}
		
		console.log('==============================\n');
		
		// In production, implement actual email sending here
		// For now, always return true (simulated success)
		return true;
	} catch (error) {
		console.error('Error in sendEmail function:', error);
		// Even if logging fails, don't block the application
		return true;
	}
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
The Job Board Team
		`.trim(),
		html: `
<h2>Your job board is ready!</h2>
<p>Hello!</p>
<p>Your job board "<strong>${communityName}</strong>" has been created successfully.</p>
<p><a href="${magicLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Access Admin Panel</a></p>
<p><small>This link will expire in 24 hours for security reasons.</small></p>
<p>Best regards,<br>The Job Board Team</p>
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

This link will expire in 24 hours for security reasons.

Best regards,
The Job Board Team
		`.trim(),
		html: `
<h2>Job posted successfully!</h2>
<p>Hello!</p>
<p>Your job posting "<strong>${jobTitle}</strong>" has been submitted successfully.</p>
<p><a href="${magicLink}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Edit Job Posting</a></p>
<p><small>This link will expire in 24 hours for security reasons.</small></p>
<p>Best regards,<br>The Job Board Team</p>
		`.trim()
	};
}