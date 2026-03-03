export const API_URL = "http://127.0.0.1:5000";

export const fetchWithCredentials = (url, options = {}) => {
  return fetch(`${API_URL}${url}`, {
    credentials: "include",
    ...options,
  });
};
