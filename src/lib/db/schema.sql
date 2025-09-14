-- Job Portal Database Schema
-- Run these commands to set up your database tables

-- Communities table
CREATE TABLE communities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    admin_email TEXT NOT NULL,
    admin_token TEXT,
    admin_token_expires DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Jobs table
CREATE TABLE jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    community_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    category TEXT,
    job_type TEXT NOT NULL DEFAULT 'Full-time',
    remote INTEGER DEFAULT 0,
    salary_min INTEGER,
    salary_max INTEGER,
    description TEXT NOT NULL,
    contact_info TEXT,
    poster_email TEXT NOT NULL,
    edit_token TEXT,
    token_expires DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (community_id) REFERENCES communities(id)
);

-- Indexes for performance
CREATE INDEX idx_communities_slug ON communities(slug);
CREATE INDEX idx_jobs_community_id ON jobs(community_id);
CREATE INDEX idx_jobs_edit_token ON jobs(edit_token);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);