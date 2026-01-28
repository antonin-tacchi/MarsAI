const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Submit a new film
 * @param {FormData} formData - Film data with files
 * @returns {Promise<Object>} Response with film data
 */
export const submitFilm = async (formData) => {
  try {
    const response = await fetch(`${API_URL}/films`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Film submission failed");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get approved films for catalog
 * @returns {Promise<Object>} Response with films array
 */
export const getApprovedFilms = async () => {
  try {
    const response = await fetch(`${API_URL}/films/catalog`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch films");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Check film submission status by email
 * @param {string} email - Director email
 * @returns {Promise<Object>} Response with submission status
 */
export const checkFilmStatus = async (email) => {
  try {
    const response = await fetch(`${API_URL}/films/status?email=${encodeURIComponent(email)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to check status");
    }

    return data;
  } catch (error) {
    throw error;
  }
};
