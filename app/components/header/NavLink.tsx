import Link from "next/link";

export function NavLink({
    href,
    label,
    onClick,
    drawer = false,
    pathname,
}: {
    href: string;
    label: string;
    onClick?: () => void;
    drawer?: boolean;
    pathname: string;
}) {
    const isActive = href !== "#" && !href.includes("#") && pathname === href;

    const base =
        "group relative py-1 text-[20px] font-bold uppercase tracking-tight transition-all duration-200 ";
    const color = isActive ? "text-[#33B1FA]" : "text-[#003366] hover:text-[#33B1FA]";
    const drawerBox = drawer ? "block w-full rounded-xl px-3 py-3 hover:bg-gray-50" : "";
    const cls = base + color + " " + drawerBox;

    if (href === "#" || href.startsWith("#")) {
        return (
            <a href={href} className={cls} onClick={onClick}>
                {label}
                {!drawer && (
                    <span
                        className={
                            "absolute bottom-0.5 left-0 h-[3px] bg-[#33B1FA] transition-all duration-300 " +
                            (isActive ? "w-full" : "w-0 group-hover:w-full")
                        }
                    />
                )}
            </a>
        );
    }

    return (
        <Link href={href} className={cls} onClick={onClick}>
            {label}
            {!drawer && (
                <span
                    className={
                        "absolute bottom-0.5 left-0 h-[3px] bg-[#33B1FA] transition-all duration-300 " +
                        (isActive ? "w-full" : "w-0 group-hover:w-full")
                    }
                />
            )}
        </Link>
    );
}
