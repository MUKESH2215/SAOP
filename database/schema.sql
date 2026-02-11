-- SAOP Database Schema
-- Sustainable Academic Operations Platform

-- Step 1: Create database
CREATE DATABASE IF NOT EXISTS `saop`;
USE `saop`;

CREATE TABLE IF NOT EXISTS `Users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `passwordHash` VARCHAR(255) NOT NULL,
  `firstName` VARCHAR(100) NOT NULL,
  `lastName` VARCHAR(100) NOT NULL,
  `role` ENUM('admin','faculty','student') NOT NULL,
  `profileImage` VARCHAR(255) NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_email` (`email`),
  INDEX `idx_user_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Courses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `courseCode` VARCHAR(20) NOT NULL UNIQUE,
  `courseName` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `facultyId` INT NULL,
  `semester` VARCHAR(50) NULL,
  `credits` INT DEFAULT 3,
  `maxStudents` INT DEFAULT 100,
  `status` ENUM('active','inactive','archived') DEFAULT 'active',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_course_faculty` FOREIGN KEY (`facultyId`) REFERENCES `Users`(`id`) ON DELETE SET NULL,
  INDEX `idx_course_code` (`courseCode`),
  INDEX `idx_course_faculty` (`facultyId`),
  INDEX `idx_course_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `CourseEnrollments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `studentId` INT NOT NULL,
  `courseId` INT NOT NULL,
  `enrollmentDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `grade` VARCHAR(5) NULL,
  `progress` INT DEFAULT 0,
  `status` ENUM('active','dropped','completed') DEFAULT 'active',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_enrollment_student` FOREIGN KEY (`studentId`) REFERENCES `Users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_enrollment_course` FOREIGN KEY (`courseId`) REFERENCES `Courses`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_enrollment` (`studentId`, `courseId`),
  INDEX `idx_enrollment_student` (`studentId`),
  INDEX `idx_enrollment_course` (`courseId`),
  INDEX `idx_enrollment_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Assignments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `courseId` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `dueDate` DATETIME NOT NULL,
  `totalPoints` INT DEFAULT 100,
  `status` ENUM('draft','published','closed') DEFAULT 'draft',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_assignment_course` FOREIGN KEY (`courseId`) REFERENCES `Courses`(`id`) ON DELETE CASCADE,
  INDEX `idx_assignment_course` (`courseId`),
  INDEX `idx_assignment_due_date` (`dueDate`),
  INDEX `idx_assignment_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `AssignmentSubmissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `assignmentId` INT NOT NULL,
  `studentId` INT NOT NULL,
  `submissionText` TEXT NULL,
  `filePath` VARCHAR(255) NULL,
  `submittedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `grade` INT NULL,
  `feedback` TEXT NULL,
  `status` ENUM('submitted','graded','late','pending') DEFAULT 'pending',
  `gradedAt` DATETIME NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_submission_assignment` FOREIGN KEY (`assignmentId`) REFERENCES `Assignments`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_submission_student` FOREIGN KEY (`studentId`) REFERENCES `Users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_submission` (`assignmentId`, `studentId`),
  INDEX `idx_submission_assignment` (`assignmentId`),
  INDEX `idx_submission_student` (`studentId`),
  INDEX `idx_submission_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `CourseMaterials` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `courseId` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `fileType` VARCHAR(50) NULL,
  `filePath` VARCHAR(255) NOT NULL,
  `fileSize` VARCHAR(20) NULL,
  `uploadedBy` INT NOT NULL,
  `uploadedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_material_course` FOREIGN KEY (`courseId`) REFERENCES `Courses`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_material_uploader` FOREIGN KEY (`uploadedBy`) REFERENCES `Users`(`id`) ON DELETE CASCADE,
  INDEX `idx_material_course` (`courseId`),
  INDEX `idx_material_uploader` (`uploadedBy`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Schedules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `courseId` INT NOT NULL,
  `eventType` ENUM('class','exam','lab','tutorial') NOT NULL,
  `eventName` VARCHAR(255) NOT NULL,
  `dayOfWeek` VARCHAR(20) NULL,
  `startTime` TIME NULL,
  `endTime` TIME NULL,
  `location` VARCHAR(255) NULL,
  `eventDate` DATE NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_schedule_course` FOREIGN KEY (`courseId`) REFERENCES `Courses`(`id`) ON DELETE CASCADE,
  INDEX `idx_schedule_course` (`courseId`),
  INDEX `idx_schedule_event_type` (`eventType`),
  INDEX `idx_schedule_event_date` (`eventDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('info','warning','success','assignment','grade','announcement') DEFAULT 'info',
  `isRead` TINYINT(1) DEFAULT 0,
  `relatedEntityType` VARCHAR(50) NULL,
  `relatedEntityId` INT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_notification_user` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE,
  INDEX `idx_notification_user` (`userId`),
  INDEX `idx_notification_read_status` (`isRead`),
  INDEX `idx_notification_created` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Step 3: Verify tables created
SELECT 'Tables created successfully!' AS Status;
SHOW TABLES;