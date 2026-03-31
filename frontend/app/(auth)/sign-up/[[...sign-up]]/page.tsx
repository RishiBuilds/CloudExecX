import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="relative min-h-screen bg-[#080c10] flex items-center justify-center p-8 overflow-hidden font-sans">

      {/* Dot grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,136,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,136,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,transparent_30%,#080c10_100%)]" />

      {/* Accent orbs — mirrored positions from sign-in for variety */}
      <div className="absolute -top-24 -right-24 w-[400px] h-[400px] rounded-full bg-indigo-500/[0.07] blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-[#00ff88]/[0.05] blur-[80px] pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[440px]">

        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 bg-[#00ff88] rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 7l4-3 4 3-4 3-4-3z" fill="#080c10" />
                <path d="M8 10v6" stroke="#080c10" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M12 10l4 2v4l-4 2-4-2v-4l4-2z" stroke="#080c10" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-mono text-[18px] font-semibold text-[#f0f4f8] tracking-tight">
              Cloud<span className="text-[#00ff88]">Exec</span>X
            </span>
          </div>

          <h1 className="text-[26px] font-bold text-[#f0f4f8] leading-tight tracking-tight mb-2">
            Create your account
          </h1>
          <p className="font-mono text-[12px] text-[#4a6177] tracking-[0.5px]">
            $ docker run --rm -it <span className="text-[#00ff88]">your-code</span>
          </p>
        </div>

        {/* Clerk card shell */}
        <div className="bg-[#0d1520] border border-[#1a2a3a] rounded-2xl p-8">

          {/* Free tier badge */}
          <div className="flex items-center justify-center gap-2 mb-5 py-2 px-3 bg-[#00ff88]/[0.06] border border-[#00ff88]/20 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
            <span className="font-mono text-[11px] text-[#00ff88] tracking-[0.5px]">
              Free tier · No credit card required
            </span>
          </div>

          <SignUp
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-transparent border-0 shadow-none p-0 gap-0',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                header: 'hidden',
                socialButtonsBlockButton:
                  'w-full flex items-center justify-center gap-2.5 py-[11px] px-4 bg-[#111d29] border border-[#1a2a3a] rounded-[10px] text-[#8ba5be] font-semibold text-sm mb-2.5 hover:border-[#00ff88] hover:text-[#f0f4f8] transition-colors duration-200',
                socialButtonsBlockButtonText: 'font-sans text-sm',
                dividerRow: 'my-5',
                dividerText: 'font-mono text-[10px] text-[#2a3f52] uppercase tracking-[1.5px]',
                dividerLine: 'bg-[#1a2a3a]',
                formFieldLabel:
                  'font-mono text-[11px] text-[#4a6177] uppercase tracking-[0.8px] mb-1.5',
                formFieldInput:
                  'w-full bg-[#080c10] border border-[#1a2a3a] rounded-lg py-2.5 px-3.5 text-[#f0f4f8] font-mono text-[13px] placeholder:text-[#2a3f52] focus:border-[#00ff88] focus:outline-none focus:ring-0 transition-colors duration-200',
                formFieldInputShowPasswordButton: 'text-[#4a6177] hover:text-[#f0f4f8]',
                footerActionLink: 'text-[#00ff88] hover:text-[#00ff88]/80 font-mono text-[11px]',
                footerActionText: 'font-mono text-[11px] text-[#2a3f52]',
                formButtonPrimary:
                  'w-full mt-1 py-3 bg-[#00ff88] border-0 rounded-[10px] text-[#080c10] font-sans text-sm font-bold tracking-[0.3px] hover:opacity-90 transition-opacity duration-200 cursor-pointer',
                identityPreviewEditButton: 'text-[#00ff88]',
                formFieldAction: 'font-mono text-[11px] text-[#4a6177] hover:text-[#00ff88]',
                alert: 'bg-red-950/40 border border-red-900/40 text-red-400 font-mono text-[12px] rounded-lg',
                alertText: 'text-red-400 font-mono text-[12px]',
              },
              variables: {
                colorPrimary: '#00ff88',
                colorBackground: '#0d1520',
                colorText: '#f0f4f8',
                colorTextSecondary: '#8ba5be',
                colorInputBackground: '#080c10',
                colorInputText: '#f0f4f8',
                borderRadius: '10px',
                fontFamily: 'JetBrains Mono, monospace',
              },
            }}
          />
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-center gap-1.5 mt-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
          <span className="font-mono text-[10px] text-[#2a3f52] tracking-[0.5px]">
            Sandboxed · Isolated · Auto-scaled
          </span>
        </div>

      </div>
    </div>
  );
}