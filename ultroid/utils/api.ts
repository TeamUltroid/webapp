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
  user_id?: number;
  start_param?: string;
  auth_date?: number;
};

// API
export type InvoiceData = {
    amount: number;
};

// MiniApp settings type
export type MiniAppSettings = {
  showStarDonation?: boolean;
  donationAmounts?: string;
  [key: string]: any;
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

// Helper function to make API calls
const makeApiRequest = async (endpoint: string, method: string = 'GET', data?: any, requireAuth: boolean = false) => {
  try {
    const apiUrl = await getApiUrl();
    if (!apiUrl) {
      throw new Error('API URL is not configured');
    }

    const headers: HeadersInit = {};
    
    // Only add auth headers for protected routes
    if (requireAuth) {
      const initData = getInitData();
      if (!initData) {
        throw new Error('Authentication required but no init data available');
      }
      // Use the tma prefix for local system authentication
      headers['Authorization'] = `tma ${initData}`;
    }

    const options: RequestInit = {
      method,
      headers
    };

    if (data) {
      if (data instanceof FormData) {
        options.body = data;
      } else {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(data);
      }
    }

    console.log(`Making ${method} request to ${apiUrl}${endpoint}`);
    const response = await fetch(`${apiUrl}${endpoint}`, options);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        data: errorText
      });
      
      let errorMessage = `API request failed: ${response.status}`;
      try {
        // Try to parse error as JSON
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage += ` - ${errorData.message}`;
        } else {
          errorMessage += ` - ${errorText}`;
        }
      } catch (e) {
        // If error text is not JSON
        errorMessage += ` - ${errorText}`;
      }
      
      throw new Error(errorMessage);
    }

    // For empty responses
    if (response.status === 204) {
      return {};
    }

    // Check Content-Type header
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      // Return text for non-JSON responses
      const text = await response.text();
      try {
        // Try to parse as JSON anyway
        return JSON.parse(text);
      } catch (e) {
        // Return text if not parseable as JSON
        return { text };
      }
    }
  } catch (error) {
    console.error(`API request error for ${endpoint}:`, error);
    throw error;
  }
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
      return await makeApiRequest('/api/user');
    } catch (error) {
      console.error('API Error:', error);
      // Return fallback data for development
      return {
        name: "Ultroid User",
        bio: "Ultroid Bot Owner",
        avatar: "",
        user_id: 1,
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
      return await makeApiRequest('/api/admin/restart', 'POST');
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async updateBot(): Promise<{ status: string }> {
    try {
      return await makeApiRequest('/api/admin/update', 'POST');
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Get mini app settings
  async getMiniAppSettings(): Promise<MiniAppSettings> {
    try {
      // GET requests don't need authentication
      return await makeApiRequest('/api/settings/miniapp');
    } catch (error) {
      console.error('Error fetching mini app settings:', error);
      // Return empty object on error
      return {};
    }
  },

  // Save a mini app setting
  async saveMiniAppSetting(key: string, value: any): Promise<{ success: boolean; message: string }> {
    try {
      // POST requests need authentication
      return await makeApiRequest('/api/settings/miniapp', 'POST', { key, value }, true);
    } catch (error) {
      console.error('Error saving mini app setting:', error);
      throw error;
    }
  },

  async createInvoice(data: InvoiceData): Promise<{ url: string }> {
    return makeApiRequest('/api/miniapp/create_invoice', 'POST', data, true);
  },
};

// API client for the Ultroid Central API via local proxy

export interface Plugin {
  id: number;
  title: string;
  description: string;
  tags: string[];
  uploaded_by: number;
  download_link: string;
  translation_file_link?: string;
  is_trusted: boolean;
  is_official: boolean;
  created_at: string;
  updated_at: string;
}

export interface PluginUpload {
  title: string;
  description: string;
  tags: string[];
  plugin: File;
  translation?: File;
}

export interface PluginUpdate extends Partial<PluginUpload> {}

export const pluginsApi = {
  // List all plugins with optional filters - Public endpoint
  listPlugins: async (filters?: { is_trusted?: boolean; is_official?: boolean; uploaded_by?: number }) => {
    const params = new URLSearchParams();
    if (filters?.is_trusted !== undefined) params.append('is_trusted', String(filters.is_trusted));
    if (filters?.is_official !== undefined) params.append('is_official', String(filters.is_official));
    if (filters?.uploaded_by !== undefined) params.append('uploaded_by', String(filters.uploaded_by));

    return makeApiRequest(`/api/v1/plugins${params.toString() ? `?${params.toString()}` : ''}`) as Promise<Plugin[]>;
  },

  // Get a single plugin by ID - Public endpoint
  getPlugin: async (pluginId: number) => {
    return makeApiRequest(`/api/v1/plugins/${pluginId}`) as Promise<Plugin>;
  },

  // Upload a new plugin - Protected endpoint
  uploadPlugin: async (data: PluginUpload) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('tags', JSON.stringify(data.tags));
    formData.append('plugin', data.plugin);
    if (data.translation) {
      formData.append('translation', data.translation);
    }

    return makeApiRequest('/api/v1/plugins', 'POST', formData, true) as Promise<Plugin>;
  },

  // Update an existing plugin - Protected endpoint
  updatePlugin: async (pluginId: number, data: PluginUpdate) => {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.tags) formData.append('tags', JSON.stringify(data.tags));
    if (data.plugin) formData.append('plugin', data.plugin);
    if (data.translation) formData.append('translation', data.translation);

    return makeApiRequest(`/api/v1/plugins/${pluginId}`, 'PUT', formData, true) as Promise<Plugin>;
  },

  // Delete a plugin - Protected endpoint
  deletePlugin: async (pluginId: number) => {
    return makeApiRequest(`/api/v1/plugins/${pluginId}`, 'DELETE', null, true) as Promise<{ message: string }>;
  },

  // Get plugins by uploader ID - Public endpoint
  getPluginsByUploader: async (uploaderId: number) => {
    try {
      console.log(`Fetching plugins for uploader ID: ${uploaderId}`);
      return makeApiRequest(`/api/v1/plugins/uploader/${uploaderId}`, 'GET', null, true) as Promise<Plugin[]>;
    } catch (error) {
      console.error(`Error fetching plugins for uploader ${uploaderId}:`, error);
      throw error;
    }
  },

  // Compute plugin updates - Public endpoint
  computeUpdates: async (pluginVersions: Record<string, string>) => {
    return makeApiRequest('/api/v1/plugins/compute_diff', 'POST', pluginVersions) as Promise<{ 
      updates_available: Array<{ id: number; title: string; updated_at: string }> 
    }>;
  },
}; 