const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Login user (Jury/Admin only)
 * @param {Object} credentials - User credentials (email, password)
 * @returns {Promise<Object>} Response with user data and token
 */
export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "La connexion a echoue");
    }

    // Store token and user data if login successful
    if (data.data?.token) {
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

/**
 * Get current user from localStorage
 * @returns {Object|null} User object or null
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Get authentication token
 * @returns {string|null} Token or null
 */
export const getToken = () => {
  return localStorage.getItem("token");
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Check if user is admin
 * @returns {boolean}
 */
export const isAdmin = () => {
  const user = getCurrentUser();
  return user?.roles?.includes(2) || false;
};

/**
 * Check if user is jury
 * @returns {boolean}
 */
export const isJury = () => {
  const user = getCurrentUser();
  return user?.roles?.includes(1) || false;
};
