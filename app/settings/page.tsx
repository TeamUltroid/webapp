'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShowPopup } from '@vkruglikov/react-telegram-web-app';
import Image from 'next/image';
import { api, MiniAppSettings } from '../../utils/api';
import { useTheme } from '../../utils/theme-context';
import { THEMES } from '../../utils/themes';

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
  type: 'toggle' | 'select' | 'input' | 'connection' | 'textarea' | 'tags' | 'avatar' | 'theme' | 'number' | 'media' | 'avatar_shape_grid';
  value: any;
  options?: { label: string; value: any }[];
  description?: string;
  placeholder?: string;
  min?: number;
  max?: number;
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
    title: "Appearance",
    description: "Customize the look and feel of your Ultroid interface",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4 4 4 0 004-4V5z" />
      </svg>    ), settings: [
      {
        key: "theme",
        label: "Theme",
        type: "theme",
        value: "midnight_pro",
        description: "Choose your preferred color theme"
      },      {
        key: "avatarShape",
        label: "Avatar Shape",
        type: "avatar_shape_grid",
        value: "circle",
        options: [
          { label: "Circle", value: "circle" },
          { label: "Rounded Square", value: "rounded-square" },
          { label: "Square", value: "square" },
          { label: "Hexagon", value: "hexagon" }
        ],
        description: "Choose the shape for your profile avatar"
      }
    ]
  },
  {
    title: "Bot Configuration",
    description: "Configure bot operation modes and command handlers",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    settings: [
      {
        key: "BOT_MODE",
        label: "Bot Mode",
        type: "toggle",
        value: false,
        description: "Enable bot mode - run as bot instead of userbot"
      },
      {
        key: "DUAL_MODE",
        label: "Dual Mode",
        type: "toggle",
        value: false,
        description: "Enable dual mode - run both userbot and assistant bot"
      },
      {
        key: "HNDLR",
        label: "Command Handler",
        type: "input",
        value: ".",
        description: "Primary command prefix (default: .)"
      }, {
        key: "DUAL_HNDLR",
        label: "Dual Handler",
        type: "input",
        value: "/",
        description: "Secondary command prefix for dual mode (default: /)",
        placeholder: "/"
      },
      {
        key: "SUDO",
        label: "Sudo Mode",
        type: "toggle",
        value: false,
        description: "Allow certain users to use your bot commands"
      },
      {
        key: "SUDO_HNDLR",
        label: "Sudo Handler",
        type: "input",
        value: "!",
        description: "Command prefix for sudo users (default: !)",
        placeholder: "!"
      },
      {
        key: "ADDONS",
        label: "Enable Addons",
        type: "toggle",
        value: false,
        description: "Enable extra addon plugins"
      },
      {
        key: "PLUGIN_CHANNEL",
        label: "Plugin Channel",
        type: "input",
        value: "",
        description: "Channel username/ID to install plugins from",
        placeholder: "@ultroidplugins"
      },
      {
        key: "EMOJI_IN_HELP",
        label: "Help Menu Emoji",
        type: "input",
        value: "",
        description: "Emoji to display in help menu",
        placeholder: ""
      }]
  },
  {
    title: "PM Management",
    description: "Configure private message permissions and settings",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    settings: [
      {
        key: "PMSETTING",
        label: "PM Permit",
        type: "toggle",
        value: false,
        description: "Enable PM permission system"
      },
      {
        key: "INLINE_PM",
        label: "Inline PM",
        type: "toggle",
        value: false,
        description: "Use inline buttons for PM permit"
      },
      {
        key: "PM_TEXT",
        label: "PM Permit Message",
        type: "textarea",
        value: "",
        description: "Custom message for PM permit. Use {name}, {mention}, {username} variables",
        placeholder: "Hello {name}, please wait for approval..."
      },
      {
        key: "PMWARNS",
        label: "PM Warnings",
        type: "number",
        value: 3,
        description: "Number of warnings before blocking user",
        min: 1,
        max: 10
      },
      {
        key: "AUTOAPPROVE",
        label: "Auto Approve",
        type: "toggle",
        value: false,
        description: "Auto approve users when you message them"
      },
      {
        key: "PMLOG",
        label: "PM Logger",
        type: "toggle",
        value: false,
        description: "Log private messages to a group"
      },
      {
        key: "PMLOGGROUP",
        label: "PM Log Group",
        type: "input",
        value: "",
        description: "Group ID where PM logs will be sent",
        placeholder: "-1001234567890"
      }
    ]
  },
  {
    title: "Assistant Bot",
    description: "Configure your assistant bot settings",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    settings: [
      {
        key: "PMBOT",
        label: "Chat Bot",
        type: "toggle",
        value: false,
        description: "Enable assistant bot for chatting"
      },
      {
        key: "STARTMSG",
        label: "Welcome Message",
        type: "textarea",
        value: "",
        description: "Message shown when users start your bot. Use {me}, {mention} variables",
        placeholder: "Welcome to my assistant bot!"
      },
      {
        key: "BOT_INFO_START",
        label: "Bot Info Text",
        type: "textarea",
        value: "",
        description: "Text shown when users press Info button",
        placeholder: "This is my personal assistant bot."
      }
    ]
  },
  {
    title: "Media & Customization",
    description: "Customize alive messages and media settings",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    settings: [
      {
        key: "ALIVE_TEXT",
        label: "Alive Message",
        type: "textarea",
        value: "",
        description: "Custom text for alive command",
        placeholder: "I'm alive and running Ultroid!"
      }
    ]
  },
  {
    title: "Security & Logging",
    description: "Configure logging and security features",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    settings: [
      {
        key: "TAG_LOG",
        label: "Tag Logger Group",
        type: "input",
        value: "",
        description: "Group ID where tag notifications will be sent",
        placeholder: "-1001234567890"
      },
      {
        key: "FBAN_GROUP_ID",
        label: "FBan Group",
        type: "input",
        value: "",
        description: "Group ID for federation ban operations",
        placeholder: "-1001234567890"
      },
      {
        key: "EXCLUDE_FED",
        label: "Excluded Federations",
        type: "input",
        value: "",
        description: "Federation IDs to exclude from bans (space separated)",
        placeholder: "fed1 fed2 fed3"
      }
    ]
  },
  {
    title: "External APIs",
    description: "Configure external API keys for enhanced features",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
    settings: [
      {
        key: "RMBG_API",
        label: "Remove.bg API",
        type: "input",
        value: "",
        description: "API key for background removal service",
        placeholder: "Your remove.bg API key"
      },
      {
        key: "DEEP_AI",
        label: "Deep AI API",
        type: "input",
        value: "",
        description: "API key for Deep AI services",
        placeholder: "Your DeepAI API key"
      },
      {
        key: "OCR_API",
        label: "OCR Space API",
        type: "input",
        value: "",
        description: "API key for OCR text recognition",
        placeholder: "Your OCR Space API key"
      },
      {
        key: "GDRIVE_FOLDER_ID",
        label: "Google Drive Folder",
        type: "input",
        value: "",
        description: "Google Drive folder ID for file uploads",
        placeholder: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
      }
    ]
  },
  {
    title: "Mini App Home page",
    description: "Configure your mini app's homepage settings",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
      </svg>
    ),
    settings: [
      {
        key: "showStarDonation",
        label: "Show Star Donation",
        type: "toggle",
        value: false,
        description: "Display star donation option on the home page"
      }, {
        key: "donationAmounts",
        label: "Donation Amounts",
        type: "input",
        value: "1,5,50",
        description: "Comma-separated list of donation amounts (e.g. 1,5,50)",
        placeholder: "1,5,50"
      }
    ]
  }
];

type ExpandedSections = {
  [key: string]: boolean;
};

function ThemeGrid({ currentTheme, onThemeChange }: {
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
}) {
  const { setTheme } = useTheme();

  const handleThemeSelect = async (themeId: string) => {
    try {
      await setTheme(themeId);
      onThemeChange(themeId);
    } catch (error) {
      console.error('Failed to apply theme:', error);
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-3 mt-2">
        {THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeSelect(theme.id)}
            className={`relative p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${currentTheme === theme.id
                ? 'border-primary shadow-lg shadow-primary/20'
                : 'border-white/10 hover:border-white/20'
              }`}
            style={{
              background: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`
            }}
          >
            {/* Theme preview */}
            <div className="flex flex-col items-center space-y-2">
              {/* Color palette */}
              <div className="flex space-x-1">
                <div
                  className="w-3 h-3 rounded-full border border-white/20"
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <div
                  className="w-3 h-3 rounded-full border border-white/20"
                  style={{ backgroundColor: theme.colors.accent }}
                />
                <div
                  className="w-3 h-3 rounded-full border border-white/20"
                  style={{ backgroundColor: theme.colors.success }}
                />
              </div>

              {/* Theme name */}
              <div
                className="text-xs font-medium text-center"
                style={{ color: theme.colors.text }}
              >
                {theme.name}
              </div>

              {/* Active indicator */}
              {currentTheme === theme.id && (
                <div className="absolute -top-1 -right-1">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Settings() {
  const router = useRouter();
  const showPopup = useShowPopup();
  const { currentTheme, setTheme, isLoading: themeLoading } = useTheme(); const [settings, setSettings] = useState(SETTINGS_SECTIONS);
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);// Load saved settings from the server
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const allSettings = await api.getMiniAppSettings();

        // Update settings with saved values
        setSettings(prevSettings => {
          const newSettings = [...prevSettings];

          // Update all sections with their respective settings
          newSettings.forEach((section, sectionIndex) => {
            section.settings.forEach(setting => {
              if (setting.key === 'theme') {
                // Set theme from context
                setting.value = currentTheme.id;
              } else if (allSettings[setting.key] !== undefined) {
                setting.value = allSettings[setting.key];
              }
            });
          });

          return newSettings;
        });
      } catch (error) {
        console.error('Error loading settings:', error);
        showPopup({
          message: 'Failed to load settings. Using defaults.',
          buttons: [{ type: 'ok' }]
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Only load when theme is not loading
    if (!themeLoading) {
      loadSettings();
    }
  }, [showPopup, currentTheme.id, themeLoading]);

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  }; const handleSettingChange = (sectionIndex: number, settingKey: string, value: any) => {
    const newSettings = [...settings];
    const setting = newSettings[sectionIndex].settings.find(s => s.key === settingKey);
    if (setting) {
      setting.value = value;
      setSettings(newSettings);
      setHasUnsavedChanges(true);
    }
  };
  const saveAllSettings = async () => {
    if (!hasUnsavedChanges) return;

    setIsSaving(true);
    showPopup({
      message: 'Saving all settings...',
      buttons: [{ type: 'ok' }]
    });

    try {
      // Collect all changed settings
      const allChangedSettings: { [key: string]: any } = {};

      settings.forEach((section) => {
        section.settings.forEach((setting) => {
          allChangedSettings[setting.key] = setting.value;
        });
      });

      // Save theme separately through theme context
      if (allChangedSettings.theme) {
        await setTheme(allChangedSettings.theme);
        delete allChangedSettings.theme; // Remove from bulk save
      }

      // Save all other settings in a single batch request
      if (Object.keys(allChangedSettings).length > 0) {
        const settingsArray = Object.entries(allChangedSettings).map(([key, value]) => ({
          key,
          value
        }));

        await api.saveMiniAppSettings(settingsArray);
      }

      setHasUnsavedChanges(false);
      showPopup({
        message: 'All settings saved successfully!',
        buttons: [{ type: 'ok' }]
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      showPopup({
        message: 'Failed to save some settings. Please try again.',
        buttons: [{ type: 'ok' }]
      });
    }

    setIsSaving(false);
  };
  return (
    <div className="min-h-[100dvh] pb-24 bg-background text-theme">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-lg bg-background border-b border-theme">
        <div className="px-4 py-3 flex items-center">
          <div className="flex-1">
            <h1 className="text-lg font-bold text-theme">Settings</h1>
            <p className="text-xs text-theme-secondary">Configure your Ultroid instance</p>
          </div>
        </div>
      </div>      {/* Loading indicator */}
      {(isLoading || themeLoading) && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-3 text-theme-secondary">Loading settings...</span>
        </div>
      )}{/* Settings Sections */}
      <div className="p-4">        {!(isLoading || themeLoading) && settings.map((section, sectionIndex) => (
        <div key={section.title} className={`rounded-xl overflow-hidden transition-all duration-200 bg-surface border border-theme ${expandedSections[section.title]
            ? 'mb-4'
            : 'mb-0'
          }`}>
          <button
            onClick={() => toggleSection(section.title)}
            className="w-full px-4 py-3 flex items-center justify-between transition-colors hover:bg-white/5"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/20">
                {section.icon}
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold text-theme">{section.title}</h2>
                <p className="text-sm text-theme-secondary">{section.description}</p>
              </div>
            </div>
            <svg
              className={`w-5 h-5 transition-transform duration-200 text-theme-secondary ${expandedSections[section.title] ? 'rotate-180' : ''
                }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className={`space-y-3 transition-all duration-200 ${expandedSections[section.title]
              ? 'max-h-[1000px] opacity-100 p-4'
              : 'max-h-0 opacity-0 pointer-events-none p-0 m-0'
            }`}>              {section.settings.map(setting => (
              <div key={setting.key} className="p-4 rounded-xl bg-white/5 border border-white/10">
                {setting.type === 'theme' ? (
                  // Special layout for theme selector
                  <div>
                    <div className="mb-3">
                      <label className="text-sm font-medium text-theme">{setting.label}</label>
                      {setting.description && (
                        <p className="text-sm text-theme-secondary mt-1">{setting.description}</p>
                      )}
                    </div>                    <ThemeGrid
                      currentTheme={setting.value}
                      onThemeChange={(themeId: string) => handleSettingChange(sectionIndex, setting.key, themeId)}
                    />
                  </div>
                ) : setting.type === 'avatar_shape_grid' ? (
                  // Special layout for avatar shape grid
                  <div>
                    <div className="mb-3">
                      <label className="text-sm font-medium text-theme">{setting.label}</label>
                      {setting.description && (
                        <p className="text-sm text-theme-secondary mt-1">{setting.description}</p>
                      )}
                    </div>                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {setting.options?.map((option) => (                        <button
                          key={option.value}
                          onClick={() => handleSettingChange(sectionIndex, setting.key, option.value)}
                          className={`relative flex flex-col items-center p-4 rounded-2xl transition-all duration-300 group ${
                            setting.value === option.value
                              ? 'bg-primary/20 border-2 border-primary shadow-lg shadow-primary/25 scale-105'
                              : 'bg-white/5 border-2 border-transparent hover:bg-white/10 hover:border-white/20 hover:scale-102'
                          }`}
                        >
                          <div className={`w-14 h-14 bg-gradient-to-br from-primary/50 to-primary/30 flex items-center justify-center mb-3 transition-transform duration-300 ${
                            setting.value === option.value ? 'scale-110' : 'group-hover:scale-105'
                          } ${
                            option.value === 'circle' ? 'rounded-full' :
                            option.value === 'rounded-square' ? 'rounded-2xl' :
                            option.value === 'square' ? 'rounded-none' :
                            option.value === 'hexagon' ? 'rounded-none hexagon-preview' : 'rounded-full'
                          }`}>
                            <div className={`w-4 h-4 bg-primary transition-all duration-300 ${
                              setting.value === option.value ? 'scale-125' : ''
                            } ${
                              option.value === 'circle' ? 'rounded-full' :
                              option.value === 'rounded-square' ? 'rounded-md' :
                              option.value === 'square' ? 'rounded-none' :
                              option.value === 'hexagon' ? 'rounded-full' : 'rounded-full'
                            }`}></div>
                          </div>
                          <span className={`text-xs font-medium text-center leading-tight transition-colors duration-300 ${
                            setting.value === option.value ? 'text-primary' : 'text-theme'
                          }`}>
                            {option.label}
                          </span>
                          {setting.value === option.value && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Regular layout for other settings
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-theme">{setting.label}</label>
                      {setting.type === 'toggle' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSettingChange(sectionIndex, setting.key, !setting.value);
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${setting.value ? 'bg-primary' : 'bg-white/10'
                            }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${setting.value ? 'translate-x-6' : 'translate-x-1'
                              }`}
                          />
                        </button>
                      )}                    {setting.type === 'select' && (
                      <select
                        value={setting.value}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSettingChange(sectionIndex, setting.key, e.target.value);
                        }}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-theme"
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
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-theme w-48"
                          placeholder={setting.placeholder || setting.label}
                        />
                      )}
                      {setting.type === 'number' && (
                        <input
                          type="number"
                          value={setting.value}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSettingChange(sectionIndex, setting.key, parseInt(e.target.value) || 0);
                          }}
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-theme w-24"
                          min={setting.min || 0}
                          max={setting.max || 100}
                          placeholder={setting.placeholder || setting.label}
                        />
                      )}{setting.type === 'textarea' && (
                        <TextArea
                          value={setting.value}
                          onChange={(value) => {
                            //                          value.stopPropagation();
                            handleSettingChange(sectionIndex, setting.key, value);
                          }}
                          placeholder={setting.placeholder || setting.label}
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
                      )}                      </div>
                    {setting.description && (
                      <p className="text-sm text-theme-secondary">{setting.description}</p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}      </div>   
               {/* Save Button */}
      {hasUnsavedChanges && (
        <div className="flex justify-center mt-8 mb-8">
          <button
            onClick={saveAllSettings}
            disabled={isSaving}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-theme-medium text-sm ${isSaving
                ? 'bg-white/10 text-theme-secondary cursor-not-allowed'
                : 'border text-white hover:bg-primary/90 hover:scale-105 shadow-primary/20'
              }`}
          >
            {isSaving ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-theme-secondary"></div>
                <span>Saving...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 px-3 py-1 rounded-lg">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Save Changes</span>
              </div>
            )}
          </button>
        </div>
      )}{/* Bottom Navigation */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <div className="px-1.5 py-1.5 rounded-2xl bg-background/40 backdrop-blur-xl border border-theme shadow-theme-large">
          <div className="flex items-center gap-1">
            {BOTTOM_NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                className={`relative flex items-center px-4 py-2 rounded-xl transition-all duration-200 ${item.active
                    ? 'text-primary bg-white/10'
                    : 'text-theme-secondary hover:text-theme hover:bg-white/5'
                  }`}
                onClick={() => router.push(item.href)}
              >
                <div className={`transition-transform duration-200 ${item.active ? 'scale-110' : 'scale-100'
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
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${connection.connected ? 'text-green-400 bg-green-400/10' : 'text-white/60 bg-white/5'
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
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${connection.connected
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
      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-theme placeholder:text-theme-secondary focus:outline-none focus:border-primary/50 min-h-[100px] resize-y"
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