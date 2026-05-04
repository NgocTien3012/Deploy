"use client";

import React from "react";
import { AuthProvider } from "@/app/components/auth/AuthProvider";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

