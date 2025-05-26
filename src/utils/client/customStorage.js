import { createJSONStorage } from 'jotai/utils';

export const revCacheStorage = {
  ...createJSONStorage(() => localStorage),


  getItem: (key) => {
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored);
      return parsed.map(({ title, score, id }) => ({
        title,
        score,
        id,
      }));
    } catch (error) {
      console.error('Error parsing revCache from localStorage:', error);
      return [];
    }
  },

  setItem: (key, newValue) => {

    const partial = newValue.map((card) => ({
      title: card?.title,
      id:card?.id,
      score: card?.score,
    }));
    localStorage.setItem(key, JSON.stringify(partial));
  },
};