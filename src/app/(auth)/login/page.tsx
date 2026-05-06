import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full font-body-base antialiased bg-background text-on-background">
      {/* Left Panel: Branding / Hero */}
      <div className="hidden md:flex md:w-1/2 lg:w-5/12 bg-primary relative overflow-hidden flex-col justify-between p-12">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="abstract dark green geometric financial lines with subtle warm lighting" className="w-full h-full object-cover opacity-20 mix-blend-overlay" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxEdhFiqXlZgoSWQ83N2KdqwrQX7zvwdm5_8cibECL6y0TOnIgBRBz0OUPPUPhtb4T1BOBwVm2DHHxBqMob8OoO4T87udhFSMqWF7IG19T72hVtX9pqTjFjArOF3oppPjZ48yGKpgv4_LMPDKWZPQu6QNd2zULof9WsX6t4QNHFwM4ftbH02NEygAG_YKtOkTGNcF2SgDvwhzUhNyrGQS-pxB-JMiyibtzPbFWh0NAL2aPTJIANf20G_DKDFbmEb_33g_hUN4G3Xfg"/>
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary/95"></div>
        </div>

        {/* Top Content */}
        <div className="relative z-10 flex items-center gap-2 text-on-primary">
          <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">spa</span>
          <span className="font-h2 text-h2 tracking-tight">Ipon</span>
        </div>

        {/* Center Content */}
        <div className="relative z-10 flex flex-col gap-4">
          <h1 className="font-display text-display text-on-primary max-w-sm">
            Your personal savings companion.
          </h1>
          <p className="font-body-base text-body-base text-primary-fixed-dim max-w-md">
            Build sustainable financial habits, track your expenses, and reach your goals with confidence. The smart way to handle your budget.
          </p>
        </div>

        {/* Bottom Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-primary-fixed-dim">
            <span className="material-symbols-outlined text-xl" aria-hidden="true">shield</span>
            <span className="font-body-sm text-body-sm">Bank-grade security & encryption</span>
          </div>
        </div>
      </div>

      {/* Right Panel: Auth Form */}
      <div className="w-full md:w-1/2 lg:w-7/12 flex items-center justify-center p-8 sm:p-12 bg-surface-container-lowest">
        <LoginForm />
      </div>
    </div>
  );
}
