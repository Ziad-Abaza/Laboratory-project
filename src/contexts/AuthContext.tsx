import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  role: 'reception' | 'laboratory' | 'admin';
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data on mount
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock authentication logic
      if (email === 'reception@clinic.com' && password === 'reception123') {
        const userData: User = {
          id: '1',
          email: 'reception@clinic.com',
          role: 'reception',
          name: 'Reception Staff'
        };
        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
      } else if (email === 'lab@clinic.com' && password === 'lab123') {
        const userData: User = {
          id: '2',
          email: 'lab@clinic.com',
          role: 'laboratory',
          name: 'Laboratory Staff'
        };
        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
      } else if (email === 'admin@clinic.com' && password === 'admin123') {
        const userData: User = {
          id: '3',
          email: 'admin@clinic.com',
          role: 'admin',
          name: 'Administrator'
        };
        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
