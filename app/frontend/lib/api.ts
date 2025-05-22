const API_BASE_URL = 'http://localhost:5000';

interface LoginCredentials {
  username: string;
  password: string;
}

// Standard fetch with error handling
async function fetchApi(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const defaultOptions: RequestInit = {
    credentials: 'include',
    ...options,
  };
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, defaultOptions);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'An unknown error occurred'
    }));
    throw new Error(error.error_description || error.message || response.statusText);
  }

  if (response.headers.get('content-type')?.includes('application/json')) {
    return await response.json();
  }
  
  return true;
}

// Authentication check that doesn't throw on 401
async function fetchAuthCheck(endpoint: string): Promise<{ authenticated: boolean; data?: any }> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: 'include',
  });
  
  if (response.status === 401) {
    return { authenticated: false };
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'An unknown error occurred'
    }));
    console.warn("API error:", error);
    return { authenticated: false };
  }

  if (response.headers.get('content-type')?.includes('application/json')) {
    const data = await response.json();
    return { authenticated: true, data };
  }
  
  return { authenticated: true };
}

export const AuthApi = {
  login: async (credentials: LoginCredentials) => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    return fetchApi('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
  },
  
  logout: async () => {
    return fetchApi('/logout', {
      method: 'POST',
    });
  },
  
  // Using the non-throwing version for auth checks
  getUserInfo: async () => {
    return fetchAuthCheck('/me');
  },
  
  checkAdminAccess: async () => {
    return fetchAuthCheck('/admin');
  },
  
  checkUserAccess: async () => {
    return fetchAuthCheck('/user');
  },
};

export { fetchApi, fetchAuthCheck }; 