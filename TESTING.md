# Testing Guide for Job Board

This guide will walk you through testing all the job board functionality step by step.

## Prerequisites

1. **Set up Turso Database:**
   ```bash
   # Install Turso CLI (if not already installed)
   curl -sSfL https://get.tur.so/install.sh | bash
   
   # Login to Turso
   turso auth login
   
   # Create a new database
   turso db create job-board-test
   
   # Get the database URL
   turso db show job-board-test
   
   # Create an auth token
   turso db tokens create job-board-test
   ```

2. **Update Environment Variables:**
   
   Update `.env.local` with your Turso credentials:
   ```env
   PUBLIC_TURSO_DATABASE_URL=libsql://your-database-name.turso.io
   PUBLIC_TURSO_AUTH_TOKEN=your-auth-token-here
   TURSO_DATABASE_URL=libsql://your-database-name.turso.io
   TURSO_AUTH_TOKEN=your-auth-token-here
   ```

## Quick Setup & Test

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the test setup script:**
   ```bash
   node test-setup.js
   ```
   
   This will:
   - Test your database connection
   - Initialize the database schema
   - Create sample data for testing
   - Provide test URLs

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## Manual Testing Steps

### 1. Test Board Creation

1. **Visit the homepage:**
   ```
   http://localhost:5173
   ```

2. **Create a new job board:**
   - Click "Create Job Board" or visit `/create-job-board`
   - Fill in:
     - Name: "My Test Board"
     - Email: your-email@example.com
     - Description: "Testing the job board functionality"
   - Submit the form

3. **Check the console output:**
   - You should see a magic link email logged to the console
   - Copy the admin token from the console output

4. **Verify redirect:**
   - You should be redirected to `/my-test-board-xxxx?created=true`
   - The page should show your new job board

### 2. Test Job Posting

1. **Visit your job board:**
   ```
   http://localhost:5173/your-board-slug
   ```

2. **Post a new job:**
   - Click "Post a Job" or visit `/your-board-slug/post-job`
   - Fill in the job details:
     - Title: "Test Developer Position"
     - Description: "This is a test job posting"
     - Contact Info: "Apply at test@example.com"
     - Your Email: your-email@example.com
   - Submit the form

3. **Check the console output:**
   - You should see a magic link email for editing the job
   - Copy the edit token from the console output

4. **Verify the job appears:**
   - You should be redirected back to the job board
   - Your new job should appear in the list

### 3. Test Job Editing

1. **Use the edit magic link:**
   ```
   http://localhost:5173/edit-job?token=your-edit-token
   ```

2. **Edit the job:**
   - Modify the title, description, or contact info
   - Click "Update Job"
   - Verify the changes are saved

3. **Test job deletion:**
   - On the same edit page, click "Delete Job Posting"
   - Confirm the deletion
   - Verify the job is removed

### 4. Test Admin Panel

1. **Use the admin magic link:**
   ```
   http://localhost:5173/your-board-slug/admin?token=your-admin-token
   ```

2. **View admin dashboard:**
   - You should see all jobs posted to your board
   - You should see board statistics

3. **Delete individual jobs:**
   - Click "Delete" next to any job
   - Confirm the deletion
   - Verify the job is removed

4. **Delete entire board:**
   - Click "Delete Board" (usually in a danger zone)
   - Confirm the deletion
   - You should be redirected to the homepage

## Testing Checklist

### ✅ Board Creation
- [ ] Form validation works (required fields)
- [ ] Email validation works
- [ ] Unique slug generation works
- [ ] Database record is created
- [ ] Magic link email is logged to console
- [ ] Redirect to new board works

### ✅ Job Posting
- [ ] Form validation works
- [ ] Job is saved to database
- [ ] Job appears on board immediately
- [ ] Edit magic link email is logged to console
- [ ] Redirect back to board works

### ✅ Job Editing
- [ ] Edit token validation works
- [ ] Job details load correctly
- [ ] Updates save to database
- [ ] Job deletion works
- [ ] Expired tokens are rejected

### ✅ Admin Panel
- [ ] Admin token validation works
- [ ] All jobs display correctly
- [ ] Individual job deletion works
- [ ] Board deletion works
- [ ] Expired tokens are rejected

### ✅ Error Handling
- [ ] Invalid slugs return 404
- [ ] Expired tokens return appropriate errors
- [ ] Database errors are handled gracefully
- [ ] Form validation prevents bad data

## Debugging Tips

1. **Check the browser console** for JavaScript errors
2. **Check the terminal console** for server errors and email logs
3. **Verify your `.env.local`** file has correct Turso credentials
4. **Test database connection** using the test-setup.js script
5. **Check network tab** in browser dev tools for API request/response details

## Sample Test Data

If you ran the test setup script, you'll have:

- **Test Board:** `test-jobs-board`
- **Sample Jobs:** Frontend Developer, UX Designer
- **Admin Access:** Check console output for admin token
- **Test URLs:** All provided in the setup script output

## Production Testing

When testing in production:

1. **Configure real email service** in `src/lib/email.ts`
2. **Use production Turso database**
3. **Test email delivery** for magic links
4. **Verify HTTPS** for secure token transmission
5. **Test token expiration** (24-hour limit)

## Common Issues

- **Database connection fails:** Check Turso credentials
- **Tokens don't work:** Verify token hasn't expired (24 hours)
- **Emails not sending:** Currently using console logging for development
- **404 errors:** Check that board slug exists in database
- **Form validation errors:** Ensure all required fields are filled