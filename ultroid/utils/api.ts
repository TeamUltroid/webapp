// Declare global window interface
declare global {
  interface Window {
    __ULTROID_CONFIG__: {
      apiUrl: string;
    };
  }
}

// Helper function to get API URL - only fetches once and caches in window object
const getApiUrl = async (): Promise<string> => {
  // Return from window if already loaded
  if (typeof window !== 'undefined' && window.__ULTROID_CONFIG__?.apiUrl) {
    return window.__ULTROID_CONFIG__.apiUrl;
  }

  try {
    const response = await fetch('/config.json');
    const config = await response.json();
    
    // Store in window object
    if (typeof window !== 'undefined') {


      window.__ULTROID_CONFIG__ = {
        apiUrl: config.apiUrl
      };
    }
    
    return config.apiUrl || process.env.NEXT_PUBLIC_ULTROID_API_URL;
  } catch (error) {
    console.error('Failed to load config:', error);
    // Fallback to env variable if config fails
    const fallbackUrl = process.env.NEXT_PUBLIC_ULTROID_API_URL;
    
    // Store fallback in window object
    if (typeof window !== 'undefined') {
      window.__ULTROID_CONFIG__ = {
        apiUrl: fallbackUrl as string
      };
    }
    
    return fallbackUrl as string;
  }
};

export type UserData = {
  name: string;
  bio: string;
  avatar: string;
  username: string | null;
  telegram_url: string | null;
  stats: {
    uptime: string;
  };
  skills: string[];
  authenticated_user?: Record<string, any>;
  start_param?: string;
  auth_date?: number;
};

// Helper function to get init data
const getInitData = (): string | null => {
  try {
    // Check if we're in a Telegram Web App environment
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      return window.Telegram.WebApp.initData;
    }
    return null;
  } catch (error) {
    console.error('Error getting init data:', error);
    return null;
  }
};

// Helper function to make authenticated API calls
const makeAuthenticatedRequest = async (endpoint: string, method: string = 'GET') => {
  const apiUrl = await getApiUrl();
  if (!apiUrl) {
    throw new Error('API URL is not configured');
  }

  const initData = getInitData();
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };

  if (initData) {
    headers['Authorization'] = `tma ${initData}`;
  } else {
    console.warn('No init data available - request will not be authenticated');
  }

  const response = await fetch(`${apiUrl}${endpoint}`, {
    method,
    headers
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      data: errorData
    });
    throw new Error(`API request failed: ${response.status} - ${errorData}`);
  }

  return response.json();
};

export const api = {
  // Set API URL programmatically
  setApiUrl(url: string) {
    if (typeof window !== 'undefined') {
      window.__ULTROID_CONFIG__ = {
        apiUrl: url
      };
    }
  },

  async getUserData(): Promise<UserData> {
    try {
      return await makeAuthenticatedRequest('/api/user');
    } catch (error) {
      console.error('API Error:', error);
      // Return fallback data for development
      return {
        name: "Ultroid User",
        bio: "Ultroid Bot Owner",
        avatar: "",
        username: "ultroid_user",
        telegram_url: "https://t.me/ultroid_user",
        stats: {
          uptime: "0m"
        },
        skills: ["Telegram Bot Management", "Automation", "Python"]
      };
    }
  },

  async restartBot(): Promise<{ status: string }> {
    try {
      return await makeAuthenticatedRequest('/api/admin/restart', 'POST');
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async updateBot(): Promise<{ status: string }> {
    try {
      return await makeAuthenticatedRequest('/api/admin/update', 'POST');
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
}; 