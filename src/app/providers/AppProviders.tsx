import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../features/auth";
import { CompareProvider } from "../../features/colleges";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CompareProvider>
          {children}
        </CompareProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
