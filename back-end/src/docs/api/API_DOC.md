# MarsAI API Documentation

**Base URL**: `/api`  
**Version**: 1.0  
**Auth**: JWT token (24h validity)

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Authentication](#authentication)
3. [Films](#films)
4. [Jury & Ratings](#jury--ratings)
5. [Admin](#admin)
6. [Statistics](#statistics)
7. [Error Handling](#error-handling)

---

## Quick Start

### User Roles

- **Public** - Submit films, view catalog
- **Jury (1)** - Rate films
- **Admin (2)** - Manage users, films, stats
- **Super Jury (3)** - Admin + distribution system

### Test the API

```bash
curl https://api.marsai.com/api/films/public/catalog
```

---

## Authentication

### Register

`POST /auth/register`

Request:

```json
{
  "name": "Marie Dubois",
  "email": "marie@example.com",
  "password": "password123"
}
```

Response (201):

```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "name": "Marie Dubois", "email": "..." },
    "token": "eyJhbGc..."
  }
}
```

Errors: `400` (validation), `409` (email exists)

---

### Login

`POST /auth/login`

Request:

```json
{
  "email": "marie@example.com",
  "password": "password123"
}
```

Response (200): Same as register

Errors: `401` (invalid credentials)

---

### Get Profile

`GET /auth/profile`

Headers: `Authorization: Bearer <token>`

Response (200):

```json
{
  "success": true,
  "data": { "id": 1, "name": "Marie Dubois", "email": "..." }
}
```

---

## Films

### Public Routes

#### List Catalog

`GET /films/public/catalog`

Returns all approved films with basic info.

---

#### Get Film Details

`GET /films/public/:id`

Returns full film details (approved only).

---

#### Get Ranking

`GET /films/ranking`

Returns films ranked by average rating.

Response:

```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "film_id": 3,
      "title": "Digital Dreams",
      "average_rating": 9.2,
      "rating_count": 15
    }
  ]
}
```

---

#### Submit Film

`POST /films`

**Type**: `multipart/form-data`  
**Rate Limit**: 5 submissions / 15 min

Files (required):

- `poster` - Image, max 5MB (jpg, png, webp)
- `film` - Video, max 800MB (mp4, webm, mov)
- `thumbnail` - Image, max 3MB (optional)

Fields (required):

- `title`, `country`, `description`
- `director_firstname`, `director_lastname`, `director_email`

Fields (optional):

- `ai_tools_used`, `ai_certification`, `director_bio`, `director_school`
- `director_website`, `social_instagram`, `social_youtube`, `social_vimeo`

Example:

```javascript
const formData = new FormData();
formData.append('poster', posterFile);
formData.append('film', filmFile);
formData.append('title', 'My Film');
formData.append('country', 'France');
formData.append('description', 'Description...');
formData.append('director_firstname', 'Marie');
formData.append('director_lastname', 'Dubois');
formData.append('director_email', 'marie@example.com');

fetch('/api/films', {
  method: 'POST',
  body: formData
});
```

Response (201):

```json
{
  "success": true,
  "message": "Film soumis avec succès",
  "data": {
    "id": 42,
    "status": "pending",
    "film_url": "/uploads/films/film_123.mp4"
  }
}
```

Errors: `400` (invalid file), `429` (rate limit)

---

### Routes Without Auth

#### List Films (Paginated)

`GET /films?page=1&limit=20&sortField=title&sortOrder=ASC`

Query params:

- `page` (default: 1)
- `limit` (default: 20, max: 20)
- `all=1` (returns max 50 films)
- `sortField` (created_at | title | country | id)
- `sortOrder` (ASC | DESC)

Returns approved films only.

---

#### Get Film Stats

`GET /films/stats`

Returns stats by status, country, AI tool, category.

---

#### Get Film by ID

`GET /films/:id`

Returns full film details.

---

#### Update Film Status

`PATCH /films/:id/status`

**Auth**: Jury (1), Admin (2), Super Jury (3)

Request:

```json
{
  "status": "approved",
  "rejection_reason": "Required if status=rejected"
}
```

Valid transitions:

- pending → approved, rejected
- approved → rejected
- rejected → approved

Response (200):

```json
{
  "success": true,
  "data": { "id": 5, "status": "approved" }
}
```

Errors: `400` (invalid transition), `404` (not found)

---

## Jury & Ratings

**Auth Required**: Jury (1), Admin (2), Super Jury (3)

### List Films to Rate

`GET /jury/films`

Returns films with user's ratings.

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Sunspring",
      "user_rating": 9,
      "user_comment": "Excellent!",
      "average_rating": 8.5,
      "total_ratings": 12
    }
  ]
}
```

---

### Get Film Details

`GET /jury/films/:id`

Returns film with all ratings (transparency).

---

### Rate Film

`POST /jury/films/:id/rate`

Request:

```json
{
  "rating": 8.5,
  "comment": "Great film!"
}
```

Constraints:

- `rating`: 0-10 (required)
- `comment`: max 2000 chars (optional)

Response (200):

```json
{
  "success": true,
  "data": {
    "film_id": 1,
    "rating": 8.5,
    "average_rating": 8.6,
    "total_ratings": 13
  }
}
```

Note: Upserts (creates or updates).

---

### Get My Ratings

`GET /jury/my-ratings`

Returns all ratings by current user.

---

### Get Assigned Films

`GET /jury/assigned-films?page=1&limit=20`

Returns films assigned by Super Jury.

Response includes stats:

```json
{
  "stats": {
    "totalAssigned": 15,
    "totalRefused": 2,
    "totalUnrated": 5,
    "totalRated": 8
  }
}
```

---

### Refuse Assigned Film

`POST /jury/films/:id/refuse`

Request:

```json
{
  "reason": "Conflict of interest"
}
```

Errors: `400` (no reason), `404` (not assigned), `409` (already refused)

---

### Delete Rating

`DELETE /jury/films/:id/rate`

---

### Alternative Rating System

The following endpoints duplicate `/jury` functionality. Use `/jury` routes instead.

- `POST /ratings` - Create rating
- `PUT /ratings/:id` - Update rating
- `GET /ratings/my-ratings` - Get user's ratings
- `GET /ratings/film/:filmId` - Get film ratings
- `GET /ratings/stats/:filmId` - Get film stats
- `GET /ratings/:id` - Get rating by ID
- `DELETE /ratings/:id` - Delete rating

---

## Admin

**Auth Required**: Admin (2), Super Jury (3)q

### User Management

#### List Users

`GET /admin/users`

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Marie Dubois",
      "email": "marie@example.com",
      "roles": [1, 2]
    }
  ]
}
```

---

#### Create User

`POST /admin/users`

Request:

```json
{
  "name": "Alice Martin",
  "email": "alice@example.com",
  "password": "secure123",
  "roles": [1, 2]
}
```

Errors: `400` (missing fields), `409` (email exists)

---

#### Update User

`PUT /admin/users/:id`

Request (all optional):

```json
{
  "name": "New Name",
  "email": "newemail@example.com",
  "password": "newpass",
  "roles": [1, 2, 3]
}
```

Note: Providing `roles` replaces all existing roles.

---

#### Delete User

`DELETE /admin/users/:id`

Also deletes user's roles, ratings, and assignments.

---

### Film Management

#### List Films (Admin)

`GET /admin/films?status=pending&page=1`

Shows all statuses (pending, approved, rejected).  
Max limit: 50 per page.

---

#### Update Film Status

`PATCH /admin/films/:id/status`

Same as `PATCH /films/:id/status`.

---

#### Delete Film

`DELETE /admin/films/:id`

Deletes film, ratings, assignments, categories.  
Note: Upload files NOT deleted automatically.

---

### Distribution System

#### Get Distribution Stats

`GET /admin/distribution/stats`

Response:

```json
{
  "success": true,
  "data": {
    "filmCount": 35,
    "assignmentCount": 175,
    "juryCount": 10,
    "juries": [
      {
        "id": 3,
        "name": "Marie Dubois",
        "assigned_films": 18,
        "rated": 12,
        "remaining": 6
      }
    ]
  }
}
```

---

#### Preview Distribution

`POST /admin/distribution/preview`

Simulates distribution without applying.

Request:

```json
{
  "R": 5,
  "Lmax": 20
}
```

Parameters:

- `R` - Jurors per film
- `Lmax` - Max films per juror

Formula: `filmCount × R ≤ juryCount × Lmax`

Response (200):

```json
{
  "success": true,
  "data": {
    "total": 175,
    "juryCount": 10,
    "filmCount": 35,
    "min": 17,
    "max": 18,
    "avg": "17.5"
  }
}
```

Errors: `400` (insufficient capacity)

---

#### Generate Distribution

`POST /admin/distribution/generate`

Applies distribution. WARNING: Deletes all existing assignments.

Request: Same as preview

Algorithm: Round-robin for load balancing.

---

### CMS

#### Update Page Content

`PUT /admin/pages/:slug`

Request:

```json
{
  "content_fr": { "hero": { "title": "MarsAI 2026" } },
  "content_en": { "hero": { "title": "MarsAI 2026" } }
}
```

Upserts (creates if not exists).

---

## Statistics

**Auth Required**: Admin (2), Super Jury (3)

### Overview

`GET /admin/stats/overview`

Returns counts by status, AI usage, total votes.

---

### By Country

`GET /admin/stats/by-country`

---

### By Category

`GET /admin/stats/by-category`

---

### AI Usage

`GET /admin/stats/ai-usage`

Returns percentage of films with AI certification.

---

### Timeline

`GET /admin/stats/timeline?months=12`

Query: `months` (default: 6, max: 24)

Returns submissions per month.

---

### Top Rated

`GET /admin/stats/top-rated?limit=10`

Query: `limit` (default: 10, max: 50)

Returns top films (minimum 3 ratings required).

---

### Jury Activity

`GET /admin/stats/jury-activity`

Returns total jury members, ratings, most active jurors.

---

### All Stats

`GET /admin/stats/all`

Returns overview, by-country, by-category, ai-usage in one call.

---

## Error Handling

### Standard Format

```json
{
  "success": false,
  "message": "Error description"
}
```

### HTTP Status Codes

| Code | Meaning           | Example                         |
| ---- | ----------------- | ------------------------------- |
| 200  | OK                | Successful GET/PUT/PATCH/DELETE |
| 201  | Created           | Successful POST                 |
| 400  | Bad Request       | Validation failed               |
| 401  | Unauthorized      | Missing/invalid token           |
| 403  | Forbidden         | Insufficient permissions        |
| 404  | Not Found         | Resource doesn't exist          |
| 409  | Conflict          | Email already exists            |
| 429  | Too Many Requests | Rate limit exceeded             |
| 500  | Server Error      | Internal error                  |

### JavaScript Error Handling

```javascript
try {
  const res = await fetch('/api/films/999', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const data = await res.json();

  if (!data.success) {
    switch (res.status) {
      case 401: window.location.href = '/login'; break;
      case 403: alert('Permission denied'); break;
      case 404: alert('Not found'); break;
      case 429: alert('Too many requests'); break;
      default: alert(data.message);
    }
    return;
  }

  console.log(data.data);

} catch (error) {
  console.error('Network error:', error);
}
```

---

## Reference

### Data Models

```typescript
User {
  id: number
  name: string          // max 100
  email: string         // max 100, unique
  password: string      // hashed
  created_at: datetime
  roles: number[]       // [1, 2, 3]
}

Film {
  id: number
  title: string                   // max 255
  country: string                 // max 100
  description: string             // max 2000
  film_url: string
  poster_url: string
  thumbnail_url: string | null
  ai_tools_used: string | null
  ai_certification: 0 | 1

  director_firstname: string      // max 100
  director_lastname: string       // max 100
  director_email: string          // max 255
  director_bio: string | null     // max 2000
  director_school: string | null  // max 255
  director_website: string | null

  status: 'pending' | 'approved' | 'rejected'
  status_changed_at: datetime | null
  status_changed_by: number | null
  rejection_reason: string | null
  created_at: datetime
}

JuryRating {
  id: number
  film_id: number
  user_id: number
  rating: number        // 0-10
  comment: string | null // max 2000
  created_at: datetime
  updated_at: datetime
}
```

### JWT Token Structure

```typescript
{
  userId: number
  email: string
  roles: number[]
  iat: number
  exp: number  // +24h
}
```

Header format: `Authorization: Bearer <token>`

---

## Examples

### Login and Rate a Film

```javascript
// 1. Login
const loginRes = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'jury@example.com',
    password: 'password123'
  })
});
const { data } = await loginRes.json();
const token = data.token;

// 2. List films
const filmsRes = await fetch('/api/jury/films', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const films = await filmsRes.json();

// 3. Rate a film
const rateRes = await fetch('/api/jury/films/1/rate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    rating: 9,
    comment: 'Excellent film!'
  })
});
```

---

### Submit a Film

```html
<form id="submitForm">
  <input type="file" name="poster" required>
  <input type="file" name="film" required>
  <input name="title" required>
  <input name="country" required>
  <textarea name="description" required></textarea>
  <input name="director_firstname" required>
  <input name="director_lastname" required>
  <input type="email" name="director_email" required>
  <button type="submit">Submit</button>
</form>

<script>
document.getElementById('submitForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const res = await fetch('/api/films', {
    method: 'POST',
    body: formData
  });

  const data = await res.json();
  if (data.success) {
    alert('Film submitted! ID: ' + data.data.id);
  } else {
    alert('Error: ' + data.message);
  }
});
</script>
```

---

## Utilities

### Health Check

`GET /health`

Response:

```json
{
  "ok": true,
  "service": "marsai-api",
  "timestamp": "2026-01-26T15:30:00.000Z"
}
```

---

### Test Database

`GET /test/db`

WARNING: Disable in production.

Response:

```json
{
  "success": true,
  "message": "Database connection successful",
  "data": {
    "database": "marsai",
    "users": 15,
    "films": 55
  }
}
```

---

### Test Users

`GET /test/users`

WARNING: Disable in production.

Returns first 10 users.

---

**Last updated**: January 2026  
**Support**: support@marsai.com
