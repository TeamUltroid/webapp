'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { MainButton, useShowPopup, useThemeParams, useInitData, BackButton } from '@vkruglikov/react-telegram-web-app';
import * as api from '@/utils/api';
import { UserData } from '@/utils/api';
import { getFallbackAvatar } from '@/utils/telegram';
import { useRouter } from 'next/navigation';

// Helper function to get user avatar
const getUserAvatar = (userData: UserData) => {
  return userData.avatar || getFallbackAvatar(userData.name);
};

// Add this helper function to parse and render bio with clickable usernames
const renderBioWithLinks = (bio: string) => {
  // Split bio into parts, preserving @username mentions
  const parts = bio.split(/(@[a-zA-Z0-9_]+)/g);
  
  return parts.map((part, index) => {
    // Check if this part is a username mention
    if (part.startsWith('@')) {
      const username = part.substring(1); // Remove @ symbol
      return (
        <a
          key={index}
          href={`https://t.me/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

// Add this near the top of the file, after imports
const ULTROID_CHANNELS = [
  {
    name: "Ultroid Updates",
    username: "ultroidupdates",
    description: "Get the latest updates about Ultroid",
    type: "channel"
  },
  {
    name: "TeamUltroid",
    username: "TeamUltroid",
    description: "Official Ultroid Support Group",
    type: "group"
  }
];

// Add this type for action buttons
type ActionButton = {
  label: string;
  action: () => void;
  icon: React.ReactNode;
};

const getBottomNavItems = (isOwner: boolean) => {
// Add this near the top with other constants
return [
  {
    label: "Home",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    active: true,
    href: '/'
  },
  isOwner && {
    label: "Plugins",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    active: false,
    href: '/plugins'
  },
  {
    label: "Settings",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    active: false,
    href: '/settings'
  }];
};

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [miniAppSettings, setMiniAppSettings] = useState<{
    showStarDonation: boolean;
    donationAmounts: string;
  }>({
    showStarDonation: false,
    donationAmounts: "1,5,50"
  });
  
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  
  const showPopup = useShowPopup();
  const [colorScheme, themeParams] = useThemeParams();
  const initData = useInitData();
  const router = useRouter();

  // Check if authenticated user is the bot owner
  const isOwner = initData && userData?.user_id === initData[0]?.user?.id;

  // Parse donation amounts
  const donationAmountArray = useMemo(() => {
    return miniAppSettings.donationAmounts.split(',').map(amount => amount.trim());
  }, [miniAppSettings.donationAmounts]);

  // Handle donation button click
  const handleDonate = (amount: string) => {
    showPopup({
      message: `Thanks for donating ${amount} stars! ✨`,
      buttons: [{ type: 'ok' }]
    });
  };

  const actionButtons: ActionButton[] = [
    {
      label: "View Assistant",
      action: () => {
        showPopup({
          message: 'Updating assistant...',
          buttons: [{ type: 'ok' }]
        });
      },
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    },
    {
      label: "Restart",
      action: async () => {
        try {
          showPopup({
            message: 'Restarting bot...',
            buttons: [{ type: 'ok' }]
          });
          const result = await api.api.restartBot();
          showPopup({
            message: result.status || 'Bot restarted successfully',
            buttons: [{ type: 'ok' }]
          });
        } catch (error) {
          showPopup({
            message: 'Failed to restart bot. Please try again.',
            buttons: [{ type: 'ok' }]
          });
        }
      },
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    },
    {
      label: "Update",
      action: async () => {
        try {
          showPopup({
            message: 'Checking for updates...',
            buttons: [{ type: 'ok' }]
          });
          const result = await api.api.updateBot();
          showPopup({
            message: result.status || 'Bot updated successfully',
            buttons: [{ type: 'ok' }]
          });
        } catch (error) {
          showPopup({
            message: 'Failed to update bot. Please try again.',
            buttons: [{ type: 'ok' }]
          });
        }
      },
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      
      setLastScrollY(currentScrollY);
      setScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Fetch mini app settings
  useEffect(() => {
    const fetchMiniAppSettings = async () => {
      try {
        const settings = await api.api.getMiniAppSettings();
        if (settings) {
          setMiniAppSettings({
            showStarDonation: settings.showStarDonation || false,
            donationAmounts: settings.donationAmounts || "1,5,50"
          });
        }
      } catch (error) {
        console.error('Error fetching mini app settings:', error);
      }
    };

    fetchMiniAppSettings();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const data = await api.api.getUserData();
        setUserData(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data');
        showPopup({
          message: 'Failed to load user data. Please try again.',
          buttons: [{ type: 'ok' }]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [showPopup]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80">
        <div className="text-center relative">
          <div className="absolute -inset-4 bg-primary/10 blur-xl rounded-full animate-pulse"></div>
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-6"></div>
            <p className="text-foreground text-lg font-medium animate-pulse">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80">
        <div className="text-center relative p-8">
          <div className="absolute -inset-4 bg-destructive/10 blur-xl rounded-full"></div>
          <div className="relative space-y-4">
            <p className="text-3xl mb-4">😕</p>
            <p className="mb-6 text-foreground/90 text-lg">{error || 'Could not load profile'}</p>
            <button 
              className="px-6 py-3 rounded-lg bg-primary text-white shadow-lg hover:shadow-primary/50 transition-all duration-300 hover:-translate-y-1"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const avatarUrl = getUserAvatar(userData);
  
  const headerTransform = `translateY(${scrollY * 0.2}px) scale(${1 - scrollY * 0.0005})`;
  const statsTransform = `translateY(${scrollY * 0.1}px)`;
  const skillsTransform = `translateY(${scrollY * 0.05}px)`;

  return (
    <div className="min-h-[100dvh] p-6 pb-24 overflow-hidden">
      <div className={`fixed top-0 left-0 right-0 z-50 transform transition-transform duration-300 ${
        showHeader ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="px-4 py-2 bg-background/80 backdrop-blur-lg border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                Ultroid
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowBottomSheet(true)}
                className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all duration-300"
                aria-label="Show Ultroid Information"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button 
                onClick={() => window.open('https://github.com/TeamUltroid/Ultroid', '_blank')}
                className="px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all duration-300 flex items-center space-x-2 group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.031 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                <span className="font-medium">GitHub</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showBottomSheet && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowBottomSheet(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-white/10 rounded-t-3xl p-6 z-50 transform transition-transform duration-300 ease-out">
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-6">Join Ultroid Community</h3>
            <div className="space-y-4">
              {ULTROID_CHANNELS.map((channel) => (
                <a
                  key={channel.username}
                  href={`https://t.me/${channel.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start space-x-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors duration-200"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    {channel.type === 'channel' ? (
                      <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold mb-1">{channel.name}</h4>
                    <p className="text-sm text-white/70">{channel.description}</p>
                  </div>
                  <svg className="w-5 h-5 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="pt-20 pb-24">
        <div className="fixed top-0 left-0 w-full h-full -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-background opacity-90"></div>
          <div className="absolute top-[10%] left-[10%] w-96 h-96 rounded-full bg-primary/20 blur-3xl transform -translate-y-1/2 animate-float-slow"></div>
          <div className="absolute top-[60%] right-[10%] w-[30rem] h-[30rem] rounded-full bg-accent/10 blur-3xl transform -translate-y-1/2 animate-float-medium"></div>
          <div className="absolute top-[80%] left-[30%] w-80 h-80 rounded-full bg-secondary/15 blur-3xl transform -translate-y-1/2 animate-float-fast"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.1),transparent_70%)] animate-pulse"></div>
        </div>
        
        <header 
          ref={headerRef}
          className={`text-center mb-16 relative transform transition-all duration-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
          style={{ transform: headerTransform }}
        >
          <div className="relative w-48 h-48 mx-auto mb-8">
            <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl ring-2 ring-primary/20 transition-transform duration-300 hover:scale-105">
              <Image 
                src={avatarUrl} 
                alt={userData.name} 
                fill 
                className="object-cover" 
                priority
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3 text-white relative">
            <span className="relative">
              {userData.name}
              <span className="absolute -inset-1 bg-primary/10 blur-sm rounded-lg -z-10"></span>
            </span>
          </h1>
          {userData.bio && (
            <p className="text-lg text-gray-300/90 max-w-md mx-auto mb-6 leading-relaxed">
              {renderBioWithLinks(userData.bio)}
            </p>
          )}
          
          {userData.telegram_url && (
            <a 
              href={userData.telegram_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block px-6 py-2 rounded-full text-sm bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:scale-105 transition-all duration-300 backdrop-blur-sm"
            >
              @{userData.username}
            </a>
          )}
        </header>


        <div 
          ref={skillsRef}
          className={`mb-16  transform transition-all duration-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
          style={{ transform: skillsTransform }}
        >
          <h2 className="text-2xl font-bold mb-6 text-white relative inline-block">
            <span className="relative">
              Skills
              <span className="absolute -inset-1 bg-primary/10 blur-sm rounded-lg -z-10"></span>
            </span>
          </h2>
          <div className="flex flex-wrap gap-3">
            {userData.skills.map((skill, index) => (
              <span
                key={skill}
                className="px-5 py-2.5 rounded-lg text-sm bg-white/5 text-white/90 border border-white/10 shadow-lg backdrop-blur-md hover:border-primary/20 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-primary/20"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  transform: `translateY(${scrollY * 0.02 * (index % 3 + 1)}px)`,
                  opacity: isVisible ? 1 : 0,
                  transition: `all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Donation Buttons - Show only if enabled in settings */}
        {miniAppSettings.showStarDonation && (
          <div className="my-6 mt-20 ">
            <h2 className="text-2xl font-bold mb-6 text-white relative inline-block">
              <span className="relative">
                Support with Stars ⭐
                <span className="absolute -inset-1 bg-primary/10 blur-sm rounded-lg -z-10"></span>
              </span>
            </h2>
            <div className="flex flex-col space-y-3">
              {donationAmountArray.map((amount, index) => (
                <button
                  key={amount}
                  onClick={() => handleDonate(amount)}
                  className="flex items-center justify-between p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-yellow-400/50 transition-all duration-300 group hover:shadow-lg hover:shadow-yellow-400/10 w-full"
                >
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">⭐</div>
                    <div>
                      <div className="text-xl font-bold text-yellow-400 group-hover:scale-105 transition-transform duration-300">Pay {amount} stars</div>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-full p-2 group-hover:bg-yellow-400/20 transition-colors duration-300">
                    <svg className="w-5 h-5 text-white/60 group-hover:text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons - Only show for bot owner */}
        {isOwner && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-white relative inline-block">
              <span className="relative">
                Bot Control
                <span className="absolute -inset-1 bg-primary/10 blur-sm rounded-lg -z-10"></span>
              </span>
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {actionButtons.map((button, index) => (
                <button
                  key={button.label}
                  onClick={button.action}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/20 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    {button.icon}
                  </div>
                  <span className="text-sm font-medium text-white/90">{button.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {isOwner && <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 transition-transform duration-300 ${
          showBottomSheet ? 'translate-y-full' : 'translate-y-0'
        }`}>
          <div className="px-1.5 py-1.5 rounded-2xl bg-background/40 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20">
            <div className="flex items-center gap-1">
              {getBottomNavItems(isOwner).map((item) => (item && (
                <button
                  key={item.label}
                  className={`relative flex items-center px-4 py-2 rounded-xl transition-all duration-200 ${
                    item.active 
                      ? 'text-primary bg-white/10' 
                      : 'text-white/60 hover:text-white/90 hover:bg-white/5'
                  }`}
                  onClick={() => router.push(item.href)}
                >
                  <div className={`transition-transform duration-200 ${
                    item.active ? 'scale-110' : 'scale-100'
                  }`}>
                    {item.icon}
                  </div>
                  <span className="ml-2 text-xs font-medium">{item.label}</span>
                  {item.active && (
                    <div className="absolute left-2 right-2 bottom-1 h-0.5 rounded-full bg-primary/50" />
                  )}
                </button>
              )))}
            </div>
          </div>
        </div>}
      </div>
    </div>
  );
}
