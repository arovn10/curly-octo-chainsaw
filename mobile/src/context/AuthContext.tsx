import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/client';

interface User {
  id: string;
  email?: string;
  username?: string;
  name?: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded credentials
const VALID_CREDENTIALS = {
  'rovneralec@gmail.com': '15Saratoga!',
  'alexia.jenny@gmail.com': 'Jennifer2002$',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    // Check hardcoded credentials first
    if (VALID_CREDENTIALS[email as keyof typeof VALID_CREDENTIALS] !== password) {
      throw new Error('Invalid email or password');
    }

    try {
      // Try to find or create user via backend
      let userData: User;
      try {
        // First try to login via backend
        const response = await apiClient.post('/auth/login', { email, username: email.split('@')[0] });
        if (response.data.ok && response.data.data) {
          userData = {
            id: response.data.data.user?.id || email,
            email,
            username: email.split('@')[0],
            name: response.data.data.user?.name || email.split('@')[0],
          };
        } else {
          // If login fails, try to register
          const registerResponse = await apiClient.post('/auth/register', {
            email,
            username: email.split('@')[0],
            name: email.split('@')[0],
          });
          if (registerResponse.data.ok) {
            userData = registerResponse.data.data;
          } else {
            throw new Error('Failed to authenticate');
          }
        }
      } catch (error: any) {
        // If backend fails, create a local user
        console.warn('Backend auth failed, using local user:', error);
        userData = {
          id: email,
          email,
          username: email.split('@')[0],
          name: email.split('@')[0],
        };
      }

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

