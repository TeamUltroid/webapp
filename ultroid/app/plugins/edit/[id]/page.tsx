'use client';

import { useState, useEffect } from 'react';
import { useShowPopup } from '@vkruglikov/react-telegram-web-app';
import { useRouter } from 'next/navigation';
import { pluginsApi, Plugin } from '@/utils/api';

export default function EditPlugin({ params }: { params: { id: string } }) {
  const router = useRouter();
  const showPopup = useShowPopup();
  const [plugin, setPlugin] = useState<Plugin | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [pluginFile, setPluginFile] = useState<File | null>(null);
  const [translationFile, setTranslationFile] = useState<File | null>(null);

  const pluginId = parseInt(params.id);

  useEffect(() => {
    const loadPlugin = async () => {
      try {
        setLoading(true);
        const data = await pluginsApi.getPlugin(pluginId);
        setPlugin(data);
        
        // Initialize form values
        setTitle(data.title);
        setDescription(data.description);
        setTags(data.tags);
        
        setError(null);
      } catch (error) {
        console.error('Error loading plugin:', error);
        setError('Failed to load plugin details');
        showPopup({
          message: 'Failed to load plugin details. Please try again.',
          buttons: [{ type: 'ok' }]
        });
      } finally {
        setLoading(false);
      }
    };

    if (pluginId) {
      loadPlugin();
    }
  }, [pluginId]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // Basic validation
      if (!title.trim()) {
        showPopup({
          message: 'Title is required',
          buttons: [{ type: 'ok' }]
        });
        return;
      }

      if (!description.trim()) {
        showPopup({
          message: 'Description is required',
          buttons: [{ type: 'ok' }]
        });
        return;
      }

      if (tags.length === 0) {
        showPopup({
          message: 'At least one tag is required',
          buttons: [{ type: 'ok' }]
        });
        return;
      }

      // Prepare data for update
      const updateData = {
        title,
        description,
        tags,
        plugin: pluginFile,
        translation: translationFile
      };
      
      // Update plugin
      await pluginsApi.updatePlugin(pluginId, updateData);
      
      showPopup({
        message: 'Plugin updated successfully',
        buttons: [{ type: 'ok' }]
      });
      
      // Navigate back to my plugins
      router.push('/plugins/my-plugins');
      
    } catch (error) {
      console.error('Error updating plugin:', error);
      showPopup({
        message: 'Failed to update plugin. Please try again.',
        buttons: [{ type: 'ok' }]
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-white/60">Loading plugin details...</p>
        </div>
      </div>
    );
  }

  if (!plugin) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="text-center p-4">
          <svg className="w-12 h-12 text-red-500 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold mt-4 text-white">Plugin Not Found</h2>
          <p className="mt-2 text-white/60">The plugin you're looking for doesn't exist or you don't have permission to edit it.</p>
          <button
            className="mt-6 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
            onClick={() => router.push('/plugins/my-plugins')}
          >
            Back to My Plugins
          </button>
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
            <h1 className="text-lg font-bold text-white">Edit Plugin</h1>
            <p className="text-xs text-white/60">Update your plugin details</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-white/80 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/90 placeholder:text-white/40 focus:outline-none focus:border-primary/50"
            placeholder="Plugin title"
            required
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-white/80 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/90 placeholder:text-white/40 focus:outline-none focus:border-primary/50"
            placeholder="Describe what your plugin does"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">
            Tags
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/90 placeholder:text-white/40 focus:outline-none focus:border-primary/50"
              placeholder="Add a tag (e.g., utility, fun)"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-3 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <span 
                key={tag}
                className="px-2 py-1 rounded-full bg-white/10 text-white/80 flex items-center"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-white/60 hover:text-white/90"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <label htmlFor="plugin-file" className="block text-sm font-medium text-white/80 mb-1">
            Plugin File (.py) <span className="text-white/40">(Optional)</span>
          </label>
          <input
            type="file"
            id="plugin-file"
            accept=".py"
            onChange={(e) => setPluginFile(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/90 file:bg-primary/20 file:text-primary file:border-0 file:rounded-lg file:px-3 file:py-1 file:mr-3"
          />
          <p className="text-xs text-white/40 mt-1">Leave empty to keep the current file</p>
        </div>
        
        <div>
          <label htmlFor="translation-file" className="block text-sm font-medium text-white/80 mb-1">
            Translation File (.yml) <span className="text-white/40">(Optional)</span>
          </label>
          <input
            type="file"
            id="translation-file"
            accept=".yml,.yaml"
            onChange={(e) => setTranslationFile(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/90 file:bg-primary/20 file:text-primary file:border-0 file:rounded-lg file:px-3 file:py-1 file:mr-3"
          />
          <p className="text-xs text-white/40 mt-1">Leave empty to keep the current file</p>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className={`w-full px-4 py-3 rounded-xl text-white font-semibold ${
              submitting
                ? 'bg-primary/50 cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90 transition-colors'
            }`}
          >
            {submitting ? 'Updating...' : 'Update Plugin'}
          </button>
        </div>
      </form>
    </div>
  );
} 