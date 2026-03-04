-- MarsAI Database Schema (Simplified)
-- Version: 2.2
-- Date: 2026-03-04
-- Description: Film festival platform with jury/admin validation system
-- Changelog v2.2:
--   - jury_assignments.status : ajout de la valeur 'passed' (film passe par le jury sans noter)
-- Changelog v2.1: 
--   - films.status : ajout de la valeur 'selected' (film selectionne par le jury)
--   - film_categories : ajout de assigned_by et assigned_at (traçabilite de l'assignation)

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
-- Table: roles (Jury, Super Jury, and Admin)
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
(2, 'Admin'),
(3, 'Super Jury');

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
  `profile_picture` varchar(500) DEFAULT NULL COMMENT 'URL photo de profil (obligatoire pour jury)',
  `role_title` varchar(255) DEFAULT NULL COMMENT 'Fonction du jury (ex: CHERCHEUSE IA / OPENAI)',
  `bio` text DEFAULT NULL COMMENT 'Description du membre du jury (optionnel)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_jury` (`id`)
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
  `title_english` varchar(255) DEFAULT NULL COMMENT 'English title for international audiences',
  `country` varchar(100) DEFAULT NULL COMMENT 'Country of origin',
  `description` text COMMENT 'Original description in the director''s language',
  `description_english` text COMMENT 'English description for international audiences',
  `film_url` varchar(500) DEFAULT NULL COMMENT 'URL to uploaded film file',
  `youtube_url` varchar(500) DEFAULT NULL COMMENT 'YouTube video URL for public viewing',
  `poster_url` varchar(500) DEFAULT NULL COMMENT 'Main poster image',
  `thumbnail_url` varchar(500) DEFAULT NULL COMMENT 'Small thumbnail for lists',
  `ai_tools_used` text COMMENT 'AI tools used (free text)',
  `ai_certification` tinyint(1) DEFAULT 0 COMMENT 'Certifies film was made with AI tools',
  `classification` varchar(50) DEFAULT NULL COMMENT 'Classification du film, ex: G, PG, PG-13, R',

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
  `status` enum('pending', 'approved', 'rejected', 'selected') DEFAULT 'pending' COMMENT 'pending=soumis, approved=validé admin, rejected=rejeté, selected=sélectionné jury',
  `status_changed_at` datetime DEFAULT NULL,
  `status_changed_by` int DEFAULT NULL COMMENT 'User ID who changed the status',
  `rejection_reason` text COMMENT 'Reason for rejection (if rejected)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_director_email` (`director_email`),
  KEY `idx_status_created` (`status`, `created_at`),
  KEY `idx_director_email_created` (`director_email`, `created_at`),
  KEY `fk_status_changed_by` (`status_changed_by`),
  CONSTRAINT `fk_status_changed_by` FOREIGN KEY (`status_changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table: film_categories (Junction table)
-- Assignee par le jury au moment de la selection d'un film (status = 'selected')
-- --------------------------------------------------------

DROP TABLE IF EXISTS `film_categories`;
CREATE TABLE `film_categories` (
  `film_id` int NOT NULL,
  `category_id` int NOT NULL,
  `assigned_by` int DEFAULT NULL COMMENT 'Jury member who assigned the category',
  `assigned_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Date of category assignment',
  PRIMARY KEY (`film_id`, `category_id`),
  KEY `category_id` (`category_id`),
  KEY `fk_fc_assigned_by` (`assigned_by`),
  CONSTRAINT `fk_fc_film` FOREIGN KEY (`film_id`) REFERENCES `films` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fc_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fc_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
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
  KEY `idx_recipient_email` (`recipient_email`),
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
-- Table: awards (Prix basés sur le classement des notes)
-- --------------------------------------------------------

DROP TABLE IF EXISTS `awards`;
CREATE TABLE `awards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `film_id` int NOT NULL COMMENT 'Film gagnant',
  `category_id` int DEFAULT NULL COMMENT 'Catégorie du prix (NULL = toutes catégories)',
  `rank` int NOT NULL COMMENT 'Classement: 1=1er, 2=2ème, 3=3ème...',
  `award_type` enum('grand_prix', 'jury_prize', 'public_prize', 'special_mention', 'gold', 'silver', 'bronze') NOT NULL,
  `award_name` varchar(100) NOT NULL COMMENT 'Nom du prix affiché',
  `final_score` decimal(3,2) DEFAULT NULL COMMENT 'Moyenne des notes au moment du prix',
  `year` int NOT NULL,
  `description` text,
  `prize_amount` decimal(10,2) DEFAULT NULL COMMENT 'Montant en euros',
  `awarded_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Date de remise du prix',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_film_category_year` (`film_id`, `category_id`, `year`),
  KEY `fk_award_film` (`film_id`),
  KEY `fk_award_category` (`category_id`),
  KEY `idx_year_rank` (`year`, `rank`),
  CONSTRAINT `fk_award_film` FOREIGN KEY (`film_id`) REFERENCES `films` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_award_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table: jury_lists (Named film lists created by Super Jury)
-- --------------------------------------------------------

DROP TABLE IF EXISTS `jury_lists`;
CREATE TABLE `jury_lists` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_by` int NOT NULL COMMENT 'Super Jury who created the list',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_jl_creator` (`created_by`),
  CONSTRAINT `fk_jl_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table: jury_list_films (Films belonging to a jury list)
-- --------------------------------------------------------

DROP TABLE IF EXISTS `jury_list_films`;
CREATE TABLE `jury_list_films` (
  `list_id` int NOT NULL,
  `film_id` int NOT NULL,
  PRIMARY KEY (`list_id`, `film_id`),
  KEY `fk_jlf_film` (`film_id`),
  CONSTRAINT `fk_jlf_list` FOREIGN KEY (`list_id`) REFERENCES `jury_lists` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_jlf_film` FOREIGN KEY (`film_id`) REFERENCES `films` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table: jury_list_assignments (Assign a list to a jury member)
-- --------------------------------------------------------

DROP TABLE IF EXISTS `jury_list_assignments`;
CREATE TABLE `jury_list_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `list_id` int NOT NULL,
  `jury_id` int NOT NULL,
  `assigned_by` int NOT NULL,
  `assigned_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_list_jury` (`list_id`, `jury_id`),
  KEY `fk_jla_jury` (`jury_id`),
  KEY `fk_jla_assigner` (`assigned_by`),
  CONSTRAINT `fk_jla_list` FOREIGN KEY (`list_id`) REFERENCES `jury_lists` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_jla_jury` FOREIGN KEY (`jury_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_jla_assigner` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table: jury_assignments (Super Jury assigns films to Jury)
-- --------------------------------------------------------

DROP TABLE IF EXISTS `jury_assignments`;
CREATE TABLE `jury_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `jury_id` int NOT NULL COMMENT 'Jury member assigned to review',
  `film_id` int NOT NULL,
  `list_id` int DEFAULT NULL COMMENT 'Jury list this assignment belongs to',
  `assigned_by` int NOT NULL COMMENT 'Super Jury who made the assignment',
  `assigned_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` enum('active','refused','passed') NOT NULL DEFAULT 'active' COMMENT 'Assignment status: active=en cours, refused=refusé par jury, passed=passé sans noter',
  `refusal_reason` text DEFAULT NULL COMMENT 'Reason if jury refused the film',
  `refused_at` datetime DEFAULT NULL COMMENT 'Timestamp of refusal',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_jury_film_assignment` (`jury_id`, `film_id`),
  KEY `fk_ja_jury` (`jury_id`),
  KEY `fk_ja_film` (`film_id`),
  KEY `fk_ja_assigner` (`assigned_by`),
  KEY `fk_ja_list` (`list_id`),
  KEY `idx_ja_status` (`status`),
  CONSTRAINT `fk_ja_jury` FOREIGN KEY (`jury_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ja_film` FOREIGN KEY (`film_id`) REFERENCES `films` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ja_assigner` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ja_list` FOREIGN KEY (`list_id`) REFERENCES `jury_lists` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table: jury_ratings (Jury film ratings)
-- --------------------------------------------------------

DROP TABLE IF EXISTS `jury_ratings`;
CREATE TABLE `jury_ratings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `film_id` int NOT NULL,
  `user_id` int NOT NULL COMMENT 'Jury member who rated',
  `rating` int NOT NULL COMMENT 'Rating from 0 to 10',
  `comment` text COMMENT 'Optional comment',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_jury_film` (`film_id`, `user_id`),
  KEY `fk_rating_film` (`film_id`),
  KEY `fk_rating_user` (`user_id`),
  KEY `idx_user_updated` (`user_id`, `updated_at`),
  CONSTRAINT `fk_rating_film` FOREIGN KEY (`film_id`) REFERENCES `films` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rating_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_rating_range` CHECK (`rating` >= 0 AND `rating` <= 10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table: invitations (Admin/Jury invitations)
-- --------------------------------------------------------

DROP TABLE IF EXISTS `invitations`;
CREATE TABLE `invitations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `role_id` int NOT NULL COMMENT '1=Jury, 2=Admin, 3=Super Jury',
  `token` varchar(255) NOT NULL,
  `invited_by` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime NOT NULL,
  `accepted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `idx_inv_email` (`email`),
  KEY `fk_inv_role` (`role_id`),
  KEY `fk_inv_user` (`invited_by`),
  CONSTRAINT `fk_inv_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `fk_inv_user` FOREIGN KEY (`invited_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table: site_pages (CMS-like editable page content)
-- --------------------------------------------------------

DROP TABLE IF EXISTS `site_pages`;
CREATE TABLE `site_pages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `slug` varchar(50) NOT NULL COMMENT 'Page identifier (e.g. home)',
  `content_fr` json DEFAULT NULL COMMENT 'French content as JSON',
  `content_en` json DEFAULT NULL COMMENT 'English content as JSON',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_slug` (`slug`),
  KEY `fk_sp_user` (`updated_by`),
  CONSTRAINT `fk_sp_user` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Default home page content
INSERT INTO `site_pages` (`slug`, `content_fr`, `content_en`) VALUES
('home', JSON_OBJECT(
  'hero', JSON_OBJECT(
    'title', 'MarsAI Festival',
    'subtitle', 'Le premier festival international du film réalisé avec l''intelligence artificielle',
    'backgroundImage', ''
  ),
  'about', JSON_OBJECT(
    'title', 'À propos du festival',
    'text', 'MarsAI est un festival unique dédié aux films créés avec l''aide de l''intelligence artificielle. Rejoignez-nous pour découvrir le futur du cinéma.'
  ),
  'dates', JSON_OBJECT(
    'title', 'Dates clés',
    'items', JSON_ARRAY(
      JSON_OBJECT('label', 'Soumissions', 'date', '20 Jan - 20 Mars 2026'),
      JSON_OBJECT('label', 'Sélection du jury', 'date', 'Avril 2026'),
      JSON_OBJECT('label', 'Cérémonie', 'date', '15 Juin 2026')
    )
  ),
  'cta', JSON_OBJECT(
    'title', 'Participez au festival',
    'text', 'Soumettez votre film réalisé avec l''IA et tentez de remporter un prix.',
    'buttonText', 'Soumettre un film',
    'buttonLink', '/submissions'
  )
), JSON_OBJECT(
  'hero', JSON_OBJECT(
    'title', 'MarsAI Festival',
    'subtitle', 'The first international film festival for AI-made cinema',
    'backgroundImage', ''
  ),
  'about', JSON_OBJECT(
    'title', 'About the festival',
    'text', 'MarsAI is a unique festival dedicated to films created with the help of artificial intelligence. Join us to discover the future of cinema.'
  ),
  'dates', JSON_OBJECT(
    'title', 'Key dates',
    'items', JSON_ARRAY(
      JSON_OBJECT('label', 'Submissions', 'date', 'Jan 20 - Mar 20, 2026'),
      JSON_OBJECT('label', 'Jury selection', 'date', 'April 2026'),
      JSON_OBJECT('label', 'Ceremony', 'date', 'June 15, 2026')
    )
  ),
  'cta', JSON_OBJECT(
    'title', 'Join the festival',
    'text', 'Submit your AI-made film and compete for an award.',
    'buttonText', 'Submit a film',
    'buttonLink', '/submissions'
  )
));

-- --------------------------------------------------------
-- Sample films for testing
-- --------------------------------------------------------

INSERT INTO `films` (`title`, `country`, `description`, `youtube_url`, `ai_tools_used`, `ai_certification`, `director_firstname`, `director_lastname`, `director_email`, `director_school`, `status`, `created_at`) VALUES
('Sunspring', 'United States', 'A sci-fi short film written entirely by an AI named Benjamin. The AI was fed dozens of sci-fi screenplays and generated this bizarre, fascinating script that human actors brought to life.', 'https://www.youtube.com/watch?v=LY7x2Ihqjmc', 'GPT-2, Neural Network Scriptwriting', 1, 'Oscar', 'Sharp', 'oscar.sharp@example.com', 'NYU Tisch', 'approved', NOW()),
('The Frost', 'France', 'An experimental animated short exploring themes of climate change through AI-generated imagery. Each frame was created using Midjourney and assembled into a haunting visual narrative about our frozen future.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Midjourney, Runway ML, Stable Diffusion', 1, 'Marie', 'Dubois', 'marie.dubois@example.com', 'Les Gobelins', 'approved', NOW()),
('Digital Dreams', 'Japan', 'A short documentary about the intersection of traditional Japanese art and artificial intelligence, featuring interviews with artists who use AI as a creative partner.', 'https://www.youtube.com/watch?v=LY7x2Ihqjmc', 'DALL-E, ChatGPT, Suno AI', 1, 'Yuki', 'Tanaka', 'yuki.tanaka@example.com', 'Tokyo University of the Arts', 'approved', NOW()),
('Mars Colony 2084', 'Germany', 'A speculative fiction piece imagining life on Mars, where AI systems manage the colony ecosystem. Created using a combination of AI video generation and traditional filmmaking techniques.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Sora, ElevenLabs, Midjourney', 1, 'Hans', 'Mueller', 'hans.mueller@example.com', 'Filmakademie Baden-Wuerttemberg', 'approved', NOW());

-- --------------------------------------------------------
-- View: view_jury_members (for jury profile queries)
-- --------------------------------------------------------

CREATE OR REPLACE VIEW `view_jury_members` AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.profile_picture,
    u.role_title,
    u.bio,
    u.created_at
FROM users u
INNER JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.role_id = 1
ORDER BY u.name ASC;

COMMIT;

-- --------------------------------------------------------
-- Table: partners
-- --------------------------------------------------------

DROP TABLE IF EXISTS `partners`;
CREATE TABLE `partners` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `logo` VARCHAR(500) NOT NULL,
  `url` VARCHAR(500) NOT NULL,
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_display_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `partners` (`name`, `logo`, `url`, `display_order`) VALUES
('La Plateforme', 'https://via.placeholder.com/200x80/463699/ffffff?text=La+Plateforme', 'https://laplateforme.io', 1),
('Ville de Marseille', 'https://via.placeholder.com/200x80/8A83DA/ffffff?text=Marseille', 'https://marseille.fr', 2),
('Région Sud', 'https://via.placeholder.com/200x80/C7C2CE/262335?text=Region+Sud', 'https://maregionsud.fr', 3),
('OpenAI', 'https://via.placeholder.com/200x80/FBD5BD/262335?text=OpenAI', 'https://openai.com', 4),
('Anthropic', 'https://via.placeholder.com/200x80/FBF5F0/262335?text=Anthropic', 'https://anthropic.com', 5);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;