-- Create Database
CREATE DATABASE IF NOT EXISTS career_automation_hub;
USE career_automation_hub;

-- 1. USERS: Profile details & matching parameters
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    skills_keywords TEXT NOT NULL, -- Comma-separated target skills (e.g., 'React,Node.js,MySQL')
    min_match_score INT DEFAULT 70,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. COMPANIES: Target career portals
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL UNIQUE,
    career_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. JOBS: The Master Aggregated Job Repository
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    location VARCHAR(255) NOT NULL,
    experience VARCHAR(100) NULL,
    skills TEXT NULL, -- Extracted skills from job posting
    employment_type VARCHAR(100) NULL, -- 'Full-Time', 'Internship'
    salary VARCHAR(100) NULL,
    work_mode VARCHAR(50) DEFAULT 'Onsite', -- 'Remote', 'Hybrid', 'Onsite'
    apply_url TEXT NOT NULL,
    posted_date DATE NULL,
    unique_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA-256 fingerprint for database deduplication
    discovered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 4. APPLICATIONS: User job matching profiles & Kanban tracker states
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    job_id INT NOT NULL,
    match_score INT NOT NULL,
    is_notified BOOLEAN DEFAULT FALSE,
    notified_at DATETIME NULL,
    status VARCHAR(50) DEFAULT 'Saved', -- 'Saved', 'Applied', 'Interview Scheduled', 'Rejected', 'Offer'
    saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_job (user_id, job_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- 5. SCAN_LOGS: System operational history & scraper heartbeat monitoring
CREATE TABLE IF NOT EXISTS scan_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NULL,
    jobs_found INT DEFAULT 0,
    jobs_added INT DEFAULT 0,
    status VARCHAR(50) NOT NULL, -- 'SUCCESS', 'FAILED', 'LAYOUT_CHANGED'
    error_message TEXT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);
