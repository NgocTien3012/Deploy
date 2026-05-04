import Link from "next/link";

function QuickLink({
    href,
    title,
    desc,
    icon,
}: {
    href: string;
    title: string;
    desc: string;
    icon: string;
}) {
    return (
        <Link
            href={href}
            className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-[#33B1FA]/40 transition"
        >
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#003366]/10 text-[#003366] flex items-center justify-center">
                    <i className={`fa-solid ${icon}`} />
                </div>
                <div className="min-w-0">
                    <p className="font-extrabold text-[#003366] group-hover:text-[#33B1FA] transition line-clamp-1">
                        {title}
                    </p>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">{desc}</p>
                </div>
            </div>
        </Link>
    );
}

export default function NotFound() {
    return (
        <main className="bg-white">
            <section className="max-w-[1604px] mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* Left */}
                    <div className="lg:col-span-7">
                        <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-extrabold text-[#003366]">
                            <span className="inline-flex w-2 h-2 rounded-full bg-[#33B1FA]" />
                            404 • Không tìm thấy trang
                        </div>

                        <h1 className="mt-4 text-[34px] sm:text-[44px] leading-tight font-black text-[#003366]">
                            Ối… trang này không tồn tại
                        </h1>

                        <p className="mt-3 text-gray-600 text-base sm:text-lg leading-relaxed max-w-[58ch]">
                            Có thể đường dẫn bị sai hoặc trang đã được di chuyển. Ní thử quay về trang chủ
                            hoặc chọn một mục bên dưới nha.
                        </p>

                        {/* Actions */}
                        <div className="mt-6 flex flex-col sm:flex-row gap-3">
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center rounded-2xl bg-[#003366] px-6 py-3 font-extrabold text-white hover:bg-[#002244] transition"
                            >
                                <i className="fa-solid fa-house mr-2" />
                                Về trang chủ
                            </Link>

                            <Link
                                href="/products"
                                className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-6 py-3 font-extrabold text-[#003366] hover:border-[#33B1FA] hover:text-[#33B1FA] hover:bg-gray-50 transition"
                            >
                                <i className="fa-solid fa-bag-shopping mr-2" />
                                Xem sản phẩm
                            </Link>
                        </div>

                        {/* Search mock (tĩnh) */}
                        <div className="mt-6 rounded-3xl border border-gray-200 bg-white shadow-sm p-5 sm:p-6">
                            <p className="font-extrabold text-[#003366] flex items-center gap-2">
                                <i className="fa-solid fa-magnifying-glass text-[#33B1FA]" />
                                Tìm nhanh (UI minh hoạ)
                            </p>
                            <div className="mt-4 flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        placeholder="Nhập từ khoá…"
                                        className="w-full h-12 pl-11 pr-4 rounded-2xl border border-gray-200 outline-none focus:border-[#33B1FA]"
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="h-12 rounded-2xl bg-[#003366] px-6 font-extrabold text-white hover:bg-[#002244] transition"
                                >
                                    Tìm
                                </button>
                            </div>

                            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <QuickLink
                                    href="/news"
                                    title="Tin tức"
                                    desc="Xem bài viết, xu hướng và khuyến mãi mới."
                                    icon="fa-newspaper"
                                />
                                <QuickLink
                                    href="/promotions"
                                    title="Khuyến mãi"
                                    desc="Ưu đãi đang diễn ra và combo giảm giá."
                                    icon="fa-tags"
                                />
                                <QuickLink
                                    href="/account/orders"
                                    title="Đơn hàng của tôi"
                                    desc="Theo dõi trạng thái đơn hàng."
                                    icon="fa-receipt"
                                />
                                <QuickLink
                                    href="/products"
                                    title="Danh sách sản phẩm"
                                    desc="Khám phá sáp, dầu gội và phụ kiện."
                                    icon="fa-grid-2"
                                />
                            </div>

                            <p className="mt-4 text-xs text-gray-500">
                                * Đây là trang tĩnh minh hoạ (không xử lý tìm kiếm thật).
                            </p>
                        </div>
                    </div>

                    {/* Right - Illustration */}
                    <div className="lg:col-span-5">
                        <div className="rounded-[32px] border border-gray-200 bg-gradient-to-br from-[#003366] to-[#33B1FA] shadow-lg overflow-hidden">
                            <div className="p-7 sm:p-9 text-white">
                                <p className="text-white/90 font-bold">Oops!</p>
                                <div className="mt-2 flex items-end gap-3">
                                    <span className="text-[72px] sm:text-[86px] font-black leading-none tracking-tight">
                                        404
                                    </span>
                                    <span className="text-white/90 font-extrabold mb-3">
                                        NOT FOUND
                                    </span>
                                </div>

                                <p className="mt-4 text-white/90 leading-relaxed">
                                    Đường dẫn không hợp lệ hoặc trang đã bị xoá.
                                    Hãy chọn một trong các nút bên dưới để tiếp tục nhé.
                                </p>

                                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Link
                                        href="/"
                                        className="inline-flex items-center justify-center rounded-2xl bg-white text-[#003366] px-5 py-3 font-extrabold hover:bg-white/90 transition"
                                    >
                                        <i className="fa-solid fa-house mr-2" />
                                        Home
                                    </Link>
                                    <Link
                                        href="/products"
                                        className="inline-flex items-center justify-center rounded-2xl border border-white/40 bg-white/10 px-5 py-3 font-extrabold text-white hover:bg-white/15 transition"
                                    >
                                        <i className="fa-solid fa-bag-shopping mr-2" />
                                        Products
                                    </Link>
                                </div>
                            </div>

                            {/* bottom wave */}
                            <svg viewBox="0 0 1440 180" className="block w-full">
                                <path
                                    fill="rgba(255,255,255,0.18)"
                                    d="M0,96L60,80C120,64,240,32,360,37.3C480,43,600,85,720,101.3C840,117,960,107,1080,90.7C1200,75,1320,53,1380,42.7L1440,32L1440,180L1380,180C1320,180,1200,180,1080,180C960,180,840,180,720,180C600,180,480,180,360,180C240,180,120,180,60,180L0,180Z"
                                />
                            </svg>
                        </div>

                        <div className="mt-4 text-center text-sm text-gray-500">
                            Nếu ní chắc chắn link đúng mà vẫn lỗi, có thể trang đã đổi route.
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
