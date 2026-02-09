-- Migration: Add performance indexes
-- Date: 2026-02-09
-- Description: Add composite and missing indexes to optimize slow queries
--
-- Run with: mysql -u root -p marsai < BDD/migration_add_indexes.sql

-- --------------------------------------------------------
-- films: composite index for WHERE status = ? ORDER BY created_at
-- Optimizes: findAllApproved(), findForPublicCatalog(), findForPublicView()
-- --------------------------------------------------------
ALTER TABLE `films`
  ADD INDEX `idx_status_created` (`status`, `created_at`);

-- --------------------------------------------------------
-- films: composite index for rate-limit check by director email + date
-- Optimizes: countRecentByEmail() - WHERE director_email = ? AND created_at >= ?
-- --------------------------------------------------------
ALTER TABLE `films`
  ADD INDEX `idx_director_email_created` (`director_email`, `created_at`);

-- --------------------------------------------------------
-- jury_ratings: composite index for user ratings ordered by update date
-- Optimizes: findByUser() - WHERE user_id = ? ORDER BY updated_at DESC
-- --------------------------------------------------------
ALTER TABLE `jury_ratings`
  ADD INDEX `idx_user_updated` (`user_id`, `updated_at`);

-- --------------------------------------------------------
-- invitations: index on email for invitation lookups
-- Optimizes: lookups by email address
-- --------------------------------------------------------
ALTER TABLE `invitations`
  ADD INDEX `idx_inv_email` (`email`);

-- --------------------------------------------------------
-- email_logs: index on recipient_email for email history lookups
-- Optimizes: lookups by recipient email
-- --------------------------------------------------------
ALTER TABLE `email_logs`
  ADD INDEX `idx_recipient_email` (`recipient_email`);
