import { writable } from 'svelte/store';
import { invoke } from '@tauri-apps/api/core';

export interface MemoryItem {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryState {
  items: MemoryItem[];
  loaded: boolean;
}

function generateId(): string {
  return `mem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function createMemoryStore() {
  const { subscribe, set, update } = writable<MemoryState>({
    items: [],
    loaded: false
  });

  let dataPath = '';

  return {
    subscribe,
    
    async load() {
      try {
        // Get default data path from backend
        dataPath = await invoke('get_default_data_path') as string;
        const memoryPath = `${dataPath}/memory.json`;
        
        try {
          const items = await invoke('read_json_file', { path: memoryPath }) as MemoryItem[];
          set({ items, loaded: true });
        } catch {
          // File doesn't exist yet
          set({ items: [], loaded: true });
        }
      } catch (error) {
        console.error('Failed to load memory:', error);
        set({ items: [], loaded: true });
      }
    },

    async save(items: MemoryItem[]): Promise<boolean> {
      try {
        if (!dataPath) {
          dataPath = await invoke('get_default_data_path') as string;
        }
        const memoryPath = `${dataPath}/memory.json`;
        await invoke('write_json_file', { path: memoryPath, content: items });
        return true;
      } catch (error) {
        console.error('Failed to save memory:', error);
        return false;
      }
    },

    add(content: string) {
      const now = new Date().toISOString();
      const newItem: MemoryItem = {
        id: generateId(),
        content,
        createdAt: now,
        updatedAt: now
      };
      
      update(state => {
        const newItems = [...state.items, newItem];
        this.save(newItems);
        return { ...state, items: newItems };
      });
    },

    update(id: string, content: string) {
      update(state => {
        const newItems = state.items.map(item => 
          item.id === id 
            ? { ...item, content, updatedAt: new Date().toISOString() }
            : item
        );
        this.save(newItems);
        return { ...state, items: newItems };
      });
    },

    remove(id: string) {
      update(state => {
        const newItems = state.items.filter(item => item.id !== id);
        this.save(newItems);
        return { ...state, items: newItems };
      });
    },

    import(items: MemoryItem[]) {
      update(state => {
        // Merge imported items, avoiding duplicates by id
        const existingIds = new Set(state.items.map(i => i.id));
        const newItems = items.filter(i => !existingIds.has(i.id));
        const mergedItems = [...state.items, ...newItems];
        this.save(mergedItems);
        return { ...state, items: mergedItems };
      });
    },

    clear() {
      update(state => {
        this.save([]);
        return { ...state, items: [] };
      });
    }
  };
}

export const memory = createMemoryStore();
