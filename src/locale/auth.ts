// src/locale/auth.ts
// Temporary location for all authentication strings (i18n ready)

export const AUTH_STRINGS = {
  // Brand
  BRAND_NAME: "Ipon",

  // Hero Section (Left Panel)
  HERO_TITLE: "Your personal savings companion.",
  HERO_SUBTITLE: "Build sustainable financial habits, track your expenses, and reach your goals with confidence. The smart way to handle your budget.",
  HERO_QUOTE: "Do not save what is left after spending, but spend what is left after saving.",
  HERO_QUOTE_AUTHOR: "Warren Buffett",

  // Headings & Descriptions
  LOGIN_TITLE: "Welcome back",
  LOGIN_SUBTITLE: "Enter your details below to securely log in.",
  SIGNUP_TITLE: "Create your account",
  SIGNUP_SUBTITLE: "Start your savings journey today.",

  // Tabs
  TAB_LOGIN: "Log In",
  TAB_SIGNUP: "Sign Up",

  // Labels
  LABEL_NAME: "Full Name",
  LABEL_EMAIL: "Email Address",
  LABEL_EMAIL_SHORT: "Email",
  LABEL_PASSWORD: "Password",
  LABEL_CONFIRM_PASSWORD: "Confirm Password",

  // Placeholders
  PLACEHOLDER_NAME: "John Doe",
  PLACEHOLDER_EMAIL: "name@example.com",
  PLACEHOLDER_PASSWORD: "Enter your password",
  PLACEHOLDER_CONFIRM: "••••••••",

  // Buttons & Links
  LINK_FORGOT_PASSWORD: "Forgot password?",
  BTN_LOGIN: "Sign In",
  BTN_LOGIN_LOADING: "Signing in…",
  BTN_SIGNUP: "Create Account",
  BTN_SIGNUP_LOADING: "Creating account…",
  
  // Dividers & OAuth
  DIVIDER_TEXT: "Or continue with",
  BTN_OAUTH_GOOGLE: "Google — Coming soon",
  BTN_OAUTH_APPLE: "Apple — Coming soon",
  OAUTH_TOOLTIP: "Coming soon",

  // Password Rules
  RULE_MIN_LENGTH: "At least 8 characters",
  RULE_UPPERCASE: "One uppercase letter",
  RULE_LOWERCASE: "One lowercase letter",
  RULE_NUMBER: "One number",
  RULE_SPECIAL: "One special character",
  RULE_NOT_BLANK: "Cannot be blank",

  // Error Messages
  ERR_PASSWORDS_MISMATCH: "Passwords do not match.",
  ERR_INVALID_CREDENTIALS: "Invalid email or password.",
  ERR_GENERIC_LOGIN: "Could not sign in. Please try again.",
  ERR_GENERIC_SIGNUP: "Could not create account. Please try again.",
  
  // Validation Messages
  ERR_REQ_EMAIL: "Email is required",
  ERR_REQ_PASSWORD: "Password is required",
  ERR_REQ_NAME: "Name is required",
  ERR_INVALID_EMAIL: "Invalid email address",
  
  // Rate Limiting
  rateLimitMessage: (minutes: number) => `Too many login attempts. Please try again in ${minutes} minute(s).`,

  // Test Account Info
  TEST_ACCOUNT_HEADER: "Test account for this app",
  TEST_ACCOUNT_EMAIL: "Email: name@example.com",
  TEST_ACCOUNT_PASS: "Password: 12345678",

  // Forgot Password
  FORGOT_PASSWORD_TITLE: "Forgot password?",
  FORGOT_PASSWORD_SUBTITLE: "No worries, we'll send you reset instructions.",
  BTN_RESET_PASSWORD: "Reset Password",
  LINK_BACK_TO_LOGIN: "Back to Log In",
  LINK_REMEMBER_PASSWORD: "Remember your password? Log In",

  // Verification
  VERIFY_TITLE: "Verify your identity",
  VERIFY_SUBTITLE: "We've sent a 6-digit code to your email",
  VERIFY_RESEND: "Resend code in",
  BTN_VERIFY: "Verify & Continue",
  LINK_CHANGE_EMAIL: "Change email",
} as const;
