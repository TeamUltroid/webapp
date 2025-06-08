'use client';

import { useState } from 'react';
import { useShowPopup } from '@vkruglikov/react-telegram-web-app';
import { useRouter } from 'next/navigation';
import { pluginsApi } from '@/utils/api';

export default function UploadPlugin() {
  const router = useRouter();
  const [pluginFile, setPluginFile] = useState<File | null>(null);
  const [translationFile, setTranslationFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const showPopup = useShowPopup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pluginFile || !title.trim()) {
      showPopup({
        message: 'Please fill in all required fields',
        buttons: [{ type: 'ok' }]
      });
      return;
    }

    try {
      setIsUploading(true);
      await pluginsApi.uploadPlugin({
        title: title.trim(),
        description: description.trim(),
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        plugin: pluginFile,
        translation: translationFile || undefined
      });
      
      showPopup({
        message: 'Plugin uploaded successfully!',
        buttons: [{ type: 'ok' }]
      });
      router.push('/plugins');
    } catch (error) {
      showPopup({
        message: 'Failed to upload plugin. Please try again.',
        buttons: [{ type: 'ok' }]
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-white/10">
        <div className="px-4 py-3 flex items-center">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-lg text-white/60 hover:text-white/90 hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="ml-2">
            <h1 className="text-lg font-bold text-white">Upload Plugin</h1>
            <p className="text-xs text-white/60">Share your plugin with the community</p>
          </div>
        </div>
      </div>

      {/* Upload Form */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Plugin Name *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/90 placeholder:text-white/40 focus:outline-none focus:border-primary/50"
              placeholder="MyAwesomePlugin"
              disabled={isUploading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/90 placeholder:text-white/40 focus:outline-none focus:border-primary/50 min-h-[100px]"
              placeholder="Describe what your plugin does..."
              disabled={isUploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/90 placeholder:text-white/40 focus:outline-none focus:border-primary/50"
              placeholder="utility, media, fun"
              disabled={isUploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Plugin File * (.py)
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".py"
                onChange={(e) => setPluginFile(e.target.files?.[0] || null)}
                className="hidden"
                id="plugin-file"
                disabled={isUploading}
              />
              <label
                htmlFor="plugin-file"
                className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-white/20 rounded-xl text-white/60 hover:border-primary/50 hover:text-primary transition-colors cursor-pointer"
              >
                {pluginFile ? (
                  <span className="text-sm">{pluginFile.name}</span>
                ) : (
                  <span className="text-sm">Choose a .py file</span>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Translation File (optional) (.yml)
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".yml,.yaml"
                onChange={(e) => setTranslationFile(e.target.files?.[0] || null)}
                className="hidden"
                id="translation-file"
                disabled={isUploading}
              />
              <label
                htmlFor="translation-file"
                className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-white/20 rounded-xl text-white/60 hover:border-primary/50 hover:text-primary transition-colors cursor-pointer"
              >
                {translationFile ? (
                  <span className="text-sm">{translationFile.name}</span>
                ) : (
                  <span className="text-sm">Choose a .yml file</span>
                )}
              </label>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full px-4 py-3 rounded-xl bg-primary/20 text-primary hover:bg-primary/30 transition-colors disabled:opacity-50 font-medium"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Plugin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 