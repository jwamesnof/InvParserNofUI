// Favorites management utility
import { logActivity } from './activity-logger';

export const toggleFavorite = (invoiceId: string, invoiceNumber?: string): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    let favorites: string[] = [];
    const stored = localStorage.getItem('favoriteInvoices');
    if (stored) {
      favorites = JSON.parse(stored);
    }

    const index = favorites.indexOf(invoiceId);
    let isFavorited = false;
    
    if (index > -1) {
      // Remove from favorites
      favorites.splice(index, 1);
      logActivity('Invoice Unfavorited', {
        invoiceId,
        invoiceNumber,
        details: 'Removed from favorites',
      });
    } else {
      // Add to favorites
      favorites.push(invoiceId);
      isFavorited = true;
      logActivity('Invoice Favorited', {
        invoiceId,
        invoiceNumber,
        details: 'Added to favorites',
      });
    }

    localStorage.setItem('favoriteInvoices', JSON.stringify(favorites));
    return isFavorited;
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
    return false;
  }
};

export const isFavorite = (invoiceId: string): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const stored = localStorage.getItem('favoriteInvoices');
    if (stored) {
      const favorites: string[] = JSON.parse(stored);
      return favorites.includes(invoiceId);
    }
    return false;
  } catch (error) {
    console.error('Failed to check favorite status:', error);
    return false;
  }
};

export const getFavoriteIds = (): string[] => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem('favoriteInvoices');
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error('Failed to get favorites:', error);
    return [];
  }
};

export const clearFavorites = (): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('favoriteInvoices');
  } catch (error) {
    console.error('Failed to clear favorites:', error);
  }
};
