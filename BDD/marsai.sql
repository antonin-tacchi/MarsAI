-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : lun. 19 jan. 2026 à 13:38
-- Version du serveur : 9.1.0
-- Version de PHP : 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `marsai`
--

-- --------------------------------------------------------

--
-- Structure de la table `awards`
--

DROP TABLE IF EXISTS `awards`;
CREATE TABLE IF NOT EXISTS `awards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `award_name` varchar(100) NOT NULL,
  `award_type` enum('grand_prix','jury_prize','public_prize','special_mention') NOT NULL,
  `film_id` int DEFAULT NULL,
  `year` int NOT NULL,
  `description` text,
  `prize_amount` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `film_id` (`film_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `awards`
--

INSERT INTO `awards` (`id`, `award_name`, `award_type`, `film_id`, `year`, `description`, `prize_amount`) VALUES
(1, 'Grand Prix MarsAI 2025', 'grand_prix', 1, 2025, 'Meilleur film de l\'édition 2025', 5000.00),
(2, 'Prix du Jury', 'jury_prize', 2, 2025, 'Choix du jury professionnel', 3000.00),
(3, 'Prix du Public', 'public_prize', 3, 2025, 'Film le plus voté par le public', 2000.00),
(4, 'Mention Spéciale - Innovation IA', 'special_mention', 4, 2025, 'Pour l\'utilisation innovante de l\'IA', 1000.00),
(5, 'Mention Spéciale - Narration', 'special_mention', 5, 2025, 'Pour l\'excellence de la narration', 1000.00),
(6, 'Prix Environnement', 'special_mention', 10, 2025, 'Meilleur film sur la thématique environnementale', 1500.00),
(7, 'Prix Afrofuturisme', 'special_mention', 23, 2025, 'Récompense la vision afrofuturiste exceptionnelle', 1500.00),
(8, 'Prix Coup de Coeur', 'special_mention', 18, 2025, 'Coup de coeur du jury pour l\'originalité', 1000.00),
(9, 'Prix de la Diversité', 'special_mention', 29, 2025, 'Pour la représentation de la diversité culturelle', 1500.00),
(10, 'Prix Jeune Talent', 'special_mention', 16, 2025, 'Récompense un réalisateur émergent prometteur', 2000.00);

-- --------------------------------------------------------

--
-- Structure de la table `categories`
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`) VALUES
(1, 'Futurisme Optimiste', 'Visions positives et inspirantes du futur'),
(2, 'Environnement', 'Futurs souhaitables autour de l\'écologie'),
(3, 'Société', 'Relations humaines et organisation sociale du futur'),
(4, 'Technologie', 'Innovations technologiques au service de l\'humanité'),
(5, 'Art et Culture', 'Expression artistique et culturelle future');

-- --------------------------------------------------------

--
-- Structure de la table `events`
--

DROP TABLE IF EXISTS `events`;
CREATE TABLE IF NOT EXISTS `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_type` enum('workshop','ceremony','screening','conference') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `event_date` datetime NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `max_attendees` int DEFAULT NULL,
  `current_attendees` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `events`
--

INSERT INTO `events` (`id`, `event_type`, `title`, `description`, `event_date`, `location`, `max_attendees`, `current_attendees`) VALUES
(1, 'workshop', 'Atelier : Créer des visuels avec Midjourney', 'Découvrez comment utiliser Midjourney pour créer des visuels époustouflants pour vos films', '2026-02-15 14:00:00', 'La Plateforme - Salle A', 30, 12),
(2, 'workshop', 'Atelier : Scénarisation assistée par IA', 'Apprenez à utiliser ChatGPT et Claude pour développer vos scénarios', '2026-02-22 10:00:00', 'La Plateforme - Salle B', 25, 8),
(3, 'conference', 'Conférence : L\'avenir du cinéma à l\'ère de l\'IA', 'Table ronde avec des experts du cinéma et de l\'intelligence artificielle', '2026-03-10 18:00:00', 'La Plateforme - Auditorium', 100, 45),
(4, 'screening', 'Projection des films sélectionnés', 'Découvrez les films en compétition avant le vote final', '2026-06-10 19:00:00', 'Cinéma Le Chambord, Marseille', 200, 78),
(5, 'ceremony', 'Cérémonie de remise des prix MarsAI 2026', 'Soirée de gala et annonce des lauréats', '2026-06-15 18:00:00', 'La Plateforme - Grand Hall', 150, 92),
(6, 'workshop', 'Post-production avec RunwayML', 'Masterclass sur les techniques de post-production IA', '2026-03-05 15:00:00', 'La Plateforme - Salle C', 20, 15),
(7, 'conference', 'Éthique et IA dans la création artistique', 'Débat sur les enjeux éthiques de l\'IA générative', '2026-04-12 17:00:00', 'La Plateforme - Auditorium', 80, 34);

-- --------------------------------------------------------

--
-- Structure de la table `event_registrations`
--

DROP TABLE IF EXISTS `event_registrations`;
CREATE TABLE IF NOT EXISTS `event_registrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `user_id` int NOT NULL,
  `registered_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_registration` (`event_id`,`user_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `event_registrations`
--

INSERT INTO `event_registrations` (`id`, `event_id`, `user_id`, `registered_at`) VALUES
(1, 1, 1, '2026-01-20 10:30:00'),
(2, 1, 2, '2026-01-20 11:15:00'),
(3, 1, 3, '2026-01-20 14:22:00'),
(4, 2, 1, '2026-01-21 09:00:00'),
(5, 2, 4, '2026-01-21 10:45:00'),
(6, 3, 5, '2026-01-22 16:30:00'),
(7, 3, 6, '2026-01-22 17:00:00'),
(8, 4, 1, '2026-01-23 12:00:00'),
(9, 4, 2, '2026-01-23 13:30:00'),
(10, 4, 3, '2026-01-23 14:15:00'),
(11, 5, 1, '2026-01-24 08:00:00'),
(12, 5, 2, '2026-01-24 08:30:00'),
(13, 5, 7, '2026-01-24 09:00:00'),
(14, 6, 3, '2026-01-25 11:00:00'),
(15, 7, 5, '2026-01-26 15:00:00');

-- --------------------------------------------------------

--
-- Structure de la table `festival_config`
--

DROP TABLE IF EXISTS `festival_config`;
CREATE TABLE IF NOT EXISTS `festival_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_start` datetime NOT NULL,
  `submission_end` datetime NOT NULL,
  `event_date` datetime DEFAULT NULL,
  `location` varchar(255) DEFAULT 'Marseille, La Plateforme',
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `festival_config`
--

INSERT INTO `festival_config` (`id`, `submission_start`, `submission_end`, `event_date`, `location`, `is_active`) VALUES
(1, '2026-01-20 00:00:00', '2026-03-20 23:59:59', '2026-06-15 18:00:00', 'Marseille, La Plateforme', 1);

-- --------------------------------------------------------

--
-- Structure de la table `films`
--

DROP TABLE IF EXISTS `films`;
CREATE TABLE IF NOT EXISTS `films` (
  `id` int NOT NULL AUTO_INCREMENT,
  `director_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `duration` int NOT NULL,
  `ai_url` varchar(255) DEFAULT NULL,
  `poster_url` varchar(255) DEFAULT NULL,
  `description` text,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `country` varchar(100) DEFAULT NULL,
  `language` varchar(50) DEFAULT 'en',
  `category` varchar(100) DEFAULT NULL,
  `team_members` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_created_at` (`created_at`),
  KEY `fk_film_director` (`director_id`),
  KEY `idx_category` (`category`),
  KEY `idx_status_category` (`status`,`category`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `films`
--

INSERT INTO `films` (`id`, `director_id`, `title`, `duration`, `ai_url`, `poster_url`, `description`, `status`, `country`, `language`, `category`, `team_members`, `created_at`) VALUES
(1, 1, 'L\'Aube Verte', 8, 'https://vimeo.com/example1', 'https://picsum.photos/400/600?random=1', 'Dans un futur proche, une mégalopole découvre comment reverdir ses espaces urbains grâce à une IA biomimétique. Une célébration de la symbiose entre nature et technologie.', 'approved', 'France', 'fr', 'Environnement', 'Sophie Martin (Réalisation), Jean Dupont (Sound Design)', '2026-01-10 10:00:00'),
(2, 2, 'Quantum Dreams', 12, 'https://vimeo.com/example2', 'https://picsum.photos/400/600?random=2', 'A scientist develops an AI that can predict and visualize possible futures, leading to profound questions about free will and destiny.', 'approved', 'United States', 'en', 'Technologie', 'John Smith (Director/Writer)', '2026-01-12 14:30:00'),
(3, 3, 'Tokyo 2050: Harmonie', 10, 'https://vimeo.com/example3', 'https://picsum.photos/400/600?random=3', '東京の未来を描く。AIとロボットが人間と共存し、新しい文化を創造する物語。', 'approved', 'Japan', 'ja', 'Société', 'Yuki Tanaka (監督), Hiroshi Sato (美術)', '2026-01-15 09:00:00'),
(4, 4, 'El Jardín del Mañana', 7, 'https://vimeo.com/example4', 'https://picsum.photos/400/600?random=4', 'Un jardín comunitario en Barcelona se convierte en un modelo de agricultura urbana sostenible del futuro, gracias a la inteligencia artificial.', 'approved', 'Spain', 'es', 'Environnement', 'Maria Garcia (Directora), Pablo Martinez (Edición)', '2026-01-16 11:00:00'),
(5, 1, 'Mémoires Synthétiques', 15, 'https://vimeo.com/example5', 'https://picsum.photos/400/600?random=5', 'Un film expérimental qui explore comment l\'IA pourrait préserver et réinterpréter les souvenirs humains pour les générations futures.', 'approved', 'France', 'fr', 'Art et Culture', 'Sophie Martin (Conception), Marie Leblanc (Narration)', '2026-01-18 16:00:00'),
(6, 8, 'Les Architectes du Ciel', 9, 'https://vimeo.com/example6', 'https://picsum.photos/400/600?random=6', 'Des architectes utilisent l\'IA pour concevoir des villes flottantes qui pourraient résoudre la crise du logement mondial.', 'approved', 'France', 'fr', 'Futurisme Optimiste', 'Pierre Durand (Réalisateur)', '2026-01-17 13:00:00'),
(7, 9, 'The Last Library', 11, 'https://vimeo.com/example7', 'https://picsum.photos/400/600?random=7', 'In a world where all knowledge is digital, a young archivist discovers the last physical library and the AI guardian protecting it.', 'approved', 'China', 'zh', 'Art et Culture', 'Lisa Chen (Director), Wei Zhang (Writer)', '2026-01-14 08:00:00'),
(8, 10, 'Raíces Digitales', 6, 'https://vimeo.com/example8', 'https://picsum.photos/400/600?random=8', 'Una exploración poética de cómo la tecnología puede ayudar a preservar las lenguas indígenas en peligro de extinción.', 'pending', 'Mexico', 'es', 'Société', 'Carlos Rodriguez (Director)', '2026-01-19 12:00:00'),
(9, 2, 'Neural Symphony', 5, 'https://vimeo.com/example9', 'https://picsum.photos/400/600?random=9', 'An experimental short film visualizing how AI might compose music by directly interpreting human emotions.', 'approved', 'United States', 'en', 'Art et Culture', 'John Smith (Director/Composer)', '2026-01-13 15:00:00'),
(10, 3, 'Silent Ocean', 13, 'https://vimeo.com/example10', 'https://picsum.photos/400/600?random=10', '2070年、AIが海洋生態系を回復させる壮大なプロジェクトを描く。', 'approved', 'Japan', 'ja', 'Environnement', 'Yuki Tanaka (監督), Kenji Yamamoto (脚本)', '2026-01-11 10:30:00'),
(11, 4, 'Códigos de Esperanza', 8, 'https://vimeo.com/example11', 'https://picsum.photos/400/600?random=11', 'Jóvenes programadores crean una IA que ayuda a comunidades marginadas a acceder a educación de calidad.', 'pending', 'Spain', 'es', 'Société', 'Maria Garcia (Directora)', '2026-01-19 09:30:00'),
(12, 8, 'Renaissance Numérique', 14, 'https://vimeo.com/example12', 'https://picsum.photos/400/600?random=12', 'Comment l\'IA réinvente l\'art classique pour créer de nouvelles formes d\'expression artistique accessibles à tous.', 'pending', 'France', 'fr', 'Art et Culture', 'Pierre Durand (Réalisateur), Claire Dubois (Productrice)', '2026-01-19 14:00:00'),
(13, 11, 'Światło Przyszłości', 9, 'https://vimeo.com/example13', 'https://picsum.photos/400/600?random=13', 'A poetic journey through Warsaw rebuilt by AI architects, where every building tells a story of resilience.', 'approved', 'Poland', 'pl', 'Futurisme Optimiste', 'Anna Kowalski (Director), Piotr Nowak (Cinematography)', '2026-01-11 11:00:00'),
(14, 12, 'Midnattssol', 11, 'https://vimeo.com/example14', 'https://picsum.photos/400/600?random=14', 'In the endless summer light of 2060 Sweden, an AI helps isolated communities reconnect with nature and each other.', 'approved', 'Sweden', 'sv', 'Société', 'Henrik Larsson (Director/Writer)', '2026-01-12 09:00:00'),
(15, 13, 'أحلام الصحراء', 8, 'https://vimeo.com/example15', 'https://picsum.photos/400/600?random=15', 'Desert Dreams: AI transforms the Sahara into a thriving ecosystem while preserving Berber cultural heritage.', 'approved', 'Morocco', 'ar', 'Environnement', 'Fatima Al-Hassan (Director), Youssef Amrani (Music)', '2026-01-13 10:00:00'),
(16, 14, 'Favela 2070', 12, 'https://vimeo.com/example16', 'https://picsum.photos/400/600?random=16', 'Uma visão otimista das favelas do Rio transformadas em comunidades sustentáveis através da tecnologia comunitária.', 'approved', 'Brazil', 'pt', 'Société', 'Lucas Oliveira (Director), Ana Silva (Producer)', '2026-01-14 14:00:00'),
(17, 15, 'मुंबई स्वप्न', 10, 'https://vimeo.com/example17', 'https://picsum.photos/400/600?random=17', 'Mumbai Dreams: A Bollywood-inspired vision of India where AI democratizes art and storytelling for all.', 'approved', 'India', 'hi', 'Art et Culture', 'Priya Sharma (Director), Vikram Desai (Choreography)', '2026-01-15 08:00:00'),
(18, 16, '서울 2055', 13, 'https://vimeo.com/example18', 'https://picsum.photos/400/600?random=18', 'Seoul 2055: K-pop meets cyberpunk in a neon-drenched vision of Korean technological utopia.', 'approved', 'South Korea', 'ko', 'Technologie', 'Kim Min-jun (Director), Park Ji-young (VFX)', '2026-01-16 15:00:00'),
(19, 17, 'Новая Москва', 7, 'https://vimeo.com/example19', 'https://picsum.photos/400/600?random=19', 'New Moscow: A contemplative look at how AI might reshape Russian urban life while preserving cultural identity.', 'pending', 'Russia', 'ru', 'Futurisme Optimiste', 'Elena Volkov (Director)', '2026-01-17 10:00:00'),
(20, 18, 'أبناء النيل', 9, 'https://vimeo.com/example20', 'https://picsum.photos/400/600?random=20', 'Children of the Nile: Ancient Egyptian mythology reimagined through AI, where pharaohs return as digital guardians.', 'approved', 'Egypt', 'ar', 'Art et Culture', 'Ahmed Hassan (Director), Layla Mahmoud (Writer)', '2026-01-18 11:00:00'),
(21, 19, 'Northern Lights Protocol', 14, 'https://vimeo.com/example21', 'https://picsum.photos/400/600?random=21', 'Canadian scientists use AI to restore Arctic ecosystems, told through the eyes of an Inuit grandmother.', 'approved', 'Canada', 'en', 'Environnement', 'Sarah Johnson (Director/Writer)', '2026-01-12 16:00:00'),
(22, 20, 'Rinascimento Digitale', 11, 'https://vimeo.com/example22', 'https://picsum.photos/400/600?random=22', 'AI resurrects Renaissance masters to collaborate with modern artists in Florence, bridging 500 years of creativity.', 'approved', 'Italy', 'it', 'Art et Culture', 'Marco Rossi (Director), Giulia Bianchi (Art Director)', '2026-01-13 12:00:00'),
(23, 21, 'Lagos 2080', 10, 'https://vimeo.com/example23', 'https://picsum.photos/400/600?random=23', 'Afrofuturist vision of Lagos as Africa\'s technological heart, where tradition and innovation dance together.', 'approved', 'Nigeria', 'en', 'Futurisme Optimiste', 'Aisha Okonkwo (Director), Chidi Eze (Music)', '2026-01-14 09:00:00'),
(24, 22, 'Berliner Algorithmus', 8, 'https://vimeo.com/example24', 'https://picsum.photos/400/600?random=24', 'An experimental exploration of how AI might have changed the course of German history, told through abstract visuals.', 'approved', 'Germany', 'de', 'Technologie', 'Thomas Mueller (Director/Concept)', '2026-01-15 11:00:00'),
(25, 23, '香港浮城', 12, 'https://vimeo.com/example25', 'https://picsum.photos/400/600?random=25', 'Floating Hong Kong: Vertical cities rise above the harbor as AI optimizes every square meter of precious space.', 'approved', 'Hong Kong', 'zh', 'Futurisme Optimiste', 'Mei Lin Wong (Director), Tony Lau (VFX Supervisor)', '2026-01-16 10:00:00'),
(26, 24, 'Hygge Protocol', 6, 'https://vimeo.com/example26', 'https://picsum.photos/400/600?random=26', 'Danish minimalism meets AI: a quiet meditation on how technology can enhance rather than replace human connection.', 'approved', 'Denmark', 'da', 'Société', 'David Andersen (Director/Writer)', '2026-01-17 14:00:00'),
(27, 25, 'Oceano Novo', 15, 'https://vimeo.com/example27', 'https://picsum.photos/400/600?random=27', 'Portuguese explorers of the future navigate digital oceans, discovering new worlds created entirely by AI imagination.', 'pending', 'Portugal', 'pt', 'Art et Culture', 'Isabella Santos (Director)', '2026-01-18 09:00:00'),
(28, 28, 'Alger Demain', 10, 'https://vimeo.com/example28', 'https://picsum.photos/400/600?random=28', 'Algiers Tomorrow: Mediterranean cultures unite through AI to build sustainable coastal cities.', 'pending', 'Algeria', 'fr', 'Environnement', 'Omar Benali (Director)', '2026-01-19 10:00:00'),
(29, 29, 'Світанок Надії', 8, 'https://vimeo.com/example29', 'https://picsum.photos/400/600?random=29', 'Dawn of Hope: Ukrainian artists use AI to envision their country rebuilt, a powerful testament to resilience.', 'approved', 'Ukraine', 'uk', 'Futurisme Optimiste', 'Nina Petrova (Director), Oleksandr Shevchenko (Composer)', '2026-01-19 15:00:00'),
(30, 30, 'Diaspora Dreams', 11, 'https://vimeo.com/example30', 'https://picsum.photos/400/600?random=30', 'British-Indian perspectives on identity in 2060, where AI helps preserve and blend cultural heritage across generations.', 'approved', 'United Kingdom', 'en', 'Société', 'Raj Patel (Director/Writer)', '2026-01-20 08:00:00');

-- --------------------------------------------------------

--
-- Structure de la table `film_ai_tools_detailed`
--

DROP TABLE IF EXISTS `film_ai_tools_detailed`;
CREATE TABLE IF NOT EXISTS `film_ai_tools_detailed` (
  `id` int NOT NULL AUTO_INCREMENT,
  `film_id` int NOT NULL,
  `category` enum('scenario','image_video','postproduction') NOT NULL,
  `tool_name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `film_id` (`film_id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `film_ai_tools_detailed`
--

INSERT INTO `film_ai_tools_detailed` (`id`, `film_id`, `category`, `tool_name`) VALUES
(1, 1, 'scenario', 'ChatGPT'),
(2, 1, 'image_video', 'Midjourney'),
(3, 1, 'image_video', 'RunwayML'),
(4, 1, 'postproduction', 'ElevenLabs'),
(5, 2, 'scenario', 'ChatGPT'),
(6, 2, 'image_video', 'Stable Diffusion'),
(7, 2, 'image_video', 'Pika Labs'),
(8, 3, 'scenario', 'Claude AI'),
(9, 3, 'image_video', 'Midjourney'),
(10, 3, 'image_video', 'Runway Gen-2'),
(11, 4, 'scenario', 'Jasper AI'),
(12, 4, 'image_video', 'DALL-E 3'),
(13, 4, 'postproduction', 'CapCut'),
(14, 5, 'scenario', 'Claude'),
(15, 5, 'image_video', 'Midjourney'),
(16, 5, 'image_video', 'Sora'),
(17, 5, 'postproduction', 'MusicGen'),
(18, 6, 'scenario', 'ChatGPT'),
(19, 6, 'image_video', 'Midjourney'),
(20, 6, 'image_video', 'Runway'),
(21, 7, 'scenario', 'ChatGPT'),
(22, 7, 'image_video', 'Stable Diffusion XL'),
(23, 7, 'image_video', 'Pika Labs'),
(24, 7, 'postproduction', 'Synthesia'),
(25, 8, 'scenario', 'GPT-4'),
(26, 8, 'image_video', 'Midjourney'),
(27, 8, 'postproduction', 'Descript'),
(28, 9, 'image_video', 'Runway Gen-2'),
(29, 9, 'postproduction', 'MusicLM'),
(30, 10, 'scenario', 'Claude'),
(31, 10, 'image_video', 'Midjourney'),
(32, 10, 'image_video', 'Pika'),
(33, 10, 'postproduction', 'ElevenLabs'),
(34, 11, 'scenario', 'ChatGPT'),
(35, 11, 'image_video', 'Midjourney'),
(36, 11, 'postproduction', 'CapCut'),
(37, 12, 'scenario', 'Claude'),
(38, 12, 'image_video', 'DALL-E 3'),
(39, 12, 'image_video', 'Runway'),
(40, 12, 'postproduction', 'Audacity AI'),
(41, 13, 'scenario', 'ChatGPT'),
(42, 13, 'image_video', 'Midjourney'),
(43, 13, 'image_video', 'Runway Gen-2'),
(44, 13, 'postproduction', 'DaVinci Resolve AI'),
(45, 14, 'scenario', 'Claude'),
(46, 14, 'image_video', 'Stable Diffusion XL'),
(47, 14, 'postproduction', 'ElevenLabs'),
(48, 15, 'scenario', 'GPT-4'),
(49, 15, 'image_video', 'Midjourney'),
(50, 15, 'image_video', 'Pika Labs'),
(51, 15, 'postproduction', 'Murf AI'),
(52, 16, 'scenario', 'ChatGPT'),
(53, 16, 'image_video', 'Runway Gen-2'),
(54, 16, 'image_video', 'Stable Diffusion'),
(55, 16, 'postproduction', 'CapCut'),
(56, 17, 'scenario', 'Claude'),
(57, 17, 'image_video', 'DALL-E 3'),
(58, 17, 'image_video', 'Pika'),
(59, 17, 'postproduction', 'Soundraw'),
(60, 18, 'scenario', 'GPT-4'),
(61, 18, 'image_video', 'Midjourney'),
(62, 18, 'image_video', 'Sora'),
(63, 18, 'postproduction', 'Topaz Video AI'),
(64, 19, 'scenario', 'ChatGPT'),
(65, 19, 'image_video', 'Stable Diffusion'),
(66, 19, 'postproduction', 'Adobe Podcast AI'),
(67, 20, 'scenario', 'Claude'),
(68, 20, 'image_video', 'Midjourney'),
(69, 20, 'image_video', 'Runway'),
(70, 20, 'postproduction', 'ElevenLabs'),
(71, 21, 'scenario', 'GPT-4'),
(72, 21, 'image_video', 'DALL-E 3'),
(73, 21, 'image_video', 'Pika Labs'),
(74, 21, 'postproduction', 'Descript'),
(75, 22, 'scenario', 'ChatGPT'),
(76, 22, 'image_video', 'Midjourney'),
(77, 22, 'image_video', 'Runway Gen-2'),
(78, 22, 'postproduction', 'MusicGen'),
(79, 23, 'scenario', 'Claude'),
(80, 23, 'image_video', 'Stable Diffusion XL'),
(81, 23, 'image_video', 'Sora'),
(82, 23, 'postproduction', 'Synthesia'),
(83, 24, 'scenario', 'GPT-4'),
(84, 24, 'image_video', 'DALL-E 3'),
(85, 24, 'postproduction', 'Mubert'),
(86, 25, 'scenario', 'ChatGPT'),
(87, 25, 'image_video', 'Midjourney'),
(88, 25, 'image_video', 'Pika'),
(89, 25, 'postproduction', 'Topaz Video AI'),
(90, 26, 'scenario', 'Claude'),
(91, 26, 'image_video', 'Stable Diffusion'),
(92, 26, 'postproduction', 'ElevenLabs'),
(93, 27, 'scenario', 'ChatGPT'),
(94, 27, 'image_video', 'Midjourney'),
(95, 27, 'image_video', 'Runway Gen-2'),
(96, 27, 'postproduction', 'Soundraw'),
(97, 28, 'scenario', 'GPT-4'),
(98, 28, 'image_video', 'DALL-E 3'),
(99, 28, 'image_video', 'Pika Labs'),
(100, 28, 'postproduction', 'Descript'),
(101, 29, 'scenario', 'Claude'),
(102, 29, 'image_video', 'Midjourney'),
(103, 29, 'image_video', 'Sora'),
(104, 29, 'postproduction', 'MusicGen'),
(105, 30, 'scenario', 'ChatGPT'),
(106, 30, 'image_video', 'Stable Diffusion XL'),
(107, 30, 'image_video', 'Runway'),
(108, 30, 'postproduction', 'ElevenLabs');

-- --------------------------------------------------------

--
-- Structure de la table `film_categories`
--

DROP TABLE IF EXISTS `film_categories`;
CREATE TABLE IF NOT EXISTS `film_categories` (
  `film_id` int NOT NULL,
  `category_id` int NOT NULL,
  PRIMARY KEY (`film_id`,`category_id`),
  KEY `category_id` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `film_categories`
--

INSERT INTO `film_categories` (`film_id`, `category_id`) VALUES
(1, 2),
(4, 2),
(10, 2),
(15, 2),
(21, 2),
(28, 2),
(6, 1),
(13, 1),
(23, 1),
(25, 1),
(29, 1),
(2, 4),
(18, 4),
(24, 4),
(3, 3),
(8, 3),
(11, 3),
(14, 3),
(16, 3),
(26, 3),
(30, 3),
(5, 5),
(7, 5),
(9, 5),
(12, 5),
(17, 5),
(20, 5),
(22, 5),
(27, 5),
(19, 1);

-- --------------------------------------------------------

--
-- Structure de la table `jury_notes`
--

DROP TABLE IF EXISTS `jury_notes`;
CREATE TABLE IF NOT EXISTS `jury_notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `film_id` int NOT NULL,
  `score` float NOT NULL,
  `comment` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_note` (`user_id`,`film_id`),
  KEY `film_id` (`film_id`),
  KEY `idx_score` (`score`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `jury_notes`
--

INSERT INTO `jury_notes` (`id`, `user_id`, `film_id`, `score`, `comment`, `created_at`) VALUES
(1, 5, 1, 9.5, 'Magnifique vision d\'un futur écologique. La réalisation est impeccable et le message profondément optimiste.', '2026-01-18 10:00:00'),
(2, 5, 2, 8.7, 'Excellent concept narratif. L\'utilisation de l\'IA pour explorer le libre arbitre est brillante.', '2026-01-18 10:30:00'),
(3, 5, 3, 9.2, 'Une œuvre visuellement époustouflante qui capture parfaitement l\'harmonie homme-machine.', '2026-01-18 11:00:00'),
(4, 5, 4, 8.0, 'Beau message sur la durabilité urbaine. Quelques longueurs mais globalement très réussi.', '2026-01-18 11:30:00'),
(5, 5, 5, 9.8, 'Film expérimental d\'une rare audace. Repousse les limites de la narration cinématographique.', '2026-01-18 12:00:00'),
(6, 6, 1, 9.0, 'Impressive environmental narrative with stunning AI-generated visuals. A hopeful vision.', '2026-01-18 14:00:00'),
(7, 6, 2, 9.5, 'Philosophical depth combined with technical excellence. The best use of AI I\'ve seen.', '2026-01-18 14:30:00'),
(8, 6, 3, 8.5, 'Beautiful aesthetic and cultural richness. Minor pacing issues in the middle section.', '2026-01-18 15:00:00'),
(9, 6, 4, 7.8, 'Solid documentary-style approach to sustainable agriculture. Educational and inspiring.', '2026-01-18 15:30:00'),
(10, 6, 5, 9.3, 'Groundbreaking experimental work. Challenges our understanding of memory and AI.', '2026-01-18 16:00:00'),
(11, 5, 6, 8.8, 'Excellente exploration architecturale. Les designs sont innovants et crédibles.', '2026-01-18 16:30:00'),
(12, 5, 7, 9.0, 'Poétique et profond. Une réflexion touchante sur la préservation du savoir.', '2026-01-18 17:00:00'),
(13, 5, 9, 8.5, 'Expérience sensorielle unique. La fusion musique-IA est remarquable.', '2026-01-18 17:30:00'),
(14, 5, 10, 9.1, 'Epic en échelle et en ambition. Message écologique puissant.', '2026-01-18 18:00:00'),
(15, 6, 6, 8.3, 'Visionary architecture concepts. Could benefit from stronger character development.', '2026-01-18 18:30:00'),
(16, 6, 7, 8.9, 'Touching tribute to knowledge and preservation. Beautiful cinematography.', '2026-01-18 19:00:00'),
(17, 6, 9, 9.0, 'Innovative approach to AI-music synthesis. Emotionally resonant.', '2026-01-18 19:30:00'),
(18, 6, 10, 8.7, 'Ambitious scope with excellent execution. Inspiring environmental message.', '2026-01-18 20:00:00'),
(19, 5, 8, 7.5, 'Important sujet sur la préservation linguistique. Aurait bénéficié d\'un rythme plus soutenu.', '2026-01-19 10:00:00'),
(20, 6, 8, 8.0, 'Meaningful exploration of linguistic preservation through AI. Well-researched.', '2026-01-19 10:30:00'),
(21, 26, 1, 9.2, '環境と技術の完璧な融合。フランスの視点から見た素晴らしい作品。', '2026-01-19 11:00:00'),
(22, 26, 2, 8.9, 'Quantum mechanics meets AI storytelling. Intellectually stimulating.', '2026-01-19 11:30:00'),
(23, 26, 3, 9.7, '日本の未来を美しく描いた傑作。AIの使い方が革新的。', '2026-01-19 12:00:00'),
(24, 27, 1, 8.8, 'Vision écologique touchante. Excellent travail sur les visuels générés par IA.', '2026-01-19 12:30:00'),
(25, 27, 2, 9.1, 'Profondeur philosophique remarquable. Un des meilleurs films de la sélection.', '2026-01-19 13:00:00'),
(26, 27, 3, 8.6, 'Esthétique japonaise magnifique, quelques longueurs au milieu.', '2026-01-19 13:30:00'),
(27, 5, 13, 8.9, 'Belle exploration de la résilience polonaise. Architecture IA impressionnante.', '2026-01-19 14:00:00'),
(28, 5, 14, 8.4, 'Ambiance nordique captivante. Le minimalisme sert bien le propos.', '2026-01-19 14:30:00'),
(29, 5, 15, 9.0, 'Message écologique puissant. Les visuels du désert sont époustouflants.', '2026-01-19 15:00:00'),
(30, 5, 16, 9.3, 'Vision sociale forte. Le Brésil futuriste est crédible et inspirant.', '2026-01-19 15:30:00'),
(31, 6, 13, 8.7, 'Powerful narrative of rebuilding. Strong visual identity.', '2026-01-19 16:00:00'),
(32, 6, 14, 8.2, 'Scandinavian aesthetics at their finest. Subtle but effective.', '2026-01-19 16:30:00'),
(33, 6, 15, 8.8, 'Important environmental message for North Africa. Well executed.', '2026-01-19 17:00:00'),
(34, 6, 16, 9.1, 'Social justice meets futurism. Compelling and necessary.', '2026-01-19 17:30:00'),
(35, 26, 13, 8.5, 'Eastern European futurism done right. Promising director.', '2026-01-19 18:00:00'),
(36, 26, 14, 8.0, 'Quiet but powerful. Scandinavian filmmaking tradition honored.', '2026-01-19 18:30:00'),
(37, 27, 13, 8.6, 'Très beau travail sur l\'architecture régénérative.', '2026-01-19 19:00:00'),
(38, 27, 14, 8.3, 'Le silence parle. Une méditation visuelle réussie.', '2026-01-19 19:30:00'),
(39, 5, 17, 9.4, 'Bollywood rencontre l\'IA de manière spectaculaire. Coloré et joyeux.', '2026-01-20 09:00:00'),
(40, 5, 18, 9.6, 'Le meilleur film de K-drama cyberpunk que j\'ai vu. Techniquement parfait.', '2026-01-20 09:30:00'),
(41, 5, 20, 8.7, 'Mythologie égyptienne réinventée avec brio. Visuel unique.', '2026-01-20 10:00:00'),
(42, 5, 21, 9.2, 'Documentaire environnemental touchant. La perspective Inuit est précieuse.', '2026-01-20 10:30:00'),
(43, 6, 17, 9.2, 'Joyful celebration of Indian creativity. AI enhances without overwhelming.', '2026-01-20 11:00:00'),
(44, 6, 18, 9.4, 'Technical masterpiece. K-pop aesthetics perfectly adapted to sci-fi.', '2026-01-20 11:30:00'),
(45, 6, 20, 8.5, 'Ancient meets digital beautifully. Strong cultural identity.', '2026-01-20 12:00:00'),
(46, 6, 21, 9.0, 'Environmental documentary with soul. Indigenous perspectives matter.', '2026-01-20 12:30:00'),
(47, 26, 17, 9.0, 'インド映画の新しい形。AIの使い方が独創的。', '2026-01-20 13:00:00'),
(48, 26, 18, 9.5, '韓国のサイバーパンク美学の最高峰。必見の作品。', '2026-01-20 13:30:00'),
(49, 27, 17, 9.1, 'Une explosion de couleurs et de créativité. L\'Inde au sommet.', '2026-01-20 14:00:00'),
(50, 27, 18, 9.3, 'Néon, K-pop et IA: le cocktail parfait. Éblouissant.', '2026-01-20 14:30:00'),
(51, 5, 22, 9.0, 'La Renaissance revisitée par l\'IA. Marco Rossi est un visionnaire.', '2026-01-20 15:00:00'),
(52, 5, 23, 9.5, 'Lagos comme capitale mondiale: vision audacieuse et réussie.', '2026-01-20 15:30:00'),
(53, 6, 22, 8.8, 'Art history meets AI. Respectful yet innovative approach.', '2026-01-20 16:00:00'),
(54, 6, 23, 9.3, 'Afrofuturism at its best. Important and inspiring vision.', '2026-01-20 16:30:00'),
(55, 5, 29, 9.4, 'Un message d\'espoir bouleversant. L\'Ukraine nous montre la voie.', '2026-01-20 17:00:00'),
(56, 6, 29, 9.2, 'Hope amid adversity. Powerful testament to human resilience.', '2026-01-20 17:30:00'),
(57, 5, 30, 8.6, 'Exploration sensible de l\'identité diasporique. Bien écrit.', '2026-01-20 18:00:00'),
(58, 6, 30, 8.4, 'Identity and heritage thoughtfully explored. Personal and universal.', '2026-01-20 18:30:00');

-- --------------------------------------------------------

--
-- Structure de la table `newsletter_subscriptions`
--

DROP TABLE IF EXISTS `newsletter_subscriptions`;
CREATE TABLE IF NOT EXISTS `newsletter_subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `subscribed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `newsletter_subscriptions`
--

INSERT INTO `newsletter_subscriptions` (`id`, `email`, `subscribed_at`) VALUES
(1, 'alice.bernard@email.com', '2026-01-15 09:00:00'),
(2, 'thomas.petit@email.com', '2026-01-15 10:30:00'),
(3, 'julia.anderson@email.com', '2026-01-16 14:00:00'),
(4, 'marco.rossi@email.com', '2026-01-16 16:45:00'),
(5, 'hannah.muller@email.com', '2026-01-17 08:15:00'),
(6, 'david.lee@email.com', '2026-01-17 11:00:00'),
(7, 'sarah.johnson@email.com', '2026-01-18 13:30:00'),
(8, 'mohamed.hassan@email.com', '2026-01-18 15:00:00'),
(9, 'anna.kowalski@email.com', '2026-01-19 09:00:00'),
(10, 'ricardo.silva@email.com', '2026-01-19 10:00:00'),
(11, 'jean.baptiste@email.com', '2026-01-10 08:00:00'),
(12, 'emily.chen@email.com', '2026-01-10 09:30:00'),
(13, 'mohammed.ali@email.com', '2026-01-11 10:00:00'),
(14, 'sara.kim@email.com', '2026-01-11 14:00:00'),
(15, 'pierre.leblanc@email.com', '2026-01-12 08:30:00'),
(16, 'akiko.yamamoto@email.com', '2026-01-12 11:00:00'),
(17, 'carlos.mendez@email.com', '2026-01-13 09:00:00'),
(18, 'fatou.diallo@email.com', '2026-01-13 15:00:00'),
(19, 'michael.brown@email.com', '2026-01-14 10:30:00'),
(20, 'elena.popova@email.com', '2026-01-14 12:00:00'),
(21, 'juan.garcia@email.com', '2026-01-15 08:00:00'),
(22, 'aisha.mohammed@email.com', '2026-01-15 13:00:00'),
(23, 'lucas.martin@email.com', '2026-01-16 09:30:00'),
(24, 'mei.wong@email.com', '2026-01-16 14:30:00'),
(25, 'olivier.dupont@email.com', '2026-01-17 10:00:00'),
(26, 'priya.patel@email.com', '2026-01-17 16:00:00'),
(27, 'anders.svensson@email.com', '2026-01-18 08:00:00'),
(28, 'chiara.rossi@email.com', '2026-01-18 11:30:00'),
(29, 'yusuf.osman@email.com', '2026-01-19 14:00:00'),
(30, 'claire.fontaine@email.com', '2026-01-19 16:30:00'),
(31, 'kenji.tanaka@email.com', '2026-01-20 08:00:00'),
(32, 'amelia.jones@email.com', '2026-01-20 09:30:00'),
(33, 'hassan.ibrahim@email.com', '2026-01-20 10:00:00'),
(34, 'marie.curie@email.com', '2026-01-20 11:00:00'),
(35, 'dmitri.volkov@email.com', '2026-01-20 12:00:00');

-- --------------------------------------------------------

--
-- Structure de la table `platform_stats`
--

DROP TABLE IF EXISTS `platform_stats`;
CREATE TABLE IF NOT EXISTS `platform_stats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `stat_date` date NOT NULL,
  `total_films` int DEFAULT '0',
  `total_countries` int DEFAULT '0',
  `total_users` int DEFAULT '0',
  `total_votes` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `stat_date` (`stat_date`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `platform_stats`
--

INSERT INTO `platform_stats` (`id`, `stat_date`, `total_films`, `total_countries`, `total_users`, `total_votes`) VALUES
(1, '2026-01-10', 2, 2, 5, 0),
(2, '2026-01-11', 4, 4, 8, 10),
(3, '2026-01-12', 7, 6, 12, 25),
(4, '2026-01-13', 10, 8, 15, 45),
(5, '2026-01-14', 13, 10, 18, 70),
(6, '2026-01-15', 16, 12, 21, 95),
(7, '2026-01-16', 19, 14, 24, 125),
(8, '2026-01-17', 22, 16, 26, 160),
(9, '2026-01-18', 25, 18, 28, 200),
(10, '2026-01-19', 28, 20, 29, 245),
(11, '2026-01-20', 30, 22, 30, 290);

-- --------------------------------------------------------

--
-- Structure de la table `roles`
--

DROP TABLE IF EXISTS `roles`;
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `roles`
--

INSERT INTO `roles` (`id`, `role_name`) VALUES
(3, 'Admin'),
(1, 'Director'),
(2, 'Jury');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `bio` text,
  `country` varchar(100) DEFAULT NULL,
  `school` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `social_instagram` varchar(100) DEFAULT NULL,
  `social_twitter` varchar(100) DEFAULT NULL,
  `social_linkedin` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `bio`, `country`, `school`, `website`, `social_instagram`, `social_twitter`, `social_linkedin`, `created_at`) VALUES
(1, 'Sophie Martin', 'sophie.martin@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'Réalisatrice passionnée par l\'IA générative et le cinéma expérimental', 'France', 'La Fémis', 'https://sophiemartin.com', '@sophie_films', '@sophiemartin', 'sophie-martin-filmmaker', '2026-01-19 14:21:36'),
(2, 'John Smith', 'john.smith@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'Director exploring the intersection of AI and storytelling', 'United States', 'USC School of Cinematic Arts', 'https://johnsmith.art', '@johnsmithfilms', '@jsmith_ai', 'john-smith-director', '2026-01-19 14:21:36'),
(3, 'Yuki Tanaka', 'yuki.tanaka@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'AI filmmaker from Tokyo, focused on sci-fi narratives', 'Japan', 'Tokyo University of the Arts', 'https://yukitanaka.jp', '@yuki_creates', '@yukitanaka_ai', 'yuki-tanaka-filmmaker', '2026-01-19 14:21:36'),
(4, 'Maria Garcia', 'maria.garcia@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'Explorando nuevas formas de narrativa con IA', 'Spain', 'ESCAC', 'https://mariagarcia.es', '@maria_cine', '@mariagarcia', 'maria-garcia-directora', '2026-01-19 14:21:36'),
(5, 'Dr. Laurent Dubois', 'laurent.dubois@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'Critique de cinéma et chercheur en IA', 'France', 'Sorbonne Université', NULL, NULL, '@ldubois_cinema', 'laurent-dubois-phd', '2026-01-19 14:21:36'),
(6, 'Emma Wilson', 'emma.wilson@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'Film festival curator and AI ethics specialist', 'United Kingdom', 'Royal College of Art', 'https://emmawilson.co.uk', NULL, '@emma_curator', 'emma-wilson-curator', '2026-01-19 14:21:36'),
(7, 'Admin MarsAI', 'admin@marsai.com', '$2y$10$abcdefghijklmnopqrstuv', 'Administrateur de la plateforme MarsAI Festival', 'France', NULL, 'https://marsai-festival.com', '@marsai_festival', '@marsai', 'marsai-festival', '2026-01-19 14:21:36'),
(8, 'Pierre Durand', 'pierre.durand@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'Réalisateur et architecte, passionné par les villes du futur', 'France', 'École Nationale Supérieure d\'Architecture', 'https://pierredurand.fr', '@pierre_archi', NULL, 'pierre-durand', '2026-01-19 14:21:36'),
(9, 'Lisa Chen', 'lisa.chen@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'Filmmaker and digital artist exploring cultural preservation through AI', 'China', 'Beijing Film Academy', NULL, '@lisa_creates', '@lisachen_ai', 'lisa-chen-filmmaker', '2026-01-19 14:21:36'),
(10, 'Carlos Rodriguez', 'carlos.rodriguez@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'Documentalista comprometido con causas sociales y tecnología', 'Mexico', 'Centro de Capacitación Cinematográfica', 'https://carlosrodriguez.mx', '@carlos_docs', '@carlosrodriguez', 'carlos-rodriguez-doc', '2026-01-19 14:21:36'),
(11, 'Anna Kowalski', 'anna.kowalski@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'Polish filmmaker exploring Eastern European futurism', 'Poland', 'Łódź Film School', 'https://annakowalski.pl', '@anna_films', '@annakowalski', 'anna-kowalski-director', '2026-01-10 09:00:00'),
(12, 'Henrik Larsson', 'henrik.larsson@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'Swedish director focused on Nordic noir and AI aesthetics', 'Sweden', 'Stockholm Academy of Dramatic Arts', 'https://henriklarsson.se', '@henrik_noir', '@hlarsson', 'henrik-larsson-film', '2026-01-11 10:30:00'),
(13, 'Fatima Al-Hassan', 'fatima.alhassan@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'Filmmaker from Morocco blending tradition with technology', 'Morocco', 'ISADAC Rabat', 'https://fatimaalhassan.ma', '@fatima_creates', '@falhassan', 'fatima-alhassan', '2026-01-12 11:00:00'),
(14, 'Lucas Oliveira', 'lucas.oliveira@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'Brazilian director exploring favela futures and social justice', 'Brazil', 'Escola de Cinema Darcy Ribeiro', 'https://lucasoliveira.com.br', '@lucas_cine', '@loliveira_ai', 'lucas-oliveira-cineasta', '2026-01-12 14:00:00'),
(15, 'Priya Sharma', 'priya.sharma@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'Indian filmmaker merging Bollywood aesthetics with AI innovation', 'India', 'Film and Television Institute of India', 'https://priyasharma.in', '@priya_bollywood', '@psharma_films', 'priya-sharma-director', '2026-01-13 08:30:00'),
(16, 'Kim Min-jun', 'minjun.kim@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'Korean director known for cyberpunk visuals and K-drama influences', 'South Korea', 'Korean Academy of Film Arts', 'https://kimmin.kr', '@minjun_creates', '@kimminj', 'kim-minjun-director', '2026-01-13 15:00:00'),
(17, 'Elena Volkov', 'elena.volkov@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'Russian filmmaker exploring post-Soviet futurism', 'Russia', 'VGIK Moscow', 'https://elenavolkov.ru', '@elena_cinema', '@evolkov', 'elena-volkov-films', '2026-01-14 09:00:00'),
(18, 'Ahmed Hassan', 'ahmed.hassan@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'Egyptian director reimagining ancient myths with AI', 'Egypt', 'Cairo Higher Institute of Cinema', NULL, '@ahmed_myths', '@ahassan_films', 'ahmed-hassan-cinema', '2026-01-14 12:00:00'),
(19, 'Sarah Johnson', 'sarah.johnson@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'Canadian documentary filmmaker focused on climate futures', 'Canada', 'Toronto Film School', 'https://sarahjohnson.ca', '@sarah_docs', '@sjohnson_film', 'sarah-johnson-docs', '2026-01-15 10:00:00'),
(20, 'Marco Rossi', 'marco.rossi@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'Italian director blending Renaissance art with AI generation', 'Italy', 'Centro Sperimentale di Cinematografia', 'https://marcorossi.it', '@marco_arte', '@mrossi_cinema', 'marco-rossi-regista', '2026-01-15 14:30:00'),
(21, 'Aisha Okonkwo', 'aisha.okonkwo@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'Nigerian filmmaker pioneering Afrofuturism with AI', 'Nigeria', 'National Film Institute Nigeria', 'https://aishaokonkwo.ng', '@aisha_afro', '@aokonkwo', 'aisha-okonkwo-films', '2026-01-16 08:00:00'),
(22, 'Thomas Mueller', 'thomas.mueller@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'German experimental filmmaker and AI researcher', 'Germany', 'Deutsche Film- und Fernsehakademie Berlin', 'https://thomasmueller.de', '@thomas_exp', '@tmueller_ai', 'thomas-mueller-film', '2026-01-16 11:00:00'),
(23, 'Mei Lin Wong', 'meilin.wong@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'Hong Kong director exploring urban density and AI futures', 'Hong Kong', 'Hong Kong Academy for Performing Arts', 'https://meilinwong.hk', '@meilin_hk', '@mlwong', 'meilin-wong-director', '2026-01-17 09:30:00'),
(24, 'David Andersen', 'david.andersen@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'Danish filmmaker known for minimalist sci-fi', 'Denmark', 'National Film School of Denmark', 'https://davidandersen.dk', '@david_scifi', '@dandersen', 'david-andersen-film', '2026-01-17 13:00:00'),
(25, 'Isabella Santos', 'isabella.santos@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'Portuguese director exploring maritime futures', 'Portugal', 'Escola Superior de Teatro e Cinema', 'https://isabellasantos.pt', '@isabella_mar', '@isantos_film', 'isabella-santos-cinema', '2026-01-18 10:00:00'),
(26, 'Dr. Kenji Yamamoto', 'kenji.yamamoto@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'Japanese film critic and jury member specializing in AI cinema', 'Japan', 'Waseda University', NULL, NULL, '@kyamamoto', 'kenji-yamamoto-phd', '2026-01-10 08:00:00'),
(27, 'Clara Fontaine', 'clara.fontaine@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'French-Belgian curator and AI art specialist', 'Belgium', 'INSAS Brussels', 'https://clarafontaine.be', '@clara_art', '@cfontaine', 'clara-fontaine-curator', '2026-01-11 09:00:00'),
(28, 'Omar Benali', 'omar.benali@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'Algerian filmmaker documenting Mediterranean futures', 'Algeria', 'Institut Supérieur des Métiers des Arts du Spectacle', NULL, '@omar_med', '@obenali', 'omar-benali-films', '2026-01-18 15:00:00'),
(29, 'Nina Petrova', 'nina.petrova@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'Ukrainian director creating hopeful visions amid conflict', 'Ukraine', 'Kyiv National I. K. Karpenko-Kary Theatre, Cinema and Television University', 'https://ninapetrova.ua', '@nina_hope', '@npetrova', 'nina-petrova-films', '2026-01-19 08:00:00'),
(30, 'Raj Patel', 'raj.patel@email.com', '$2y$10$abcdefghijklmnopqrstuv', 'British-Indian filmmaker exploring diaspora futures', 'United Kingdom', 'London Film School', 'https://rajpatel.co.uk', '@raj_diaspora', '@rpatel_film', 'raj-patel-director', '2026-01-19 11:00:00');

-- --------------------------------------------------------

--
-- Structure de la table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE IF NOT EXISTS `user_roles` (
  `user_id` int NOT NULL,
  `role_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `user_roles`
--

INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 1),
(8, 1),
(9, 1),
(10, 1),
(11, 1),
(12, 1),
(13, 1),
(14, 1),
(15, 1),
(16, 1),
(17, 1),
(18, 1),
(19, 1),
(20, 1),
(21, 1),
(22, 1),
(23, 1),
(24, 1),
(25, 1),
(28, 1),
(29, 1),
(30, 1),
(5, 2),
(6, 2),
(26, 2),
(27, 2),
(7, 3);

-- --------------------------------------------------------

--
-- Structure de la table `votes`
--

DROP TABLE IF EXISTS `votes`;
CREATE TABLE IF NOT EXISTS `votes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `film_id` int NOT NULL,
  `vote_type` varchar(20) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_vote` (`user_id`,`film_id`),
  KEY `film_id` (`film_id`),
  KEY `idx_vote_type` (`vote_type`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `votes`
--

INSERT INTO `votes` (`id`, `user_id`, `film_id`, `vote_type`, `created_at`) VALUES
(1, 1, 2, 'like', '2026-01-18 10:00:00'),
(2, 1, 3, 'like', '2026-01-18 10:15:00'),
(3, 1, 5, 'favorite', '2026-01-18 10:30:00'),
(4, 2, 1, 'like', '2026-01-18 11:00:00'),
(5, 2, 3, 'favorite', '2026-01-18 11:15:00'),
(6, 2, 7, 'like', '2026-01-18 11:30:00'),
(7, 3, 1, 'like', '2026-01-18 12:00:00'),
(8, 3, 2, 'like', '2026-01-18 12:15:00'),
(9, 3, 10, 'favorite', '2026-01-18 12:30:00'),
(10, 4, 1, 'favorite', '2026-01-18 13:00:00'),
(11, 4, 4, 'like', '2026-01-18 13:15:00'),
(12, 4, 6, 'like', '2026-01-18 13:30:00'),
(13, 5, 1, 'like', '2026-01-18 14:00:00'),
(14, 5, 2, 'like', '2026-01-18 14:15:00'),
(15, 5, 3, 'like', '2026-01-18 14:30:00'),
(16, 5, 5, 'favorite', '2026-01-18 14:45:00'),
(17, 6, 2, 'favorite', '2026-01-18 15:00:00'),
(18, 6, 5, 'like', '2026-01-18 15:15:00'),
(19, 6, 7, 'like', '2026-01-18 15:30:00'),
(20, 7, 1, 'like', '2026-01-18 16:00:00'),
(21, 7, 2, 'like', '2026-01-18 16:15:00'),
(22, 7, 3, 'like', '2026-01-18 16:30:00'),
(23, 8, 1, 'favorite', '2026-01-18 17:00:00'),
(24, 8, 3, 'like', '2026-01-18 17:15:00'),
(25, 8, 9, 'like', '2026-01-18 17:30:00'),
(26, 9, 2, 'like', '2026-01-18 18:00:00'),
(27, 9, 7, 'favorite', '2026-01-18 18:15:00'),
(28, 9, 10, 'like', '2026-01-18 18:30:00'),
(29, 10, 1, 'like', '2026-01-18 19:00:00'),
(30, 10, 4, 'favorite', '2026-01-18 19:15:00'),
(31, 10, 6, 'like', '2026-01-18 19:30:00'),
(32, 1, 6, 'like', '2026-01-19 08:00:00'),
(33, 1, 7, 'like', '2026-01-19 08:15:00'),
(34, 2, 5, 'like', '2026-01-19 08:30:00'),
(35, 2, 10, 'like', '2026-01-19 08:45:00'),
(36, 3, 4, 'like', '2026-01-19 09:00:00'),
(37, 3, 6, 'like', '2026-01-19 09:15:00'),
(38, 4, 2, 'like', '2026-01-19 09:30:00'),
(39, 4, 5, 'like', '2026-01-19 09:45:00'),
(40, 5, 6, 'like', '2026-01-19 10:00:00'),
(41, 5, 7, 'like', '2026-01-19 10:15:00'),
(42, 5, 9, 'like', '2026-01-19 10:30:00'),
(43, 5, 10, 'like', '2026-01-19 10:45:00'),
(44, 6, 1, 'like', '2026-01-19 11:00:00'),
(45, 6, 3, 'like', '2026-01-19 11:15:00'),
(46, 6, 6, 'like', '2026-01-19 11:30:00'),
(47, 6, 9, 'favorite', '2026-01-19 11:45:00'),
(48, 6, 10, 'like', '2026-01-19 12:00:00'),
(49, 7, 5, 'like', '2026-01-19 12:15:00'),
(50, 7, 6, 'like', '2026-01-19 12:30:00'),
(51, 8, 2, 'like', '2026-01-19 12:45:00'),
(52, 8, 5, 'like', '2026-01-19 13:00:00'),
(53, 8, 7, 'like', '2026-01-19 13:15:00'),
(54, 9, 1, 'like', '2026-01-19 13:30:00'),
(55, 9, 3, 'like', '2026-01-19 13:45:00'),
(56, 9, 5, 'like', '2026-01-19 14:00:00'),
(57, 10, 2, 'like', '2026-01-19 14:15:00'),
(58, 10, 3, 'like', '2026-01-19 14:30:00'),
(59, 11, 1, 'like', '2026-01-19 15:00:00'),
(60, 11, 13, 'favorite', '2026-01-19 15:15:00'),
(61, 11, 18, 'like', '2026-01-19 15:30:00'),
(62, 11, 23, 'like', '2026-01-19 15:45:00'),
(63, 12, 3, 'like', '2026-01-19 16:00:00'),
(64, 12, 14, 'favorite', '2026-01-19 16:15:00'),
(65, 12, 17, 'like', '2026-01-19 16:30:00'),
(66, 12, 29, 'like', '2026-01-19 16:45:00'),
(67, 13, 5, 'like', '2026-01-19 17:00:00'),
(68, 13, 15, 'favorite', '2026-01-19 17:15:00'),
(69, 13, 20, 'like', '2026-01-19 17:30:00'),
(70, 13, 22, 'like', '2026-01-19 17:45:00'),
(71, 14, 1, 'like', '2026-01-19 18:00:00'),
(72, 14, 16, 'favorite', '2026-01-19 18:15:00'),
(73, 14, 21, 'like', '2026-01-19 18:30:00'),
(74, 14, 23, 'like', '2026-01-19 18:45:00'),
(75, 15, 2, 'like', '2026-01-19 19:00:00'),
(76, 15, 17, 'favorite', '2026-01-19 19:15:00'),
(77, 15, 22, 'like', '2026-01-19 19:30:00'),
(78, 15, 30, 'like', '2026-01-19 19:45:00'),
(79, 16, 3, 'like', '2026-01-19 20:00:00'),
(80, 16, 18, 'favorite', '2026-01-19 20:15:00'),
(81, 16, 23, 'like', '2026-01-19 20:30:00'),
(82, 16, 25, 'like', '2026-01-19 20:45:00'),
(83, 17, 1, 'like', '2026-01-20 08:00:00'),
(84, 17, 13, 'like', '2026-01-20 08:15:00'),
(85, 17, 19, 'favorite', '2026-01-20 08:30:00'),
(86, 17, 29, 'like', '2026-01-20 08:45:00'),
(87, 18, 5, 'like', '2026-01-20 09:00:00'),
(88, 18, 15, 'like', '2026-01-20 09:15:00'),
(89, 18, 20, 'favorite', '2026-01-20 09:30:00'),
(90, 18, 22, 'like', '2026-01-20 09:45:00'),
(91, 19, 2, 'like', '2026-01-20 10:00:00'),
(92, 19, 10, 'like', '2026-01-20 10:15:00'),
(93, 19, 21, 'favorite', '2026-01-20 10:30:00'),
(94, 19, 26, 'like', '2026-01-20 10:45:00'),
(95, 20, 1, 'like', '2026-01-20 11:00:00'),
(96, 20, 5, 'like', '2026-01-20 11:15:00'),
(97, 20, 22, 'favorite', '2026-01-20 11:30:00'),
(98, 20, 27, 'like', '2026-01-20 11:45:00'),
(99, 21, 3, 'like', '2026-01-20 12:00:00'),
(100, 21, 16, 'like', '2026-01-20 12:15:00'),
(101, 21, 23, 'favorite', '2026-01-20 12:30:00'),
(102, 21, 29, 'like', '2026-01-20 12:45:00'),
(103, 22, 2, 'like', '2026-01-20 13:00:00'),
(104, 22, 9, 'like', '2026-01-20 13:15:00'),
(105, 22, 24, 'favorite', '2026-01-20 13:30:00'),
(106, 22, 30, 'like', '2026-01-20 13:45:00'),
(107, 23, 1, 'like', '2026-01-20 14:00:00'),
(108, 23, 7, 'like', '2026-01-20 14:15:00'),
(109, 23, 18, 'like', '2026-01-20 14:30:00'),
(110, 23, 25, 'favorite', '2026-01-20 14:45:00'),
(111, 24, 3, 'like', '2026-01-20 15:00:00'),
(112, 24, 14, 'like', '2026-01-20 15:15:00'),
(113, 24, 26, 'favorite', '2026-01-20 15:30:00'),
(114, 24, 29, 'like', '2026-01-20 15:45:00'),
(115, 25, 2, 'like', '2026-01-20 16:00:00'),
(116, 25, 6, 'like', '2026-01-20 16:15:00'),
(117, 25, 21, 'like', '2026-01-20 16:30:00'),
(118, 25, 27, 'favorite', '2026-01-20 16:45:00'),
(119, 28, 1, 'like', '2026-01-20 17:00:00'),
(120, 28, 15, 'like', '2026-01-20 17:15:00'),
(121, 28, 20, 'like', '2026-01-20 17:30:00'),
(122, 28, 28, 'favorite', '2026-01-20 17:45:00'),
(123, 29, 5, 'like', '2026-01-20 18:00:00'),
(124, 29, 13, 'like', '2026-01-20 18:15:00'),
(125, 29, 23, 'like', '2026-01-20 18:30:00'),
(126, 29, 29, 'favorite', '2026-01-20 18:45:00'),
(127, 30, 1, 'like', '2026-01-20 19:00:00'),
(128, 30, 17, 'like', '2026-01-20 19:15:00'),
(129, 30, 22, 'like', '2026-01-20 19:30:00'),
(130, 30, 30, 'favorite', '2026-01-20 19:45:00'),
(131, 1, 13, 'like', '2026-01-20 20:00:00'),
(132, 1, 18, 'favorite', '2026-01-20 20:15:00'),
(133, 2, 16, 'like', '2026-01-20 20:30:00'),
(134, 2, 23, 'like', '2026-01-20 20:45:00'),
(135, 3, 17, 'like', '2026-01-20 21:00:00'),
(136, 3, 29, 'favorite', '2026-01-20 21:15:00'),
(137, 4, 14, 'like', '2026-01-20 21:30:00'),
(138, 4, 22, 'like', '2026-01-20 21:45:00'),
(139, 8, 13, 'like', '2026-01-20 22:00:00'),
(140, 8, 21, 'favorite', '2026-01-20 22:15:00'),
(141, 9, 18, 'like', '2026-01-20 22:30:00'),
(142, 9, 25, 'like', '2026-01-20 22:45:00'),
(143, 10, 15, 'like', '2026-01-20 23:00:00'),
(144, 10, 29, 'like', '2026-01-20 23:15:00');

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `awards`
--
ALTER TABLE `awards`
  ADD CONSTRAINT `awards_ibfk_1` FOREIGN KEY (`film_id`) REFERENCES `films` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `event_registrations`
--
ALTER TABLE `event_registrations`
  ADD CONSTRAINT `event_registrations_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `event_registrations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `films`
--
ALTER TABLE `films`
  ADD CONSTRAINT `fk_film_director` FOREIGN KEY (`director_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `film_ai_tools_detailed`
--
ALTER TABLE `film_ai_tools_detailed`
  ADD CONSTRAINT `film_ai_tools_detailed_ibfk_1` FOREIGN KEY (`film_id`) REFERENCES `films` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `film_categories`
--
ALTER TABLE `film_categories`
  ADD CONSTRAINT `film_categories_ibfk_1` FOREIGN KEY (`film_id`) REFERENCES `films` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `film_categories_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `jury_notes`
--
ALTER TABLE `jury_notes`
  ADD CONSTRAINT `fk_jury_film` FOREIGN KEY (`film_id`) REFERENCES `films` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_jury_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `fk_ur_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ur_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `votes`
--
ALTER TABLE `votes`
  ADD CONSTRAINT `fk_vote_film` FOREIGN KEY (`film_id`) REFERENCES `films` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_vote_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
