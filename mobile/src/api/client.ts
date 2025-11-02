import axios from 'axios';

// Use network IP for phone connections, localhost for web/emulator
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.169:3000/api' // Network IP for Expo Go on phone
  : 'https://your-production-url.com/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface User {
  id: string;
  email?: string;
  username?: string;
  name?: string;
  image?: string;
}

export interface Meal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dateCooked: string;
  tags: string[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  prepMinutes?: number;
  activeMinutes?: number;
  totalMinutes?: number;
  servings?: number;
  isPublic: boolean;
  sentiment?: 'LOVED' | 'FINE' | 'NOT_FOR_ME';
  costPerServingCents?: number;
  photos: string[];
  globalScore?: number;
  ingredients?: MealIngredient[];
  recipe?: Recipe;
  user?: User;
  _count?: {
    likes: number;
    comments: number;
  };
}

export interface MealIngredient {
  id: string;
  rawName: string;
  quantity?: number;
  unit?: string;
  unitPriceCents?: number;
  isPantry: boolean;
}

export interface Recipe {
  id: string;
  yield?: number;
  sourceUrl?: string;
  sourceName?: string;
  utensils: string[];
  steps: RecipeStep[];
}

export interface RecipeStep {
  id: string;
  stepNumber: number;
  instruction: string;
  timerSeconds?: number;
  photoPrompt: boolean;
}

// API Functions
export const authApi = {
  register: async (username: string, email?: string, name?: string) => {
    const response = await apiClient.post('/auth/register', {
      username,
      email,
      name,
    });
    return response.data;
  },
};

export const mealsApi = {
  getAll: async (userId?: string, isPublic?: boolean) => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (isPublic) params.append('isPublic', 'true');
    const response = await apiClient.get(`/meals?${params.toString()}`);
    return response.data;
  },
  
  create: async (mealData: Partial<Meal>) => {
    const response = await apiClient.post('/meals', mealData);
    return response.data;
  },
};

export const ratingsApi = {
  create: async (ratingData: {
    mealId: string;
    userId: string;
    sentiment: 'LOVED' | 'FINE' | 'NOT_FOR_ME';
    taste?: number;
    texture?: number;
    difficulty?: number;
    value?: number;
    notes?: string;
  }) => {
    const response = await apiClient.post('/ratings', ratingData);
    return response.data;
  },
};

export const compareApi = {
  getRandom: async (userId: string) => {
    const response = await apiClient.get(`/compare?userId=${userId}`);
    return response.data;
  },
  
  create: async (comparisonData: {
    userId: string;
    mealAId: string;
    mealBId: string;
    winnerId: string;
  }) => {
    const response = await apiClient.post('/compare', comparisonData);
    return response.data;
  },
};

export const topApi = {
  getTop: async (userId: string) => {
    const response = await apiClient.get(`/top?userId=${userId}`);
    return response.data;
  },
};

