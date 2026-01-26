import { getToken } from "./authService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Submit a new film with file upload (public - no auth required)
 * @param {FormData} formData - FormData with film data and files
 * @param {Function} onProgress - Optional progress callback (receives percentage)
 * @returns {Promise<Object>} Response with film data
 */
export const submitFilm = async (formData, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          reject(new Error(data.message || "La soumission a echoue"));
        }
      } catch {
        reject(new Error("Erreur lors du traitement de la reponse"));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Erreur reseau lors de l'envoi du fichier"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Envoi annule"));
    });

    xhr.open("POST", `${API_URL}/films/submit`);
    xhr.send(formData);
  });
};

/**
 * Get approved films (public catalog)
 * @returns {Promise<Object>} Response with films array
 */
export const getCatalog = async () => {
  try {
    const response = await fetch(`${API_URL}/films/catalog`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la recuperation du catalogue");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Check submission status by email (public)
 * @param {string} email - Director's email
 * @returns {Promise<Object>} Response with submissions array
 */
export const checkStatus = async (email) => {
  try {
    const response = await fetch(`${API_URL}/films/status?email=${encodeURIComponent(email)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la verification du statut");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// ============================================
// PROTECTED ENDPOINTS (Jury/Admin only)
// ============================================

/**
 * Get all films (jury/admin)
 * @param {string} status - Optional status filter (pending, approved, rejected)
 * @returns {Promise<Object>} Response with films array
 */
export const getAllFilms = async (status = null) => {
  try {
    const url = status ? `${API_URL}/films?status=${status}` : `${API_URL}/films`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la recuperation des films");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get pending films (jury/admin)
 * @returns {Promise<Object>} Response with films array
 */
export const getPendingFilms = async () => {
  try {
    const response = await fetch(`${API_URL}/films/pending`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la recuperation des films en attente");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get film statistics (jury/admin)
 * @returns {Promise<Object>} Response with stats
 */
export const getFilmStats = async () => {
  try {
    const response = await fetch(`${API_URL}/films/stats`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la recuperation des statistiques");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get a single film by ID (jury/admin)
 * @param {number} id - Film ID
 * @returns {Promise<Object>} Response with film data
 */
export const getFilmById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/films/${id}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Film non trouve");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Approve a film (jury/admin)
 * @param {number} id - Film ID
 * @returns {Promise<Object>} Response with updated film
 */
export const approveFilm = async (id) => {
  try {
    const response = await fetch(`${API_URL}/films/${id}/approve`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de l'approbation");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Reject a film (jury/admin)
 * @param {number} id - Film ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} Response with updated film
 */
export const rejectFilm = async (id, reason = "") => {
  try {
    const response = await fetch(`${API_URL}/films/${id}/reject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ reason }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors du refus");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a film (admin only)
 * @param {number} id - Film ID
 * @returns {Promise<Object>} Response
 */
export const deleteFilm = async (id) => {
  try {
    const response = await fetch(`${API_URL}/films/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la suppression");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get films for jury dashboard with ratings (jury/admin)
 * @returns {Promise<Object>} Response with films and ratings
 */
export const getFilmsForJury = async () => {
  try {
    const response = await fetch(`${API_URL}/films/jury`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la recuperation des films");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all categories (jury/admin)
 * @returns {Promise<Object>} Response with categories array
 */
export const getCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/films/categories`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la recuperation des categories");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Rate a film (jury/admin)
 * @param {number} id - Film ID
 * @param {number} rating - Rating 1-5
 * @param {string} comment - Optional comment
 * @returns {Promise<Object>} Response with rating data
 */
export const rateFilm = async (id, rating, comment = "") => {
  try {
    const response = await fetch(`${API_URL}/films/${id}/rate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ rating, comment }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la notation");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update film categories (jury/admin)
 * @param {number} id - Film ID
 * @param {number[]} categoryIds - Array of category IDs
 * @returns {Promise<Object>} Response with updated categories
 */
export const updateFilmCategories = async (id, categoryIds) => {
  try {
    const response = await fetch(`${API_URL}/films/${id}/categories`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ category_ids: categoryIds }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la mise a jour des categories");
    }

    return data;
  } catch (error) {
    throw error;
  }
};
