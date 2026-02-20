const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";
const API_URL = `${API_BASE}/api`;

/**
 * Get authentication token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem("token");
};

/**
 * Get all pending films waiting for moderation
 * @returns {Promise<Array>} List of pending films
 */
export const getPendingFilms = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/admin/films/pending`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch pending films");
    }

    return data;
  } catch (error) {
    console.error("Error fetching pending films:", error);
    throw error;
  }
};

/**
 * Approve a film
 * @param {number} filmId - Film ID to approve
 * @returns {Promise<Object>} Response data
 */
export const approveFilm = async (filmId) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/admin/films/${filmId}/approve`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to approve film");
    }

    return data;
  } catch (error) {
    console.error("Error approving film:", error);
    throw error;
  }
};

/**
 * Reject a film with an optional reason
 * @param {number} filmId - Film ID to reject
 * @param {string} reason - Rejection reason (optional)
 * @returns {Promise<Object>} Response data
 */
export const rejectFilm = async (filmId, reason = "") => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/admin/films/${filmId}/reject`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rejection_reason: reason }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to reject film");
    }

    return data;
  } catch (error) {
    console.error("Error rejecting film:", error);
    throw error;
  }
};

/**
 * Get film statistics for admin dashboard
 * @returns {Promise<Object>} Statistics object
 */
export const getFilmStats = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/admin/films/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch stats");
    }

    return data;
  } catch (error) {
    console.error("Error fetching film stats:", error);
    throw error;
  }
};