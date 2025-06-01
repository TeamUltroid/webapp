const API_URL = process.env.NEXT_PUBLIC_ULTROID_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_ULTROID_API_URL is not defined in environment variables');
}

// For Telegram Web App, we need to use HTTPS in production
// but for local development, we'll use HTTP
const BASE_URL = API_URL;

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
  const initData = getInitData();
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };

  if (initData) {
    headers['Authorization'] = `tma ${initData}`;
  } else {
    console.warn('No init data available - request will not be authenticated');
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
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