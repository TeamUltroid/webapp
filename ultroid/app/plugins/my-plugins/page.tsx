'use client';

import { useState, useEffect, useCallback } from 'react';
import { useShowPopup } from '@vkruglikov/react-telegram-web-app';
import { useRouter } from 'next/navigation';
import { pluginsApi, Plugin, api } from '@/utils/api';

export default function MyPlugins() {
  const router = useRouter();
  const showPopup = useShowPopup();
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  const loadMyPlugins = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get user data first
      const userData = await api.getUserData();
      
      if (!userData?.user_id) {
        setError('You must be logged in to view your plugins');
        setPlugins([]);
        return;
      }
      
      setUserId(userData.user_id);
      
      // Then get plugins for this user
      const data = await pluginsApi.listPlugins({ uploaded_by: userData.user_id });
      setPlugins(data || []);
      setError(null);
    } catch (error) {
      console.error('Error loading plugins:', error);
      setError('Failed to load your plugins');
      showPopup({
        message: 'Failed to load your plugins. Please try again.',
        buttons: [{ type: 'ok' }]
      });
    } finally {
      setLoading(false);
    }
  }, [showPopup]);

  useEffect(() => {
    loadMyPlugins();
  }, [loadMyPlugins]);

  const handleDeletePlugin = (plugin: Plugin) => {
    showPopup({
      message: `Do you want to delete "${plugin.title}"?`,
      buttons: [
        { 
          id: "delete", 
          type: "destructive", 
          text: "Delete"
        },
        { 
          id: "cancel", 
          type: "cancel" 
        }
      ]
    }).then((value: any) => {
      if (value && value.button_id === 'delete') {
        pluginsApi.deletePlugin(plugin.id)
          .then(() => {
            loadMyPlugins();
            showPopup({
              message: 'Plugin deleted successfully',
              buttons: [{ type: 'ok' }]
            });
          })
          .catch(error => {
            console.error('Error deleting plugin:', error);
            showPopup({
              message: 'Failed to delete plugin',
              buttons: [{ type: 'ok' }]
            });
          });
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-white/60">Loading your plugins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-white/10">
        <div className="px-4 py-3 flex items-center">
          <button
            className="mr-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            onClick={() => router.back()}
          >
            <svg className="w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">My Plugins</h1>
            <p className="text-xs text-white/60">Manage your uploaded plugins</p>
          </div>
          <div className="flex items-center gap-2">
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
              onClick={() => loadMyPlugins()}
            >
              <svg className="w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Plugins List */}
      <div className="p-4 space-y-4">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
            {error}
          </div>
        )}
        
        {plugins.length === 0 && !error && (
          <div className="text-center py-8 text-white/40">
            <p>You haven&apos;t uploaded any plugins yet</p>
            <button
              className="mt-4 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
              onClick={() => router.push('/plugins/upload')}
            >
              Upload Your First Plugin
            </button>
          </div>
        )}
        
        {plugins.map((plugin) => (
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
              <div className="flex items-center gap-2">
                <a
                  href={plugin.download_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-lg text-sm font-medium bg-primary/20 text-primary hover:bg-primary/30 transition-all duration-300"
                >
                  Download
                </a>
                <button
                  onClick={() => handleDeletePlugin(plugin)}
                  className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all duration-300"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button
                  onClick={() => router.push(`/plugins/edit/${plugin.id}`)}
                  className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all duration-300"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-sm text-white/70 mb-3">{plugin.description}</p>
            <div className="flex flex-wrap gap-2">
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
    </div>
  );
} 