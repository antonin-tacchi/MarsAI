import { useEffect, useState } from "react";

/**
 * Custom hook for Google OAuth authentication
 * Uses Google Identity Services (GSI)
 *
 * @param {Function} onSuccess - Callback function when authentication succeeds
 * @param {Function} onError - Callback function when authentication fails
 * @returns {Object} - { isLoaded, signIn }
 */
export const useGoogleAuth = (onSuccess, onError) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsLoaded(true);

      // Initialize Google Sign-In
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      if (response.credential) {
        // Call the backend to verify the credential
        const result = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/google`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            credential: response.credential,
          }),
        });

        const data = await result.json();

        if (data.success) {
          onSuccess(data);
        } else {
          onError(new Error(data.message || "Google authentication failed"));
        }
      }
    } catch (error) {
      console.error("Google auth error:", error);
      onError(error);
    }
  };

  const signIn = () => {
    if (window.google && isLoaded) {
      window.google.accounts.id.prompt();
    } else {
      console.warn("Google Sign-In not loaded yet");
    }
  };

  return { isLoaded, signIn };
};
