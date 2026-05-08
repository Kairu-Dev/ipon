import Image from "next/image";
import { AUTH_STRINGS } from "@/locale/auth";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full font-body-base antialiased bg-background text-on-background">
      {/* Left Panel: Branding / Hero - This stays constant across auth pages for snappiness */}
      <div className="hidden md:flex md:w-1/2 lg:w-5/12 bg-primary relative overflow-hidden flex-col justify-between p-12">
        {/* Background Image Overlay - Optimized with Next.js Image */}
        <div className="absolute inset-0 z-0">
          <Image
            alt="abstract dark green geometric financial lines with subtle warm lighting"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxEdhFiqXlZgoSWQ83N2KdqwrQX7zvwdm5_8cibECL6y0TOnIgBRBz0OUPPUPhtb4T1BOBwVm2DHHxBqMob8OoO4T87udhFSMqWF7IG19T72hVtX9pqTjFjArOF3oppPjZ48yGKpgv4_LMPDKWZPQu6QNd2zULof9WsX6t4QNHFwM4ftbH02NEygAG_YKtOkTGNcF2SgDvwhzUhNyrGQS-pxB-JMiyibtzPbFWh0NAL2aPTJIANf20G_DKDFbmEb_33g_hUN4G3Xfg"
            fill
            sizes="(max-width: 768px) 0vw, (max-width: 1200px) 50vw, 42vw"
            className="object-cover opacity-20 mix-blend-overlay"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary/95"></div>
        </div>

        {/* Top Content */}
        <div className="relative z-10 flex items-center gap-2 text-on-primary">
          <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">spa</span>
          <span className="font-h2 text-h2 tracking-tight">{AUTH_STRINGS.BRAND_NAME}</span>
        </div>

        {/* Center Content */}
        <div className="relative z-10 flex flex-col gap-4">
          <h1 className="font-display text-display text-on-primary max-w-sm">
            {AUTH_STRINGS.HERO_TITLE}
          </h1>
          <p className="font-body-base text-body-base text-primary-fixed-dim max-w-md">
            {AUTH_STRINGS.HERO_SUBTITLE}
          </p>
        </div>

        {/* Bottom Content */}
        <div className="relative z-10 border-l-2 border-primary-fixed-dim pl-4">
          <div className="flex flex-col gap-1 text-primary-fixed-dim">
            <span className="font-body-sm text-body-sm italic">&quot;{AUTH_STRINGS.HERO_QUOTE}&quot;</span>
            <span className="font-label-xs text-label-xs opacity-80">— {AUTH_STRINGS.HERO_QUOTE_AUTHOR}</span>
          </div>
        </div>
      </div>

      {/* Right Panel: Auth Forms (Dynamic Content) */}
      <div className="w-full md:w-1/2 lg:w-7/12 flex items-center justify-center p-8 sm:p-12 bg-surface-container-lowest overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
