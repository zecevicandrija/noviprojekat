'use client';

import { AuthProvider } from "@/contexts/AuthContext";

export default function LoginLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}