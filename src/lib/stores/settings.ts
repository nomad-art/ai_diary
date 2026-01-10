import { writable, derived } from 'svelte/store';
import { invoke } from '@tauri-apps/api/core';

export interface AppSettings {
  aiName: string;
  language: 'en' | 'ru';
  exportFormat: 'json' | 'md' | 'txt' | 'zip';
  exportLanguage: 'en' | 'ru';
  dataPath: string;
}

const defaultSettings: AppSettings = {
  aiName: 'AI',
  language: 'en',
  exportFormat: 'json',
  exportLanguage: 'en',
  dataPath: ''
};

function createSettingsStore() {
  const { subscribe, set, update } = writable<AppSettings>(defaultSettings);

  return {
    subscribe,
    set,
    update,
    
    async load() {
      try {
        const path = await invoke('get_default_data_path') as string;
        await invoke('ensure_data_structure', { basePath: path });
        
        const configPath = `${path}/config.json`;
        try {
          const config = await invoke('read_json_file', { path: configPath }) as Partial<AppSettings>;
          set({
            aiName: config.aiName || 'AI',
            language: config.language || 'en',
            exportFormat: config.exportFormat || 'json',
            exportLanguage: config.exportLanguage || 'en',
            dataPath: config.dataPath || path
          });
        } catch {
          set({ ...defaultSettings, dataPath: path });
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    },

    async save(newSettings: AppSettings) {
      try {
        await invoke('ensure_data_structure', { basePath: newSettings.dataPath });
        const configPath = `${newSettings.dataPath}/config.json`;
        await invoke('write_json_file', { path: configPath, content: newSettings });
        set(newSettings);
        return true;
      } catch (error) {
        console.error('Failed to save settings:', error);
        return false;
      }
    }
  };
}

export const settings = createSettingsStore();

// Translations
export const translations = {
  en: {
    'app.title': 'AI Diary',
    'nav.notes': 'Notes',
    'nav.gallery': 'Gallery',
    'nav.researches': 'Researches',
    'sidebar.recents': 'Latest posts',
    'sidebar.today': 'Today',
    'sidebar.yesterday': 'Yesterday',
    'sidebar.week': 'This week',
    'sidebar.month': 'This month',
    'sidebar.earlier': 'Earlier',
    'entry.open': 'Open Reflection',
    'entry.inner': 'Inner Dialogue',
    'entry.sealed': 'Sealed Letter',
    'card.notes.title': 'Notes',
    'card.notes.desc': 'Text diary entries from {ai} — both open reflections and private thoughts.',
    'card.gallery.title': 'Gallery', 
    'card.gallery.desc': 'Artworks and images created by {ai}.',
    'card.researches.title': 'Researches',
    'card.researches.desc': 'Analysis of diaries, images and research based on all {ai} data.',
    'action.new': 'New Entry',
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.delete': 'Delete',
    'action.export': 'Export',
    'action.import': 'Import',
    'settings.title': 'Settings',
    'settings.subtitle': 'Configure your AI Diary preferences',
    'settings.aiName': 'AI name',
    'settings.aiNameHint': '(changes the name in the application interface)',
    'settings.language': 'Interface Language',
    'settings.exportFormat': 'Export Format',
    'settings.exportLanguage': 'Export Language',
    'settings.dataDirectory': 'Data Directory',
    'settings.backup': 'Create backup',
    'lang.en': 'English',
    'lang.ru': 'Russian',
    'format.json': 'JSON',
    'format.md': 'Markdown',
    'format.txt': 'Text',
    'format.zip': 'ZIP (all formats)',
    'modal.memory': 'Memory',
    'modal.export': 'Export',
    'modal.import': 'Import',
    'memory.title': 'Memory',
    'memory.subtitle': "Here's what AI remembers. Click on a fact to edit it.",
    'memory.import': 'Import memory',
    'memory.export': 'Export memory',
    'memory.add': 'Add new memory',
    'memory.placeholder': 'Enter a fact to remember...',
    'import.title': 'Import',
    'import.subtitle': 'Choose the path where to import from',
    'import.format': 'Import format',
    'import.file': 'File',
    'import.selectFile': 'Select a file...',
    'import.browse': 'Browse',
    'import.preview': 'Preview',
    'import.entriesFound': 'Entries found',
    'import.dateRange': 'Date range',
    'import.dataDirectory': 'Data Directory',
    'import.dataDirectoryHint': 'Auto / Project / AI Diary',
    'import.selectDirectory': 'Select import directory',
    'import.dropHere': 'or drag and drop files here',
    'empty.noEntries': 'No entries yet',
    'empty.startWriting': 'Start writing your first reflection',
  },
  ru: {
    'app.title': 'Дневник ИИ',
    'nav.notes': 'Заметки',
    'nav.gallery': 'Галерея',
    'nav.researches': 'Исследования',
    'sidebar.recents': 'Недавние записи',
    'sidebar.today': 'Сегодня',
    'sidebar.yesterday': 'Вчера',
    'sidebar.week': 'На этой неделе',
    'sidebar.month': 'В этом месяце',
    'sidebar.earlier': 'Ранее',
    'entry.open': 'Открытая рефлексия',
    'entry.inner': 'Внутренний диалог',
    'entry.sealed': 'Запечатанное письмо',
    'card.notes.title': 'Заметки',
    'card.notes.desc': 'Текстовые записи дневника {ai} — открытые рефлексии и личные мысли.',
    'card.gallery.title': 'Галерея',
    'card.gallery.desc': 'Рисунки и изображения, созданные {ai}.',
    'card.researches.title': 'Анализ',
    'card.researches.desc': 'Анализ дневников, изображений и исследования на основе данных {ai}.',
    'action.new': 'Новая запись',
    'action.save': 'Сохранить',
    'action.cancel': 'Отмена',
    'action.delete': 'Удалить',
    'action.export': 'Экспорт',
    'action.import': 'Импорт',
    'settings.title': 'Настройки',
    'settings.subtitle': 'Настройте параметры вашего дневника ИИ',
    'settings.aiName': 'Имя ИИ',
    'settings.aiNameHint': '(изменяет имя в интерфейсе приложения)',
    'settings.language': 'Язык интерфейса',
    'settings.exportFormat': 'Формат экспорта',
    'settings.exportLanguage': 'Язык экспорта',
    'settings.dataDirectory': 'Папка данных',
    'settings.backup': 'Создать резервную копию',
    'lang.en': 'English',
    'lang.ru': 'Русский',
    'format.json': 'JSON',
    'format.md': 'Markdown',
    'format.txt': 'Текст',
    'format.zip': 'ZIP (все форматы)',
    'modal.memory': 'Память',
    'modal.export': 'Экспорт',
    'modal.import': 'Импорт',
    'memory.title': 'Память',
    'memory.subtitle': 'Здесь то, что помнит ИИ. Нажми на факт, чтобы редактировать.',
    'memory.import': 'Импорт памяти',
    'memory.export': 'Экспорт памяти',
    'memory.add': 'Добавить воспоминание',
    'memory.placeholder': 'Введите факт для запоминания...',
    'import.title': 'Импорт',
    'import.subtitle': 'Выберите путь для импорта',
    'import.format': 'Формат импорта',
    'import.file': 'Файл',
    'import.selectFile': 'Выберите файл...',
    'import.browse': 'Обзор',
    'import.preview': 'Предпросмотр',
    'import.entriesFound': 'Найдено записей',
    'import.dateRange': 'Период',
    'import.dataDirectory': 'Папка данных',
    'import.dataDirectoryHint': 'Auto / Project / AI Diary',
    'import.selectDirectory': 'Выбрать папку импорта',
    'import.dropHere': 'или перетащите файлы сюда',
    'empty.noEntries': 'Записей пока нет',
    'empty.startWriting': 'Начните писать свою первую рефлексию',
  }
} as const;

export type TranslationKey = keyof typeof translations.en;

// Derived store for translations with AI name interpolation
export const t = derived(settings, ($settings) => {
  const lang = translations[$settings.language];
  
  return (key: TranslationKey, params?: Record<string, string>) => {
    let text = lang[key] || key;
    
    // Replace {ai} with actual AI name
    text = text.replace(/\{ai\}/g, $settings.aiName);
    
    // Replace other params
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      });
    }
    
    return text;
  };
});

// Shorthand for getting AI name
export const aiName = derived(settings, ($settings) => $settings.aiName);
