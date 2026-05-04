"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "@/app/components/auth/AuthModal";
import { useAuth } from "@/app/components/auth/AuthProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { user, bootstrapped } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("register");

  useEffect(() => {
    if (!bootstrapped) return;
    if (user) router.replace("/");
  }, [bootstrapped, user, router]);

  if (!bootstrapped || user) return null;

  return (
    <AuthModal
      open
      mode={mode}
      logoSrc="/img/image%202.png"
      onClose={() => router.back()}
      onModeChange={(next) => {
        setMode(next);
      }}
    />
  );
}
