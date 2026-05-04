"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthModal from "@/app/components/auth/AuthModal";
import { useAuth } from "@/app/components/auth/AuthProvider";

import { LoginSuccessPopup } from "@/app/components/auth/LoginSuccessPopup";

function LoginContent() {
  const router = useRouter();
  const { user, bootstrapped } = useAuth();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showSuccess, setShowSuccess] = useState(false);

  // ref to prevent router.back() when login just succeeded
  const loginSucceededRef = useRef(false);

  const returnTo = searchParams.get("returnTo") || "/";

  // Only auto-redirect if we're NOT showing the success popup
  useEffect(() => {
    if (!bootstrapped) return;
    if (user && !loginSucceededRef.current) {
      router.replace(returnTo);
    }
  }, [bootstrapped, user, router, returnTo]);

  if (!bootstrapped) return null;

  if (showSuccess) {
    return <LoginSuccessPopup returnTo={returnTo} />;
  }

  // Already logged in and no success popup → redirect handled by useEffect above
  if (user && !loginSucceededRef.current) return null;

  return (
    <AuthModal
      open
      mode={mode}
      logoSrc="/img/image%202.png"
      onClose={() => {
        // Don't navigate back if login just succeeded (popup is about to show)
        if (!loginSucceededRef.current) router.back();
      }}
      onModeChange={(next) => setMode(next)}
      onLoginSuccess={() => {
        loginSucceededRef.current = true;
        setShowSuccess(true);
      }}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
