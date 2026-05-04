"use client";

import Link from "next/link";
import React from "react";

export type AccountSection = "info" | "address" | "orders";

const NAV_ITEMS: Array<{
    key: AccountSection;
    href: string;
    label: string;
    icon: string;
}> = [
        { key: "info", href: "/account/info", label: "Thông tin", icon: "fa-user" },
        { key: "address", href: "/account/address", label: "Địa chỉ", icon: "fa-location-dot" },
        { key: "orders", href: "/account/orders", label: "Đơn hàng", icon: "fa-box" },
    ];

function AccountNavMobile({ active }: { active: AccountSection }) {
    return (
        <div className="lg:hidden mb-6">
            <div className="border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 text-white bg-[linear-gradient(90deg,#003366_0%,#0b3a66_50%,#33B1FA_130%)]">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center">
                            <i className="fa-solid fa-user-circle text-2xl" />
                        </div>
                        <div className="leading-tight">
                            <p className="text-[12px] opacity-90">Tài khoản của tôi</p>
                            <p className="font-extrabold tracking-wide">Quản lý thông tin &amp; theo dõi đơn</p>
                        </div>
                    </div>
                </div>

                <div className="px-3 py-3">
                    <div
                        className="
              flex gap-2 overflow-x-auto pb-1
              [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
            "
                    >
                        {NAV_ITEMS.map((it) => {
                            const isActive = it.key === active;
                            return (
                                <Link
                                    key={it.href}
                                    href={it.href}
                                    className={
                                        "shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-extrabold transition " +
                                        (isActive
                                            ? "bg-[#003366] text-white border-[#003366] shadow"
                                            : "bg-white text-[#003366] border-gray-200 hover:bg-gray-50")
                                    }
                                >
                                    <i className={"fa-solid " + it.icon} />
                                    {it.label}
                                </Link>
                            );
                        })}
                    </div>

                    <p className="mt-2 text-xs text-gray-500">Tip: Vuốt ngang để xem thêm mục.</p>
                </div>
            </div>
        </div>
    );
}

function AccountSidebarDesktop({ active }: { active: AccountSection }) {
    const itemClass = (isActive: boolean) =>
        isActive
            ? "flex items-center gap-3 px-4 py-3 rounded-xl bg-[#003366] text-white font-bold hover:bg-[#002244] transition"
            : "flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-white text-gray-700 font-semibold hover:bg-gray-50 hover:text-[#003366] transition";

    const iconClass = (isActive: boolean) => (isActive ? "" : "text-[#003366]");

    return (
        <aside className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <div className="sticky top-28 border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-[#003366] font-extrabold uppercase flex items-center gap-2">
                        <i className="fa-solid fa-user-circle text-[#33B1FA]"></i>
                        Tài khoản của tôi
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">Quản lý thông tin và đơn hàng.</p>
                </div>

                <ul className="p-3 space-y-2 text-sm">
                    <li>
                        <Link className={itemClass(active === "info")} href="/account/info">
                            <i className={"fa-solid fa-user " + iconClass(active === "info")}></i>
                            Thông tin cá nhân
                        </Link>
                    </li>

                    <li>
                        <Link className={itemClass(active === "address")} href="/account/address">
                            <i className={"fa-solid fa-location-dot " + iconClass(active === "address")}></i>
                            Địa chỉ giao hàng
                        </Link>
                    </li>

                    <li>
                        <Link className={itemClass(active === "orders")} href="/account/orders">
                            <i className={"fa-solid fa-box " + iconClass(active === "orders")}></i>
                            Đơn hàng của tôi
                        </Link>
                    </li>
                </ul>
            </div>
        </aside>
    );
}

export function AccountShell({
    active,
    children,
}: {
    active: AccountSection;
    children: React.ReactNode;
}) {
    return (
        <>
            <AccountNavMobile active={active} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <AccountSidebarDesktop active={active} />

                <div className="lg:col-span-8 xl:col-span-9">{children}</div>
            </div>
        </>
    );
}
