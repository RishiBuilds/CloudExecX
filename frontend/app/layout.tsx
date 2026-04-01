import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Syne } from 'next/font/google';
import { JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import Navbar from '@/components/ui/Navbar';
import '@/styles/globals.css';


const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-syne',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});


export const metadata: Metadata = {
  title: {
    default: 'CloudExecX — Code Execution Platform',
    template: '%s · CloudExecX',
  },
  description:
    'Write and execute code in isolated, secure Docker containers. Supports Python, JavaScript, and C++ with real-time output.',
  keywords: ['code execution', 'online compiler', 'docker', 'python', 'javascript', 'cpp'],
  openGraph: {
    title: 'CloudExecX — Code Execution Platform',
    description: 'Isolated Docker sandboxes. Real-time output. Zero setup.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#080c10',
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // No global Clerk appearance here — each auth page owns its own theme.
    // Keeping it here would create a conflict with the per-page overrides.
    <ClerkProvider>
      <html
        lang="en"
        className={`${syne.variable} ${jetbrainsMono.variable}`}
        suppressHydrationWarning
      >
        <body className="min-h-screen bg-[#080c10] antialiased font-[var(--font-syne)]">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            // No enableSystem — your design is dark-only.
            // Allowing system override fights your hardcoded backgrounds.
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