'use client';

import { useState } from 'react';
import { useShowPopup } from '@vkruglikov/react-telegram-web-app';
import { useRouter } from 'next/navigation';

type Plugin = {
  name: string;
  description: string;
  author: string;
  downloads: number;
  installed: boolean;
};

const SAMPLE_PLUGINS: Plugin[] = [
  {
    name: "AutoFilter",
    description: "Automatically filter and manage media in your groups",
    author: "@TeamUltroid",
    downloads: 12500,
    installed: true
  },
  {
    name: "ChatBot",
    description: "AI-powered chatbot for your groups",
    author: "@KarbonCopy",
    downloads: 8300,
    installed: false
  },
  // Add more sample plugins...
];

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

// Add this type for the upload modal
type UploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Add the UploadModal component
function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pluginName, setPluginName] = useState('');
  const [description, setDescription] = useState('');
  const showPopup = useShowPopup();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !pluginName.trim()) {
      showPopup({
        message: 'Please fill in all required fields',
        buttons: [{ type: 'ok' }]
      });
      return;
    }

    // TODO: Implement file upload
    showPopup({
      message: 'Uploading plugin...',
      buttons: [{ type: 'ok' }]
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-background border border-white/10 rounded-2xl p-6 z-50">
        <h2 className="text-lg font-bold text-white mb-4">Upload Plugin</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Plugin Name *
            </label>
            <input
              type="text"
              value={pluginName}
              onChange={(e) => setPluginName(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/90 placeholder:text-white/40 focus:outline-none focus:border-primary/50"
              placeholder="MyAwesomePlugin"
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Plugin File *
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".py"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="plugin-file"
              />
              <label
                htmlFor="plugin-file"
                className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-white/20 rounded-xl text-white/60 hover:border-primary/50 hover:text-primary transition-colors cursor-pointer"
              >
                {file ? (
                  <span className="text-sm">{file.name}</span>
                ) : (
                  <span className="text-sm">Choose a .py file</span>
                )}
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-white/60 hover:text-white/90 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
            >
              Upload
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default function PluginsStore() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const showPopup = useShowPopup();
  const [showUploadModal, setShowUploadModal] = useState(false);

  const filteredPlugins = SAMPLE_PLUGINS.filter(plugin => 
    plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              onClick={() => setShowUploadModal(true)}
            >
              <svg className="w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button 
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              onClick={() => showPopup({
                message: 'Coming soon!',
                buttons: [{ type: 'ok' }]
              })}
            >
              <svg className="w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
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
        {filteredPlugins.map((plugin) => (
          <div key={plugin.name} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/20 transition-all duration-300">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-white">{plugin.name}</h3>
              <button
                onClick={() => {
                  showPopup({
                    message: plugin.installed ? 'Uninstall this plugin?' : 'Install this plugin?',
                    buttons: [
                      { type: 'destructive', text: plugin.installed ? 'Uninstall' : 'Install' },
                      { type: 'cancel' }
                    ]
                  });
                }}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
                  plugin.installed 
                    ? 'bg-white/10 text-white/60 hover:bg-white/20' 
                    : 'bg-primary/20 text-primary hover:bg-primary/30'
                }`}
              >
                {plugin.installed ? 'Installed' : 'Install'}
              </button>
            </div>
            <p className="text-sm text-white/70 mb-3">{plugin.description}</p>
            <div className="flex items-center text-xs text-white/40 space-x-4">
              <span>{plugin.author}</span>
              <span>•</span>
              <span>{plugin.downloads.toLocaleString()} downloads</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add bottom navigation */}
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

      <UploadModal 
        isOpen={showUploadModal} 
        onClose={() => setShowUploadModal(false)} 
      />
    </div>
  );
} 