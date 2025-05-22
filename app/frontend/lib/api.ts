const API_BASE_URL = 'http://localhost:5000';

interface LoginCredentials {
  username: string;
  password: string;
}

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
  
  getUserInfo: async () => {
    return fetchApi('/me');
  },
  
  checkAdminAccess: async () => {
    return fetchApi('/admin');
  },
  
  checkUserAccess: async () => {
    return fetchApi('/user');
  },
};

export { fetchApi }; 