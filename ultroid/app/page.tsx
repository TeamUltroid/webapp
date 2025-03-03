'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { MainButton, useShowPopup, useThemeParams } from '@vkruglikov/react-telegram-web-app';
import * as api from '@/utils/api';
import { UserData } from '@/utils/api';
import { getFallbackAvatar } from '@/utils/telegram';

// Helper function to get user avatar
const getUserAvatar = (userData: UserData) => {
  return userData.avatar || getFallbackAvatar(userData.name);
};

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  
  const showPopup = useShowPopup();
  const { themeParams, colorScheme } = useThemeParams();

  // Handle scroll for parallax and reveal effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Check if elements are in viewport
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );

      [headerRef, statsRef, skillsRef].forEach((ref) => {
        if (ref.current) {
          observer.observe(ref.current);
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
  
  // Enhanced parallax transforms with smooth easing
  const headerTransform = `translateY(${scrollY * 0.2}px) scale(${1 - scrollY * 0.0005})`;
  const statsTransform = `translateY(${scrollY * 0.1}px)`;
  const skillsTransform = `translateY(${scrollY * 0.05}px)`;

  return (
    <div className="min-h-screen p-6 overflow-hidden">
      {/* Top Header with Ultroid Button */}
      <div className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-background/80 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Ultroid
            </span>
          </div>
          <button 
            onClick={() => window.open('https://github.com/TeamUltroid/Ultroid', '_blank')}
            className="px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all duration-300 flex items-center space-x-2 group"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            <span className="font-medium">GitHub</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
          </button>
        </div>
      </div>

      {/* Add padding to account for fixed header */}
      <div className="pt-20">
        {/* Enhanced background elements with more dynamic effects */}
        <div className="fixed top-0 left-0 w-full h-full -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-background opacity-90"></div>
          <div className="absolute top-[10%] left-[10%] w-96 h-96 rounded-full bg-primary/20 blur-3xl transform -translate-y-1/2 animate-float-slow"></div>
          <div className="absolute top-[60%] right-[10%] w-[30rem] h-[30rem] rounded-full bg-accent/10 blur-3xl transform -translate-y-1/2 animate-float-medium"></div>
          <div className="absolute top-[80%] left-[30%] w-80 h-80 rounded-full bg-secondary/15 blur-3xl transform -translate-y-1/2 animate-float-fast"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.1),transparent_70%)] animate-pulse"></div>
        </div>
        
        {/* Enhanced profile header with glass effect and animations */}
        <header 
          ref={headerRef}
          className={`text-center mb-16 relative transform transition-all duration-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
          style={{ transform: headerTransform, transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
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
              {userData.bio}
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

        {/* Enhanced stats section with glass morphism */}
        <div 
          ref={statsRef}
          className={`mb-16 relative transform transition-all duration-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
          style={{ transform: statsTransform, transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
        >
          <div className="p-8 rounded-2xl bg-white/5 text-center shadow-xl backdrop-blur-md border border-white/10 hover:border-primary/20 transition-all duration-500 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
              <div className="text-sm text-gray-400 uppercase tracking-wider font-medium">Uptime since</div>
              <div className="text-5xl font-bold text-primary mb-2 transition-all duration-300 group-hover:scale-110">{userData.stats.uptime}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced skills section with staggered animations */}
        <div 
          ref={skillsRef}
          className={`mb-16 relative transform transition-all duration-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
          style={{ transform: skillsTransform, transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
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

        {/* Enhanced MainButton with animation */}
        <div className="fixed bottom-6 left-0 right-0 flex justify-center">
          <MainButton 
            text="CONTACT ME"
            onClick={() => {
              if (userData.telegram_url) {
                window.open(userData.telegram_url, '_blank');
              } else {
                showPopup({
                  message: 'Contact information not available',
                  buttons: [{ type: 'ok' }]
                });
              }
            }}
            color="#6366f1"
          />
        </div>
      </div>
    </div>
  );
}
