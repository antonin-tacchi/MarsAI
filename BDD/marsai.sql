-- MarsAI Database Schema (Simplified)
-- Version: 2.0
-- Date: 2026-01-26
-- Description: Film festival platform with jury/admin validation system

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------
-- Database: `marsai`
-- --------------------------------------------------------

-- --------------------------------------------------------
-- Table: roles (Jury and Admin only)
-- --------------------------------------------------------

DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `roles` (`id`, `role_name`) VALUES
(1, 'Jury'),
(2, 'Admin');

-- --------------------------------------------------------
-- Table: users (Jury and Admin accounts only)
-- --------------------------------------------------------

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table: user_roles (Junction table)
-- --------------------------------------------------------

DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles` (
  `user_id` int NOT NULL,
  `role_id` int NOT NULL,
  PRIMARY KEY (`user_id`, `role_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `fk_ur_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ur_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table: categories
-- --------------------------------------------------------

DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `categories` (`id`, `name`, `description`) VALUES
(1, 'Futurisme Optimiste', 'Visions positives et inspirantes du futur'),
(2, 'Environnement', 'Futurs souhaitables autour de l''ecologie'),
(3, 'Societe', 'Relations humaines et organisation sociale du futur'),
(4, 'Technologie', 'Innovations technologiques au service de l''humanite'),
(5, 'Art et Culture', 'Expression artistique et culturelle future');

-- --------------------------------------------------------
-- Table: films (Film submissions with director info)
-- --------------------------------------------------------

DROP TABLE IF EXISTS `films`;
CREATE TABLE `films` (
  `id` int NOT NULL AUTO_INCREMENT,

  -- Film Information
  `title` varchar(255) NOT NULL,
  `country` varchar(100) DEFAULT NULL,
  `description` text,
  `film_url` varchar(500) DEFAULT NULL COMMENT 'URL to uploaded film file',
  `youtube_link` varchar(500) DEFAULT NULL COMMENT 'YouTube link (added later by admin)',
  `poster_url` varchar(500) DEFAULT NULL,
  `ai_tools_used` text COMMENT 'AI tools used (free text)',
  `ai_certification` tinyint(1) DEFAULT 0 COMMENT 'Certifies film was made with AI tools',

  -- Director Information
  `director_firstname` varchar(100) NOT NULL,
  `director_lastname` varchar(100) NOT NULL,
  `director_email` varchar(255) NOT NULL,
  `director_bio` text,
  `director_school` varchar(255) DEFAULT NULL COMMENT 'School or Collective',
  `director_website` varchar(500) DEFAULT NULL,
  `social_instagram` varchar(255) DEFAULT NULL,
  `social_youtube` varchar(255) DEFAULT NULL,
  `social_vimeo` varchar(255) DEFAULT NULL,

  -- Status and Tracking
  `status` enum('pending', 'approved', 'rejected') DEFAULT 'pending',
  `status_changed_at` datetime DEFAULT NULL,
  `status_changed_by` int DEFAULT NULL COMMENT 'User ID who changed the status',
  `rejection_reason` text COMMENT 'Reason for rejection (if rejected)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_director_email` (`director_email`),
  KEY `fk_status_changed_by` (`status_changed_by`),
  CONSTRAINT `fk_status_changed_by` FOREIGN KEY (`status_changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table: film_categories (Junction table)
-- --------------------------------------------------------

DROP TABLE IF EXISTS `film_categories`;
CREATE TABLE `film_categories` (
  `film_id` int NOT NULL,
  `category_id` int NOT NULL,
  PRIMARY KEY (`film_id`, `category_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `fk_fc_film` FOREIGN KEY (`film_id`) REFERENCES `films` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fc_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table: email_logs (Track sent emails)
-- --------------------------------------------------------

DROP TABLE IF EXISTS `email_logs`;
CREATE TABLE `email_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `film_id` int NOT NULL,
  `recipient_email` varchar(255) NOT NULL,
  `email_type` enum('submission_received', 'status_approved', 'status_rejected') NOT NULL,
  `sent_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `success` tinyint(1) DEFAULT 1,
  `error_message` text,
  PRIMARY KEY (`id`),
  KEY `fk_email_film` (`film_id`),
  CONSTRAINT `fk_email_film` FOREIGN KEY (`film_id`) REFERENCES `films` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table: festival_config
-- --------------------------------------------------------

DROP TABLE IF EXISTS `festival_config`;
CREATE TABLE `festival_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_start` datetime NOT NULL,
  `submission_end` datetime NOT NULL,
  `event_date` datetime DEFAULT NULL,
  `location` varchar(255) DEFAULT 'Marseille, La Plateforme',
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `festival_config` (`id`, `submission_start`, `submission_end`, `event_date`, `location`, `is_active`) VALUES
(1, '2026-01-20 00:00:00', '2026-03-20 23:59:59', '2026-06-15 18:00:00', 'Marseille, La Plateforme', 1);

-- --------------------------------------------------------
-- Default Admin Account
-- Email: admin@marsai.com
-- Password: admin123 (bcrypt hashed)
-- --------------------------------------------------------

INSERT INTO `users` (`id`, `name`, `email`, `password`, `created_at`) VALUES
(1, 'Admin MarsAI', 'admin@marsai.com', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOjL8N5M1R1qH0gL1V7mF3q.d3X5O5Ixe', NOW());

INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
(1, 2);

-- --------------------------------------------------------
-- Table: events
-- --------------------------------------------------------

DROP TABLE IF EXISTS `events`;
CREATE TABLE `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_type` enum('workshop', 'ceremony', 'screening', 'conference') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `event_date` datetime NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `max_attendees` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table: awards
-- --------------------------------------------------------

DROP TABLE IF EXISTS `awards`;
CREATE TABLE `awards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `award_name` varchar(100) NOT NULL,
  `award_type` enum('grand_prix', 'jury_prize', 'public_prize', 'special_mention') NOT NULL,
  `film_id` int DEFAULT NULL,
  `year` int NOT NULL,
  `description` text,
  `prize_amount` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `film_id` (`film_id`),
  CONSTRAINT `fk_award_film` FOREIGN KEY (`film_id`) REFERENCES `films` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table: newsletter_subscriptions
-- --------------------------------------------------------

DROP TABLE IF EXISTS `newsletter_subscriptions`;
CREATE TABLE `newsletter_subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `subscribed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
