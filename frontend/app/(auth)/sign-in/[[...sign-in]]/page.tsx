import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="relative">
        {/* Glow effect behind the card */}
        <div className="absolute -inset-4 bg-gradient-to-r from-brand-500/20 to-accent-500/20 blur-3xl rounded-3xl" />
        <SignIn
          appearance={{
            elements: {
              rootBox: 'relative z-10',
              card: 'bg-[var(--card-bg)] border border-[var(--border-color)] shadow-2xl',
            },
          }}
        />
      </div>
    </div>
  );
}
