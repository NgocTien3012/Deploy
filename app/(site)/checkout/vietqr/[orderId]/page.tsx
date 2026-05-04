"use client";

import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/app/components/auth/AuthProvider";
import Toast from "@/app/components/Toast";

function VietQRContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const amount = searchParams.get("amount") || "0";
  const { bootstrapped, user, token } = useAuth();

  const [timeLeft, setTimeLeft] = useState(600); // 10 phút
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [toast, setToast] = useState<{message: string, type: "success" | "error" | "warning"} | null>(null);
  const [paymentSuccessPopup, setPaymentSuccessPopup] = useState(false);

  const transferContent = `DH${params.orderId}`;
  const bankAccount = "8861998981";
  const qrUrl = `https://img.vietqr.io/image/bidv-${bankAccount}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=25Zone%20Shop`;

  useEffect(() => {
    if (bootstrapped && !user) {
      router.push("/login");
    }
  }, [bootstrapped, user, router]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setToast({ message: "Thời gian thanh toán đã hết, giao dịch sẽ bị hủy!", type: "warning" });
      fetch(`https://api.25zone.io.vn/api/orders/${params.orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: "cancelled" }),
      }).then(() => {
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }).catch(console.error);
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, router]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handlePaymentSuccess = () => {
    // Hiển thị popup thanh toán thành công
    setPaymentSuccessPopup(true);
    setTimeout(() => {
      router.push(`/checkout/success/${params.orderId}`);
    }, 2000);
  };

  const confirmCancel = async () => {
    setCancelLoading(true);
    try {
      const res = await fetch(`https://api.25zone.io.vn/api/orders/${params.orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (res.ok) {
        setShowCancelPopup(false);
        setToast({ message: "Giao dịch đã được hủy", type: "success" });
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setToast({ message: "Có lỗi xảy ra khi hủy giao dịch.", type: "error" });
        setShowCancelPopup(false);
      }
    } catch (error) {
      console.error(error);
      setToast({ message: "Có lỗi xảy ra khi hủy giao dịch.", type: "error" });
      setShowCancelPopup(false);
    } finally {
      setCancelLoading(false);
    }
  };



  const handleDownloadQR = () => {
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `QR_Thanh_Toan_DH${params.orderId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!bootstrapped || !user) return null;

  return (
    <div className="min-h-screen bg-[#eef7fb] flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="w-full max-w-[500px] bg-white rounded-[32px] shadow-2xl overflow-hidden border border-[#003366]/10">
        {/* Header */}
        <div className="bg-[#003366] px-6 py-6 flex flex-col items-center gap-3 text-center">
          <div className="flex flex-col items-center gap-2 text-white font-bold text-xl sm:text-2xl">
            <i className="fa-solid fa-qrcode text-3xl mb-1"></i>
            Thanh toán VietQR
          </div>
          <div className="text-white mt-1">
            <p className="text-sm opacity-80 uppercase tracking-wider text-[11px]">Thời gian giao dịch</p>
            <p className="text-3xl font-bold font-mono tracking-wider text-white">{formatTime(timeLeft)}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 flex flex-col items-center justify-center space-y-5">
          <h3 className="text-[#003366] font-bold text-lg text-center">
            Mở app ngân hàng / Ví và quét mã QR
          </h3>

          <div className="w-full max-w-[380px] flex justify-center bg-white p-2 sm:p-4 rounded-3xl shadow-sm border-2 border-[#003366]/5">
            <img
              src={qrUrl}
              alt="Mã VietQR"
              className="w-full h-auto object-contain rounded-xl"
            />
          </div>

          <div className="flex flex-col items-center gap-3 pt-2">
            <button
              onClick={handleDownloadQR}
              className="flex items-center gap-2 bg-[#003366]/10 text-[#003366] hover:bg-[#003366]/20 px-6 py-2.5 rounded-full font-bold transition-colors"
            >
              <i className="fa-solid fa-download"></i> Tải ảnh QR
            </button>
            <div className="flex items-center gap-2 text-gray-500 font-medium text-sm mt-2">
              <i className="fa-solid fa-circle-notch fa-spin"></i>
              Trạng thái: Chờ thanh toán...
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="w-full bg-gray-50 p-6 flex flex-col gap-3 border-t border-gray-100">
          <button
            onClick={handlePaymentSuccess}
            className="bg-[#003366] hover:bg-[#002244] text-white py-3.5 px-6 rounded-full font-extrabold text-[15px] sm:text-base transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 w-full"
          >
            <i className="fa-solid fa-check-circle text-lg"></i>
            Thanh Toán
          </button>
          <button
            onClick={() => setShowCancelPopup(true)}
            className="py-3 px-6 text-center text-gray-600 font-bold hover:bg-gray-200 bg-gray-100 rounded-full transition-colors w-full border border-gray-200 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-xmark"></i>
            Hủy giao dịch
          </button>
        </div>
      </div>

      <p className="mt-8 text-sm font-medium text-[#003366]/60">
        © 2026 25Zone Shop. Mọi quyền được bảo lưu.
      </p>

      {/* Cancel Confirmation Modal */}
      {showCancelPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#003366]/40 backdrop-blur-sm transition-opacity duration-200">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
              <i className="fa-solid fa-triangle-exclamation text-red-500 text-4xl"></i>
            </div>
            <h3 className="text-2xl font-extrabold text-[#003366] mb-3 uppercase">Xác nhận hủy</h3>
            <p className="text-gray-600 mb-8 font-medium">Bạn có chắc chắn muốn hủy giao dịch thanh toán này không?</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCancelPopup(false)}
                className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Không
              </button>
              <button
                onClick={confirmCancel}
                disabled={cancelLoading}
                className="flex-1 py-3.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
              >
                {cancelLoading ? <i className="fa-solid fa-spinner animate-spin"></i> : "Hủy ngay"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Payment Success Popup */}
      {paymentSuccessPopup && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[32px] shadow-2xl p-8 max-w-sm w-full text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-check text-4xl text-green-500"></i>
            </div>
            <h3 className="text-2xl font-extrabold text-[#003366] mb-2">Thanh toán thành công!</h3>
            <p className="text-gray-500 font-medium mb-6">Hệ thống đang xử lý và chuyển hướng...</p>
            <div className="flex justify-center">
              <i className="fa-solid fa-circle-notch fa-spin text-[#003366] text-3xl"></i>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VietQRPaymentPage() {
  return (
    <Suspense fallback={null}>
      <VietQRContent />
    </Suspense>
  );
}
