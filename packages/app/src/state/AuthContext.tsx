import React, { createContext, useState, useContext, ReactNode } from 'react';

// Definisikan tipe untuk konteks
interface AuthContextType {
  token: string | null;
  user: any; // Ganti 'any' dengan tipe profil pengguna yang lebih spesifik nanti
  login: (token: string, user: any) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// Buat konteks dengan nilai default
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Buat provider komponen
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const login = (newToken: string, userData: any) => {
    setToken(newToken);
    setUser(userData);
    // Di aplikasi nyata, simpan token di AsyncStorage
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    // Di aplikasi nyata, hapus token dari AsyncStorage
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// Buat custom hook untuk menggunakan AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
