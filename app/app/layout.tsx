import { ReactNode } from 'react';
import { AuthProvider } from './context/AuthContext';
import './globals.css';

export const metadata = {
  title: 'IT Service Tracker',
  description: 'Internal IT Service Management and Analytics',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
