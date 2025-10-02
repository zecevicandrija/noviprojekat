'use client';

import React, { useState, useEffect, useContext, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/utils/api";

const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push("/login");
  }, [router]);

  useEffect(() => {
    const verifyUserSession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/api/auth/me');
          const freshUser = response.data;
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        } catch (error) {
          console.error("Sesija nije validna, odjavljivanje:", error);
          logout();
        }
      }
      setLoading(false);
    };
    
    verifyUserSession();
    
    const handleFocus = () => verifyUserSession();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [logout]);

  const login = async (email, lozinka) => {
    try {
      const response = await api.post("/api/auth/login", { email, lozinka });
      if (response.status === 200) {
        const { user: loggedInUser, token } = response.data;
        setUser(loggedInUser);
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        localStorage.setItem("token", token);
        
        // Postavi cookie za middleware
        document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
        
        // Preusmeri prema ulozi
        if (loggedInUser.uloga === 'admin') {
          router.push("/admin");
        } else {
          router.push("/");
        }
        
        return { success: true };
      }
    } catch (error) {
      console.error("Error logging in:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Došlo je do greške prilikom prijave" 
      };
    }
  };

  const register = async (ime, prezime, email, lozinka) => {
    try {
      const response = await api.post("/api/auth/register", { 
        ime, prezime, email, lozinka 
      });
      if (response.status === 201) {
        const { user: newUser, token } = response.data;
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
        localStorage.setItem("token", token);
        
        document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
        
        router.push("/");
        return { success: true };
      }
    } catch (error) {
      console.error("Error registering:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Došlo je do greške prilikom registracije" 
      };
    }
  };

  const updateUser = async (userData) => {
    try {
      const response = await api.put("/api/auth/update", userData);
      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      console.error("Error updating user:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Došlo je do greške prilikom ažuriranja" 
      };
    }
  };

  const value = React.useMemo(
    () => ({ user, setUser, loading, login, register, logout, updateUser }), 
    [user, loading, logout]
  );

  if (loading) {
    return <div>Učitavanje...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};