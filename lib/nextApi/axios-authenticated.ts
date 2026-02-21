import axios from "axios";

const authenticatedClient = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// Prevent race condition: track if refresh is in progress
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

authenticatedClient.interceptors.response.use(
  (response) => {
    // Handle user account response to check claims
    if (response.config.url?.includes("/api/user/account")) {
      const user = response.data;

      // Check if email is confirmed
      if (!user.confirmed) {
        window.location.href = "/confirm-email";
        return Promise.reject(new Error("Email not confirmed"));
      }

      // Check if account is active
      if (user.status !== "ACTIVE") {
        window.location.href = "/account-inactive";
        return Promise.reject(new Error("Account inactive"));
      }
    }

    return response;
  },
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;

      // If refresh is already in progress, wait for it
      if (isRefreshing && refreshPromise) {
        try {
          await refreshPromise;
          // Retry original request with new token
          return authenticatedClient(error.config);
        } catch {
          // Refresh failed, redirect will happen from the original refresh attempt
          return Promise.reject(error);
        }
      }

      // Start refresh
      isRefreshing = true;
      refreshPromise = axios
        .post("/api/auth/refresh-token")
        .then(() => {})
        .catch((refreshError) => {
          // Refresh failed - redirect to login
          window.location.href = "/login";
          throw refreshError;
        })
        .finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });

      try {
        await refreshPromise;
        // Retry original request
        return authenticatedClient(error.config);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export { authenticatedClient };
