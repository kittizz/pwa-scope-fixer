export interface SiteSetting {
  startUrl: string;
  name?: string;
  shortName?: string;
  backgroundColor?: string;
  themeColor?: string;
}

export interface StorageSchema {
  autoScopeFix: boolean;
  siteSettings: Record<string, SiteSetting>;
}

const defaultStorage: StorageSchema = {
  autoScopeFix: true,
  siteSettings: {},
};

export const StorageManager = {
  get: async <K extends keyof StorageSchema>(keys: K | K[]): Promise<Pick<StorageSchema, K>> => {
    return new Promise((resolve) => {
      const keysToFetch = Array.isArray(keys) ? keys : [keys];
      chrome.storage.local.get(keysToFetch, (result) => {
        const data = { ...result } as Partial<StorageSchema>;
        // Fill defaults if missing
        keysToFetch.forEach((key) => {
          if (data[key] === undefined) {
            // @ts-ignore - we know the default value matches the type
            data[key] = defaultStorage[key];
          }
        });
        resolve(data as Pick<StorageSchema, K>);
      });
    });
  },

  set: async (items: Partial<StorageSchema>): Promise<void> => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(items, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  },

  getAll: async (): Promise<StorageSchema> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, (result) => {
        const data = { ...defaultStorage, ...result } as StorageSchema;
        resolve(data);
      });
    });
  },
};
