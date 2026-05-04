"use client";

import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { usePresence } from "./usePresence";
import { apiRequest, errorMessage } from "@/lib/api";
import { useAuth } from "./AuthProvider";
import type { AuthResponse } from "@/lib/auth-types";
import type { AuthTokens } from "@/lib/auth-storage";

type AuthMode = "login" | "register";

type AuthModalProps = {
  open: boolean;
  mode: AuthMode;
  onClose: () => void;
  onModeChange: (next: AuthMode) => void;
  onLoginSuccess?: () => void;
  logoSrc?: string;
};

type ForgotStep = "request" | "reset";

type LoginFieldErrors = {
  identifier?: string;
  password?: string;
};

type RegisterFieldErrors = {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizePhone = (value: string) => value.replace(/[\s.-]/g, "");

const isValidPhone = (value: string) => {
  const phone = normalizePhone(value);
  return /^(0|\+84)\d{9}$/.test(phone) || /^\d{9,15}$/.test(phone);
};

function TextInput({
  type = "text",
  placeholder,
  value,
  onChange,
  right,
  error,
  autoComplete,
}: {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  right?: ReactNode;
  error?: string;
  autoComplete?: string;
}) {
  const hasError = Boolean(error);

  return (
    <div>
      <div className="relative">
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={hasError}
          className={
            "w-full h-[46px] sm:h-[50px] pl-4 pr-12 rounded-lg outline-none transition-all " +
            (hasError
              ? "bg-red-50 border border-red-400 focus:ring-2 focus:ring-red-200"
              : "bg-gray-100 border border-transparent focus:ring-2 focus:ring-accent-blue/40")
          }
        />
        {right && (
          <span
            className={
              "absolute right-4 top-1/2 -translate-y-1/2 " +
              (hasError ? "text-red-500" : "text-gray-500")
            }
          >
            {right}
          </span>
        )}
      </div>
      {hasError && (
        <p className="mt-1 text-left text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

export default function AuthModal({
  open,
  mode,
  onClose,
  onModeChange,
  onLoginSuccess,
  logoSrc = "/image 2.png",
}: AuthModalProps) {
  const { mounted, visible } = usePresence(open, 220);
  const { signIn } = useAuth();

  const [allowBackdropClose, setAllowBackdropClose] = useState(false);

  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberLogin, setRememberLogin] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState<LoginFieldErrors>({});

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [registerErrors, setRegisterErrors] = useState<RegisterFieldErrors>({});

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotStep>("request");
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] =
    useState(false);
  const [debugOtp, setDebugOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setAllowBackdropClose(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!open) return;
    setError("");
    setSuccess("");
    setLoginErrors({});
    setRegisterErrors({});
  }, [open, mode, forgotOpen, forgotStep]);

  useEffect(() => {
    if (open) return;
    setLoading(false);
    setError("");
    setSuccess("");
    setForgotOpen(false);
    setForgotStep("request");
    setForgotOtp("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
    setDebugOtp("");
    setRememberLogin(true);
    setShowLoginPassword(false);
    setShowRegisterPassword(false);
    setShowRegisterConfirmPassword(false);
    setShowForgotNewPassword(false);
    setShowForgotConfirmPassword(false);
    setLoginErrors({});
    setRegisterErrors({});
  }, [open]);

  if (!mounted) return null;

  const resetForgotState = () => {
    setForgotOpen(false);
    setForgotStep("request");
    setForgotOtp("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
    setDebugOtp("");
  };

  const resolveTokens = (response: Partial<AuthResponse>): AuthTokens => {
    const accessToken = String(
      response.accessToken || response.token || "",
    ).trim();
    const refreshToken = String(response.refreshToken || "").trim();
    if (!accessToken || !refreshToken) {
      throw new Error("Không nhận được đủ access token và refresh token.");
    }
    return { accessToken, refreshToken };
  };

  const afterAuthSuccess = (response: AuthResponse, remember = true) => {
    signIn(resolveTokens(response), response.user, remember);
    if (onLoginSuccess) {
      onLoginSuccess(); // set success ref BEFORE onClose fires router.back()
      onClose();
    } else {
      setSuccess(response.message || "Thành công.");
      onClose();
    }
  };

  const validateLoginForm = () => {
    const nextErrors: LoginFieldErrors = {};
    const identifier = loginIdentifier.trim();

    if (!identifier) {
      nextErrors.identifier = "Vui lòng nhập email hoặc số điện thoại.";
    } else if (identifier.includes("@")) {
      if (!EMAIL_REGEX.test(identifier)) {
        nextErrors.identifier = "Email không đúng định dạng.";
      }
    } else if (!isValidPhone(identifier)) {
      nextErrors.identifier = "Số điện thoại không đúng định dạng.";
    }

    if (!loginPassword.trim()) {
      nextErrors.password = "Vui lòng nhập mật khẩu.";
    }

    setLoginErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateRegisterForm = () => {
    const nextErrors: RegisterFieldErrors = {};

    if (!registerName.trim()) {
      nextErrors.name = "Vui lòng nhập họ và tên.";
    } else if (registerName.trim().length < 2) {
      nextErrors.name = "Họ và tên phải có ít nhất 2 ký tự.";
    }

    if (!registerEmail.trim()) {
      nextErrors.email = "Vui lòng nhập email.";
    } else if (!EMAIL_REGEX.test(registerEmail.trim())) {
      nextErrors.email = "Email không đúng định dạng.";
    }

    if (!registerPhone.trim()) {
      nextErrors.phone = "Vui lòng nhập số điện thoại.";
    } else if (!isValidPhone(registerPhone.trim())) {
      nextErrors.phone = "Số điện thoại không đúng định dạng.";
    }

    if (!registerPassword.trim()) {
      nextErrors.password = "Vui lòng nhập mật khẩu.";
    } else if (registerPassword.length < 6) {
      nextErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    if (!registerConfirmPassword.trim()) {
      nextErrors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    } else if (registerConfirmPassword !== registerPassword) {
      nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    setRegisterErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!validateLoginForm()) {
      return;
    }

    try {
      setLoading(true);
      const normalizedIdentifier = loginIdentifier.trim();
      const response = await apiRequest<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: {
          identifier: normalizedIdentifier.includes("@")
            ? normalizedIdentifier
            : normalizePhone(normalizedIdentifier),
          password: loginPassword,
          remember: rememberLogin,
        },
      });
      afterAuthSuccess(response, rememberLogin);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onSubmitRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!validateRegisterForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiRequest<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: {
          name: registerName.trim(),
          email: registerEmail.trim(),
          phone: normalizePhone(registerPhone.trim()),
          password: registerPassword,
          remember: true,
        },
      });
      afterAuthSuccess(response);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onRequestForgotOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!forgotIdentifier.trim()) {
      setError("Vui lòng nhập email hoặc số điện thoại.");
      return;
    }

    try {
      setLoading(true);
      const response = await apiRequest<{
        message: string;
        debug?: { otp?: string };
      }>("/api/auth/forgot-password", {
        method: "POST",
        body: { identifier: forgotIdentifier.trim() },
      });
      setForgotStep("reset");
      setSuccess(response.message || "OTP đã được gửi.");
      setDebugOtp(response.debug?.otp || "");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (
      !forgotIdentifier.trim() ||
      !forgotOtp.trim() ||
      !forgotNewPassword.trim() ||
      !forgotConfirmPassword.trim()
    ) {
      setError("Vui lòng nhập đầy đủ thông tin đặt lại mật khẩu.");
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setLoading(true);
      const response = await apiRequest<{ message: string }>(
        "/api/auth/reset-password",
        {
          method: "POST",
          body: {
            identifier: forgotIdentifier.trim(),
            otp: forgotOtp.trim(),
            newPassword: forgotNewPassword,
          },
        },
      );
      setSuccess(response.message || "Đặt lại mật khẩu thành công.");
      setForgotOpen(false);
      setForgotStep("request");
      setForgotOtp("");
      setForgotNewPassword("");
      setForgotConfirmPassword("");
      setDebugOtp("");
      onModeChange("login");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const AccentPanel = ({
    title,
    desc,
    buttonLabel,
    nextMode,
  }: {
    title: string;
    desc: string;
    buttonLabel: string;
    nextMode: AuthMode;
  }) => (
    <div className="h-full w-full bg-accent-blue text-white flex flex-col justify-center items-center px-10 py-10 text-center">
      <h2 className="text-3xl font-bold mb-3">{title}</h2>
      <p className="text-sm opacity-90">{desc}</p>

      <button
        type="button"
        onClick={() => {
          resetForgotState();
          onModeChange(nextMode);
        }}
        className="mt-6 inline-flex items-center justify-center
                   h-[48px] w-[170px]
                   border-2 border-white rounded-full
                   font-semibold uppercase tracking-wide
                   hover:bg-white hover:text-accent-blue
                   transition-all duration-300"
      >
        {buttonLabel}
      </button>
    </div>
  );

  const Logo = () => (
    <div className="flex justify-center">
      <img src={logoSrc} alt="25Zone" className="h-16 sm:h-20 object-contain" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[90]">
      <div
        className={
          "absolute inset-0 bg-black/45 transition-opacity duration-200 pointer-events-none " +
          (visible ? "opacity-100" : "opacity-0")
        }
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        className="absolute inset-0 flex items-start md:items-center justify-center p-0 sm:p-4"
        onClick={(event) => {
          if (!allowBackdropClose) return;
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <div
          className={
            "relative w-full max-w-[900px] bg-white rounded-none md:rounded-3xl shadow-2xl " +
            "overflow-y-auto md:overflow-hidden h-[100dvh] md:h-auto md:max-h-[92vh] " +
            "grid grid-cols-1 md:grid-cols-2 transition-all duration-200 " +
            (visible
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-[.98] translate-y-2")
          }
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="absolute right-3 top-3 z-10 w-10 h-10 rounded-full bg-white/90 border border-gray-200
                       flex items-center justify-center hover:text-accent-blue transition"
          >
            <i className="fa-solid fa-xmark text-[18px]" />
          </button>

          {mode === "login" && (
            <>
              <div className="hidden md:flex">
                <AccentPanel
                  title="Chào mừng bạn"
                  desc="Chưa có tài khoản?"
                  buttonLabel="Đăng ký ngay"
                  nextMode="register"
                />
              </div>

              <div className="px-6 sm:px-10 py-7 sm:py-10 text-center">
                <Logo />
                <p className="text-xl font-semibold mt-2 mb-6 text-[#003366]">
                  {forgotOpen ? "Quên mật khẩu" : "Đăng nhập"}
                </p>

                {!forgotOpen && (
                  <form className="space-y-4" onSubmit={onSubmitLogin}>
                    <TextInput
                      placeholder="Email / Số điện thoại"
                      value={loginIdentifier}
                      onChange={(value) => {
                        setLoginIdentifier(value);
                        setLoginErrors((prev) => ({ ...prev, identifier: "" }));
                      }}
                      autoComplete="username"
                      error={loginErrors.identifier}
                      right={<i className="fa-regular fa-user text-[16px]" />}
                    />
                    <TextInput
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="Mật khẩu"
                      value={loginPassword}
                      onChange={(value) => {
                        setLoginPassword(value);
                        setLoginErrors((prev) => ({ ...prev, password: "" }));
                      }}
                      autoComplete="current-password"
                      error={loginErrors.password}
                      right={
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword((prev) => !prev)}
                          aria-label={
                            showLoginPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                          }
                          className="hover:text-accent-blue transition"
                        >
                          <i
                            className={
                              "fa-regular text-[16px] " +
                              (showLoginPassword ? "fa-eye-slash" : "fa-eye")
                            }
                          />
                        </button>
                      }
                    />

                    <div className="flex items-center justify-between text-sm">
                      <label className="inline-flex items-center gap-2 text-gray-700 select-none cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberLogin}
                          onChange={(event) =>
                            setRememberLogin(event.target.checked)
                          }
                          className="h-4 w-4 rounded border-gray-300 text-accent-blue focus:ring-accent-blue/40"
                        />
                        <span>Ghi nhớ đăng nhập</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotOpen(true);
                          setForgotIdentifier(loginIdentifier);
                        }}
                        className="text-accent-blue hover:underline"
                      >
                        Quên mật khẩu?
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-[52px] bg-accent-blue text-white font-extrabold
                               rounded-full uppercase tracking-wider
                               hover:shadow-[0_0_15px_rgba(51,177,250,.55)]
                               hover:bg-sky-500
                               transition-all duration-300 active:scale-95 disabled:opacity-70"
                    >
                      {loading ? "Đang xử lý..." : "Đăng nhập"}
                    </button>

                    <div className="pt-2">
                      <p className="text-sm text-gray-500">
                        Hoặc đăng nhập bằng nền tảng
                      </p>
                      <div className="mt-4 flex items-center justify-center gap-3">
                        <button
                          type="button"
                          aria-label="Đăng nhập Facebook"
                          className="h-11 w-11 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                        >
                          <i className="fa-brands fa-facebook-f" />
                        </button>
                        <button
                          type="button"
                          aria-label="Đăng nhập Google"
                          className="h-11 w-11 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                        >
                          <i className="fa-brands fa-google" />
                        </button>
                        <button
                          type="button"
                          aria-label="Đăng nhập nền tảng khác"
                          className="h-11 w-11 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                        >
                          <i className="fa-solid fa-code-branch" />
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {forgotOpen && forgotStep === "request" && (
                  <form className="space-y-4" onSubmit={onRequestForgotOtp}>
                    <TextInput
                      placeholder="Email / Số điện thoại"
                      value={forgotIdentifier}
                      onChange={setForgotIdentifier}
                      autoComplete="username"
                      right={<i className="fa-regular fa-user text-[16px]" />}
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-[52px] bg-accent-blue text-white font-extrabold
                               rounded-full uppercase tracking-wider
                               transition-all duration-300 active:scale-95 disabled:opacity-70"
                    >
                      {loading ? "Đang gửi..." : "Gửi OTP qua email"}
                    </button>
                  </form>
                )}

                {forgotOpen && forgotStep === "reset" && (
                  <form className="space-y-4" onSubmit={onResetPassword}>
                    <TextInput
                      placeholder="Email / Số điện thoại"
                      value={forgotIdentifier}
                      onChange={setForgotIdentifier}
                      autoComplete="username"
                      right={<i className="fa-regular fa-user text-[16px]" />}
                    />
                    <TextInput
                      placeholder="Nhập OTP"
                      value={forgotOtp}
                      onChange={setForgotOtp}
                      right={<i className="fa-solid fa-key text-[16px]" />}
                    />
                    <TextInput
                      type={showForgotNewPassword ? "text" : "password"}
                      placeholder="Mật khẩu mới"
                      value={forgotNewPassword}
                      onChange={setForgotNewPassword}
                      autoComplete="new-password"
                      right={
                        <button
                          type="button"
                          onClick={() =>
                            setShowForgotNewPassword((prev) => !prev)
                          }
                          aria-label={
                            showForgotNewPassword
                              ? "Ẩn mật khẩu mới"
                              : "Hiện mật khẩu mới"
                          }
                          className="hover:text-accent-blue transition"
                        >
                          <i
                            className={
                              "fa-regular text-[16px] " +
                              (showForgotNewPassword
                                ? "fa-eye-slash"
                                : "fa-eye")
                            }
                          />
                        </button>
                      }
                    />
                    <TextInput
                      type={showForgotConfirmPassword ? "text" : "password"}
                      placeholder="Xác nhận mật khẩu mới"
                      value={forgotConfirmPassword}
                      onChange={setForgotConfirmPassword}
                      autoComplete="new-password"
                      right={
                        <button
                          type="button"
                          onClick={() =>
                            setShowForgotConfirmPassword((prev) => !prev)
                          }
                          aria-label={
                            showForgotConfirmPassword
                              ? "Ẩn mật khẩu xác nhận"
                              : "Hiện mật khẩu xác nhận"
                          }
                          className="hover:text-accent-blue transition"
                        >
                          <i
                            className={
                              "fa-regular text-[16px] " +
                              (showForgotConfirmPassword
                                ? "fa-eye-slash"
                                : "fa-eye")
                            }
                          />
                        </button>
                      }
                    />
                    {debugOtp && (
                      <p className="text-xs text-sky-700 bg-sky-50 border border-sky-200 rounded-lg p-2">
                        OTP debug (dev): <b>{debugOtp}</b>
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-[52px] bg-accent-blue text-white font-extrabold
                               rounded-full uppercase tracking-wider
                               transition-all duration-300 active:scale-95 disabled:opacity-70"
                    >
                      {loading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
                    </button>
                  </form>
                )}

                {error && (
                  <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}
                {success && (
                  <p className="mt-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    {success}
                  </p>
                )}

                <div className="md:hidden mt-5">
                  {forgotOpen ? (
                    <button
                      type="button"
                      onClick={resetForgotState}
                      className="mt-3 w-full h-[48px] rounded-full border-2 border-accent-blue
                               font-extrabold uppercase tracking-wide text-accent-blue
                               hover:bg-accent-blue hover:text-white transition"
                    >
                      Quay lại đăng nhập
                    </button>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500">
                        Chưa có tài khoản?
                      </p>
                      <button
                        type="button"
                        onClick={() => onModeChange("register")}
                        className="mt-3 w-full h-[48px] rounded-full border-2 border-accent-blue
                               font-extrabold uppercase tracking-wide text-accent-blue
                               hover:bg-accent-blue hover:text-white transition"
                      >
                        Đăng ký ngay
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {mode === "register" && (
            <>
              <div className="px-6 sm:px-10 py-7 sm:py-10 flex flex-col justify-center text-center">
                <Logo />
                <p className="text-xl font-semibold mt-2 mb-6 text-[#003366]">
                  Đăng ký
                </p>

                <form className="space-y-4" onSubmit={onSubmitRegister}>
                  <TextInput
                    placeholder="Họ và tên"
                    value={registerName}
                    onChange={(value) => {
                      setRegisterName(value);
                      setRegisterErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    autoComplete="name"
                    error={registerErrors.name}
                    right={<i className="fa-regular fa-user text-[16px]" />}
                  />
                  <TextInput
                    type="email"
                    placeholder="Email"
                    value={registerEmail}
                    onChange={(value) => {
                      setRegisterEmail(value);
                      setRegisterErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    autoComplete="email"
                    error={registerErrors.email}
                    right={<i className="fa-regular fa-envelope text-[16px]" />}
                  />
                  <TextInput
                    placeholder="Số điện thoại"
                    value={registerPhone}
                    onChange={(value) => {
                      setRegisterPhone(value);
                      setRegisterErrors((prev) => ({ ...prev, phone: "" }));
                    }}
                    autoComplete="tel"
                    error={registerErrors.phone}
                    right={<i className="fa-solid fa-phone text-[16px]" />}
                  />
                  <TextInput
                    type={showRegisterPassword ? "text" : "password"}
                    placeholder="Mật khẩu"
                    value={registerPassword}
                    onChange={(value) => {
                      setRegisterPassword(value);
                      setRegisterErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    autoComplete="new-password"
                    error={registerErrors.password}
                    right={
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword((prev) => !prev)}
                        aria-label={
                          showRegisterPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                        }
                        className="hover:text-accent-blue transition"
                      >
                        <i
                          className={
                            "fa-regular text-[16px] " +
                            (showRegisterPassword ? "fa-eye-slash" : "fa-eye")
                          }
                        />
                      </button>
                    }
                  />
                  <TextInput
                    type={showRegisterConfirmPassword ? "text" : "password"}
                    placeholder="Xác nhận mật khẩu"
                    value={registerConfirmPassword}
                    onChange={(value) => {
                      setRegisterConfirmPassword(value);
                      setRegisterErrors((prev) => ({ ...prev, confirmPassword: "" }));
                    }}
                    autoComplete="new-password"
                    error={registerErrors.confirmPassword}
                    right={
                      <button
                        type="button"
                        onClick={() => setShowRegisterConfirmPassword((prev) => !prev)}
                        aria-label={showRegisterConfirmPassword ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"}
                        className="hover:text-accent-blue transition"
                      >
                        <i
                          className={
                            "fa-regular text-[16px] " +
                            (showRegisterConfirmPassword ? "fa-eye-slash" : "fa-eye")
                          }
                        />
                      </button>
                    }
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[52px] mt-2 bg-accent-blue text-white font-extrabold uppercase
                               rounded-full tracking-wider
                               transition-all duration-300 active:scale-95 disabled:opacity-70"
                  >
                    {loading ? "Đang xử lý..." : "Đăng ký ngay"}
                  </button>

                  <div className="pt-2">
                    <p className="text-sm text-gray-500">
                      Hoặc đăng nhập bằng nền tảng
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        aria-label="Đăng nhập Facebook"
                        className="h-11 w-11 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                      >
                        <i className="fa-brands fa-facebook-f" />
                      </button>
                      <button
                        type="button"
                        aria-label="Đăng nhập Google"
                        className="h-11 w-11 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                      >
                        <i className="fa-brands fa-google" />
                      </button>
                      <button
                        type="button"
                        aria-label="Đăng nhập nền tảng khác"
                        className="h-11 w-11 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                      >
                        <i className="fa-solid fa-code-branch" />
                      </button>
                    </div>
                  </div>
                </form>

                {error && (
                  <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <div className="md:hidden mt-5">
                  <p className="text-sm text-gray-500">Đã có tài khoản?</p>
                  <button
                    type="button"
                    onClick={() => onModeChange("login")}
                    className="mt-3 w-full h-[48px] rounded-full border-2 border-accent-blue
                               font-extrabold uppercase tracking-wide text-accent-blue
                               hover:bg-accent-blue hover:text-white transition"
                  >
                    Đăng nhập
                  </button>
                </div>
              </div>

              <div className="hidden md:flex">
                <AccentPanel
                  title="Chào mừng!"
                  desc="Đã có tài khoản?"
                  buttonLabel="Đăng nhập"
                  nextMode="login"
                />
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
