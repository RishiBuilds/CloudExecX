import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import Navbar from '@/components/ui/Navbar';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'CloudExecX — Code Execution Platform',
  description:
    'Write and execute code in isolated, secure Docker containers. Supports Python, JavaScript, and C++ with real-time output.',
  keywords: ['code execution', 'online compiler', 'docker', 'python', 'javascript', 'cpp'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#7c3aed',
          colorBackground: '#111118',
          colorText: '#e2e8f0',
          colorInputBackground: '#1a1a24',
          colorInputText: '#e2e8f0',
          borderRadius: '0.5rem',
        },
        elements: {
          card: 'bg-[#111118] border border-[#1e293b]',
          formButtonPrimary: 'bg-[#7c3aed] hover:bg-[#6d28d9]',
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="min-h-screen antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            <main className="pt-16">{children}</main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
