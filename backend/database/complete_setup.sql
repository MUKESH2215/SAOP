-- Complete Database Setup for SAOP
-- Run this file to create all tables and insert test users
-- This combines schema creation and test data insertion

DROP DATABASE IF EXISTS saop;
CREATE DATABASE saop;
USE saop;

-- Create users table
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `role` ENUM('admin','faculty','student') NOT NULL,
  `profile_image` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_email` (`email`),
  INDEX `idx_user_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create courses table
CREATE TABLE `courses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_code` VARCHAR(20) NOT NULL UNIQUE,
  `course_name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `faculty_id` INT NULL,
  `semester` VARCHAR(50) NULL,
  `credits` INT DEFAULT 3,
  `max_students` INT DEFAULT 100,
  `status` ENUM('active','inactive','archived') DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_course_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_course_code` (`course_code`),
  INDEX `idx_course_faculty` (`faculty_id`),
  INDEX `idx_course_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create course_enrollments table
CREATE TABLE `course_enrollments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  `enrollment_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `grade` VARCHAR(5) NULL,
  `progress` INT DEFAULT 0,
  `status` ENUM('active','dropped','completed') DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_enrollment_student` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_enrollment_course` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_enrollment` (`student_id`, `course_id`),
  INDEX `idx_enrollment_student` (`student_id`),
  INDEX `idx_enrollment_course` (`course_id`),
  INDEX `idx_enrollment_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create assignments table
CREATE TABLE `assignments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `due_date` DATETIME NOT NULL,
  `total_points` INT DEFAULT 100,
  `status` ENUM('draft','published','closed') DEFAULT 'draft',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_assignment_course` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  INDEX `idx_assignment_course` (`course_id`),
  INDEX `idx_assignment_due_date` (`due_date`),
  INDEX `idx_assignment_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create assignment_submissions table
CREATE TABLE `assignment_submissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `assignment_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `submission_text` TEXT NULL,
  `file_path` VARCHAR(255) NULL,
  `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `grade` INT NULL,
  `feedback` TEXT NULL,
  `status` ENUM('submitted','graded','late','pending') DEFAULT 'pending',
  `graded_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_submission_assignment` FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_submission_student` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_submission` (`assignment_id`, `student_id`),
  INDEX `idx_submission_assignment` (`assignment_id`),
  INDEX `idx_submission_student` (`student_id`),
  INDEX `idx_submission_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create course_materials table
CREATE TABLE `course_materials` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `file_type` VARCHAR(50) NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `file_size` VARCHAR(20) NULL,
  `uploaded_by` INT NOT NULL,
  `uploaded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_material_course` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_material_uploader` FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_material_course` (`course_id`),
  INDEX `idx_material_uploader` (`uploaded_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create schedules table
CREATE TABLE `schedules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT NOT NULL,
  `event_type` ENUM('class','exam','lab','tutorial') NOT NULL,
  `event_name` VARCHAR(255) NOT NULL,
  `day_of_week` VARCHAR(20) NULL,
  `start_time` TIME NULL,
  `end_time` TIME NULL,
  `location` VARCHAR(255) NULL,
  `event_date` DATE NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_schedule_course` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  INDEX `idx_schedule_course` (`course_id`),
  INDEX `idx_schedule_event_type` (`event_type`),
  INDEX `idx_schedule_event_date` (`event_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create notifications table
CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('info','warning','success','assignment','grade','announcement') DEFAULT 'info',
  `is_read` TINYINT(1) DEFAULT 0,
  `related_entity_type` VARCHAR(50) NULL,
  `related_entity_id` INT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_notification_user` (`user_id`),
  INDEX `idx_notification_read_status` (`is_read`),
  INDEX `idx_notification_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert test users
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@saop.com', 'admin123', 'System', 'Administrator', 'admin'),
('faculty@saop.com', 'faculty123', 'John', 'Doe', 'faculty'),
('student@saop.com', 'student123', 'Jane', 'Smith', 'student');

SELECT 'Database setup complete! Test users created.' AS Status;
SELECT id, email, first_name, last_name, role FROM users;
