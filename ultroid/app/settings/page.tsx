'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShowPopup } from '@vkruglikov/react-telegram-web-app';
import Image from 'next/image';

// Navigation items (same as other pages)
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
    active: true,
    href: '/settings'
  }
];

type SettingSection = {
  title: string;
  description: string;
  icon: React.ReactNode;
  settings: Setting[];
};

type Setting = {
  key: string;
  label: string;
  type: 'toggle' | 'select' | 'input' | 'connection' | 'textarea' | 'tags' | 'avatar';
  value: any;
  options?: { label: string; value: any }[];
  description?: string;
};

type Connection = {
  service: string;
  connected: boolean;
  icon: React.ReactNode;
  description: string;
  username?: string;
};

const SETTINGS_SECTIONS: SettingSection[] = [
  {
    title: "Bot Settings",
    description: "Configure your Ultroid bot's behavior",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    settings: [
      {
        key: "pmPermit",
        label: "PM Permit",
        type: "toggle",
        value: true,
        description: "Require users to get approval before messaging"
      },
      {
        key: "inlineMode",
        label: "Inline Mode",
        type: "toggle",
        value: true,
        description: "Enable inline query handling"
      }
    ]
  },
  {
    title: "Security",
    description: "Security and privacy settings",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    settings: [
      {
        key: "logLevel",
        label: "Log Level",
        type: "select",
        value: "info",
        options: [
          { label: "Debug", value: "debug" },
          { label: "Info", value: "info" },
          { label: "Warning", value: "warning" },
          { label: "Error", value: "error" }
        ]
      },
      {
        key: "apiKey",
        label: "API Key",
        type: "input",
        value: "",
        description: "Your bot's API key"
      }
    ]
  },
  {
    title: "Profile",
    description: "Manage your bot's public profile",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    settings: [
      {
        key: "name",
        label: "Display Name",
        type: "input",
        value: "",
        description: "Your bot's display name"
      },
      {
        key: "bio",
        label: "Bio",
        type: "textarea",
        value: "",
        description: "A short description about your bot"
      },
      {
        key: "skills",
        label: "Skills",
        type: "tags",
        value: [],
        description: "Add skills that your bot has (press Enter to add)"
      },
      {
        key: "avatar",
        label: "Avatar",
        type: "avatar",
        value: "",
        description: "Your bot's profile picture"
      }
    ]
  },
  {
    title: "Connections",
    description: "Link your accounts to enable additional features",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    settings: [
      {
        key: "spotify",
        label: "Spotify",
        type: "connection",
        value: {
          service: "Spotify",
          connected: false,
          icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          ),
          description: "Play music in your groups and channels",
          username: undefined
        }
      }
    ]
  }
];

type ExpandedSections = {
  [key: string]: boolean;
};

export default function Settings() {
  const router = useRouter();
  const showPopup = useShowPopup();
  const [settings, setSettings] = useState(SETTINGS_SECTIONS);
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({});

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const handleSettingChange = (sectionIndex: number, settingKey: string, value: any) => {
    const newSettings = [...settings];
    const setting = newSettings[sectionIndex].settings.find(s => s.key === settingKey);
    if (setting) {
      setting.value = value;
      setSettings(newSettings);
      
      // Show saving indicator
      showPopup({
        message: 'Saving settings...',
        buttons: [{ type: 'ok' }]
      });
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-white/10">
        <div className="px-4 py-3 flex items-center">
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Settings</h1>
            <p className="text-xs text-white/60">Configure your Ultroid instance</p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="p-4">
        {settings.map((section, sectionIndex) => (
          <div key={section.title} className={`rounded-xl bg-white/5 border border-white/10 overflow-hidden transition-all duration-200 ${
            expandedSections[section.title] 
              ? 'mb-4' 
              : 'mb-0'
          }`}>
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  {section.icon}
                </div>
                <div className="text-left">
                  <h2 className="text-lg font-semibold text-white">{section.title}</h2>
                  <p className="text-sm text-white/60">{section.description}</p>
                </div>
              </div>
              <svg 
                className={`w-5 h-5 text-white/60 transition-transform duration-200 ${
                  expandedSections[section.title] ? 'rotate-180' : ''
                }`} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className={`space-y-3 transition-all duration-200 ${
              expandedSections[section.title] 
                ? 'max-h-[1000px] opacity-100 p-4' 
                : 'max-h-0 opacity-0 pointer-events-none p-0 m-0'
            }`}>
              {section.settings.map(setting => (
                <div key={setting.key} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-white">{setting.label}</label>
                    {setting.type === 'toggle' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSettingChange(sectionIndex, setting.key, !setting.value);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          setting.value ? 'bg-primary' : 'bg-white/10'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            setting.value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    )}
                    {setting.type === 'select' && (
                      <select
                        value={setting.value}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSettingChange(sectionIndex, setting.key, e.target.value);
                        }}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
                      >
                        {setting.options?.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                    {setting.type === 'input' && (
                      <input
                        type="text"
                        value={setting.value}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSettingChange(sectionIndex, setting.key, e.target.value);
                        }}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white w-48"
                        placeholder={setting.label}
                      />
                    )}
                    {setting.type === 'textarea' && (
                      <TextArea
                        value={setting.value}
                        onChange={(value) => {
//                          value.stopPropagation();
                          handleSettingChange(sectionIndex, setting.key, value);
                        }}
                        placeholder={setting.label}
                      />
                    )}
                    {setting.type === 'tags' && (
                      <TagInput
                        value={setting.value}
                        onChange={(value) => {
                        //   value.stopPropagation();
                          handleSettingChange(sectionIndex, setting.key, value);
                        }}
                      />
                    )}
                    {setting.type === 'avatar' && (
                      <AvatarUpload
                        value={setting.value}
                        onChange={(value) => {
//                          value.stopPropagation();
                          handleSettingChange(sectionIndex, setting.key, value);
                        }}
                      />
                    )}
                  </div>
                  {setting.description && (
                    <p className="text-sm text-white/40">{setting.description}</p>
                  )}
                </div>
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

function ConnectionItem({ connection, onConnect }: { 
  connection: Connection, 
  onConnect: () => void 
}) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            connection.connected ? 'text-green-400 bg-green-400/10' : 'text-white/60 bg-white/5'
          }`}>
            {connection.icon}
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">{connection.service}</h3>
            {connection.connected && connection.username && (
              <p className="text-xs text-white/60">Connected as {connection.username}</p>
            )}
            {!connection.connected && (
              <p className="text-xs text-white/60">{connection.description}</p>
            )}
          </div>
        </div>
        <button
          onClick={onConnect}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            connection.connected
              ? 'bg-white/10 text-white/60 hover:bg-white/20'
              : 'bg-primary/20 text-primary hover:bg-primary/30'
          }`}
        >
          {connection.connected ? 'Disconnect' : 'Connect'}
        </button>
      </div>
    </div>
  );
}

function TextArea({ value, onChange, placeholder }: { 
  value: string; 
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/90 placeholder:text-white/40 focus:outline-none focus:border-primary/50 min-h-[100px] resize-y"
    />
  );
}

function TagInput({ value, onChange }: { 
  value: string[]; 
  onChange: (value: string[]) => void;
}) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!value.includes(inputValue.trim())) {
        onChange([...value, inputValue.trim()]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map(tag => (
          <span
            key={tag}
            className="px-3 py-1 rounded-lg text-sm bg-white/10 text-white/90 flex items-center gap-2"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="text-white/60 hover:text-white/90"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type and press Enter to add"
        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/90 placeholder:text-white/40 focus:outline-none focus:border-primary/50"
      />
    </div>
  );
}

function AvatarUpload({ value, onChange }: {
  value: string;
  onChange: (value: string) => void;
}) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Implement file upload
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white/5 border border-white/10">
        {value ? (
          <Image
            src={value}
            alt="Avatar"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/40">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
      </div>
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="avatar-upload"
        />
        <label
          htmlFor="avatar-upload"
          className="px-4 py-2 rounded-lg bg-white/5 text-white/90 hover:bg-white/10 transition-colors cursor-pointer inline-block"
        >
          Choose Image
        </label>
      </div>
    </div>
  );
} 