-- MarsAI Database Optimization: Indexes
-- Version: 1.0
-- Date: 2026-02-05
-- Description: Add missing indexes to optimize slow queries
--
-- IDENTIFIED SLOW QUERIES:
-- 1. Catalog findAll: WHERE status=? ORDER BY created_at DESC (no composite index)
-- 2. countRecentByEmail: WHERE director_email=? AND created_at>=? (two separate indexes)
-- 3. Stats GROUP BY country / ai_tools_used (no index on country)
-- 4. LIKE search on title/description (no fulltext index)
-- 5. Invitations lookup by email (no index)
-- 6. Events queries by date/type (no index)
-- 7. Email logs lookup by recipient (no index)

USE marsai;

-- ============================================================
-- 1. FILMS TABLE - Composite indexes for common query patterns
-- ============================================================

-- Composite index for the catalog default query:
-- WHERE status = 'APPROVED' ORDER BY created_at DESC LIMIT ? OFFSET ?
-- Covers: findAll with status filter + default sort
-- Replaces the need to use two separate indexes (idx_status + idx_created_at)
CREATE INDEX idx_films_status_created_at ON films (status, created_at DESC);

-- Composite index for rate limiting query:
-- WHERE director_email = ? AND created_at >= (NOW() - INTERVAL ? MINUTE)
-- Much more efficient than scanning idx_director_email then filtering by date
CREATE INDEX idx_films_email_created ON films (director_email, created_at);

-- Index on country for GROUP BY (countByCountry) and IN filter (findAll)
CREATE INDEX idx_films_country ON films (country);

-- Index on title for ORDER BY f.title ASC/DESC sort option
CREATE INDEX idx_films_title ON films (title);

-- Fulltext index for text search (LIKE '%keyword%' cannot use B-tree indexes)
-- This enables MATCH(...) AGAINST(...) as a much faster alternative to LIKE
ALTER TABLE films ADD FULLTEXT INDEX ft_films_search (title, description);

-- Fulltext index for AI tools text search
ALTER TABLE films ADD FULLTEXT INDEX ft_films_ai_tools (ai_tools_used);

-- ============================================================
-- 2. INVITATIONS TABLE
-- ============================================================

-- Index for looking up invitations by email (common admin operation)
CREATE INDEX idx_invitations_email ON invitations (email);

-- Composite index for checking pending invitations (email + expiration)
CREATE INDEX idx_invitations_email_expires ON invitations (email, expires_at);

-- ============================================================
-- 3. EVENTS TABLE
-- ============================================================

-- Index for date-based event queries (upcoming events, calendar views)
CREATE INDEX idx_events_event_date ON events (event_date);

-- Index for filtering events by type
CREATE INDEX idx_events_event_type ON events (event_type);

-- ============================================================
-- 4. EMAIL_LOGS TABLE
-- ============================================================

-- Composite index for looking up email history by recipient and type
CREATE INDEX idx_email_logs_recipient ON email_logs (recipient_email, email_type);

-- Index for querying logs by film
-- (fk_email_film already exists, but adding sent_at for time-based queries)
CREATE INDEX idx_email_logs_film_sent ON email_logs (film_id, sent_at);

-- ============================================================
-- 5. JURY_RATINGS TABLE - Aggregation optimization
-- ============================================================

-- Composite index for calculating average ratings per film
-- Covers: SELECT AVG(rating) FROM jury_ratings WHERE film_id = ?
CREATE INDEX idx_jury_ratings_film_rating ON jury_ratings (film_id, rating);
