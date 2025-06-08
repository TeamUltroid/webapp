'use client';

import { useState, useEffect } from 'react';
import { useShowPopup } from '@vkruglikov/react-telegram-web-app';
import { useRouter } from 'next/navigation';
import { pluginsApi, Plugin } from '@/utils/api';

// Add the navigation items
const BOTTOM_NAV_ITEMS = [
  {
    label: "Home",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    active: false,
    href: '/'
  },
  {
    label: "Plugins",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    active: true,
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
  }
];

export default function PluginsStore() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const showPopup = useShowPopup();
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlugins = async () => {
    try {
      setLoading(true);
      const data = await pluginsApi.listPlugins();
      setPlugins(data);
      setError(null);
    } catch (error) {
      setError('Failed to load plugins');
      showPopup({
        message: 'Failed to load plugins. Please try again.',
        buttons: [{ type: 'ok' }]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlugins();
  }, []);

  const filteredPlugins = plugins.filter(plugin => 
    plugin.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-white/60">Loading plugins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-white/10">
        <div className="px-4 py-3 flex items-center">
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Plugin Store</h1>
            <p className="text-xs text-white/60">Enhance your Ultroid experience</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              onClick={() => router.push('/plugins/my-plugins')}
            >
              <svg className="w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            <button 
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              onClick={() => router.push('/plugins/upload')}
            >
              <svg className="w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button 
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              onClick={() => loadPlugins()}
            >
              <svg className="w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="sticky top-[57px] z-40 px-4 py-2 bg-background/60 backdrop-blur-xl">
        <div className="relative">
          <input
            type="search"
            placeholder="Search plugins..."
            className="w-full px-4 py-2 pl-10 bg-white/5 border border-white/10 rounded-xl text-white/90 placeholder:text-white/40 focus:outline-none focus:border-primary/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Plugins List */}
      <div className="p-4 space-y-4">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
            {error}
          </div>
        )}
        
        {filteredPlugins.length === 0 && !error && (
          <div className="text-center py-8 text-white/40">
            {searchQuery ? 'No plugins found matching your search' : 'No plugins available'}
          </div>
        )}
        
        {filteredPlugins.map((plugin) => (
          <div key={plugin.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/20 transition-all duration-300">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold text-white">{plugin.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {plugin.is_official && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-500">Official</span>
                  )}
                  {plugin.is_trusted && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-500">Trusted</span>
                  )}
                </div>
              </div>
              <a
                href={plugin.download_link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-lg text-sm font-medium bg-primary/20 text-primary hover:bg-primary/30 transition-all duration-300"
              >
                Download
              </a>
            </div>
            <p className="text-sm text-white/70 mb-3">{plugin.description}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {plugin.tags.map((tag) => (
                <span 
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <div className="px-1.5 py-1.5 rounded-2xl bg-background/40 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20">
          <div className="flex items-center gap-1">
            {BOTTOM_NAV_ITEMS.map((item) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 