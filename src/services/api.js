const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Retrieves the stored JWT token from localStorage.
 */
export const getAuthToken = () => {
  return localStorage.getItem('certgen_token') || '';
};

/**
 * Helper to construct Authorization header with Bearer token.
 */
const getAuthHeaders = (extraHeaders = {}) => {
  const token = getAuthToken();
  const headers = { ...extraHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Administrator / Organizer Login
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, user: Object}>}
 */
export const login = async (email, password) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Authentication failed with status ${response.status}`);
  }

  // Store token and user in localStorage
  if (data.token) {
    localStorage.setItem('certgen_token', data.token);
  }
  if (data.user) {
    localStorage.setItem('certgen_user', JSON.stringify(data.user));
  }

  return data;
};

/**
 * Administrator / Organizer Registration
 * @param {Object} userData { name, email, password, role }
 * @returns {Promise<{token: string, user: Object}>}
 */
export const register = async (userData) => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Registration failed with status ${response.status}`);
  }

  if (data.token) {
    localStorage.setItem('certgen_token', data.token);
  }
  if (data.user) {
    localStorage.setItem('certgen_user', JSON.stringify(data.user));
  }

  return data;
};

/**
 * Uploads a spreadsheet (CSV or Excel) for a given event to be parsed by the backend.
 * @param {string} eventId
 * @param {File} file
 * @returns {Promise<any>}
 */
export const uploadSpreadsheet = async (eventId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BASE_URL}/events/${eventId}/upload`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Upload failed with status ${response.status}`);
  }
  return data;
};

/**
 * Saves a certificate canvas layout template to MongoDB.
 * @param {Object} templateData { name, backgroundImageUrl, canvasWidth, canvasHeight, canvasState }
 * @returns {Promise<any>}
 */
export const saveTemplate = async (templateData) => {
  const response = await fetch(`${BASE_URL}/templates`, {
    method: 'POST',
    headers: getAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(templateData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Failed to save template with status ${response.status}`);
  }
  return data;
};

/**
 * Requests bulk certificate generation for an event's participants.
 * Receives the generated ZIP archive as a binary Blob and triggers the browser download.
 * @param {string} eventId
 * @param {Array<Object>} participants
 * @param {string} [downloadFilename]
 * @returns {Promise<boolean>}
 */
export const generateCertificates = async (eventId, participants, downloadFilename = 'certificates_batch.zip') => {
  const response = await fetch(`${BASE_URL}/events/${eventId}/generate`, {
    method: 'POST',
    headers: getAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ participants }),
  });

  if (!response.ok) {
    let errorMsg = `Generation failed with status ${response.status}`;
    try {
      const errData = await response.json();
      if (errData.message) errorMsg = errData.message;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  // Handle binary ZIP stream
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);

  let resolvedFilename = downloadFilename;
  const disposition = response.headers.get('Content-Disposition');
  if (disposition && disposition.includes('filename=')) {
    const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
    if (filenameMatch && filenameMatch[1]) {
      resolvedFilename = filenameMatch[1];
    }
  }

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', resolvedFilename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }, 100);

  return true;
};

/**
 * Queries the public certificate verification endpoint by certificateId.
 * Public endpoint - no authorization token needed.
 * @param {string} certificateId
 * @returns {Promise<any>}
 */
export const verifyCertificate = async (certificateId) => {
  const cleanId = encodeURIComponent(certificateId?.trim());
  const response = await fetch(`${BASE_URL}/verify/${cleanId}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    return {
      success: false,
      isValid: false,
      status: response.status,
      message: data.message || 'Certificate verification failed.',
    };
  }
  return data;
};

/**
 * Creates a new Event document in MongoDB linking a templateId.
 * @param {Object} eventData { title, date, organization, templateId, category, signatory }
 * @returns {Promise<any>}
 */
export const createEvent = async (eventData) => {
  const response = await fetch(`${BASE_URL}/events`, {
    method: 'POST',
    headers: getAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(eventData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Failed to create event (status ${response.status})`);
  }
  return data;
};

/**
 * Retrieves all registered Events populated with their linked Templates.
 * @returns {Promise<any>}
 */
export const getEvents = async () => {
  const response = await fetch(`${BASE_URL}/events`, {
    method: 'GET',
    headers: getAuthHeaders({
      'Accept': 'application/json',
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Failed to retrieve events (status ${response.status})`);
  }
  return data;
};

export default {
  login,
  register,
  getAuthToken,
  uploadSpreadsheet,
  saveTemplate,
  generateCertificates,
  verifyCertificate,
  createEvent,
  getEvents,
};
