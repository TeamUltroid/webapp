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
};

export const api = {
  async getUserData(): Promise<UserData> {
    try {
      // Use the correct endpoint that we defined in the server
      const response = await fetch(`${BASE_URL}/api/user`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
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
  }
}; 