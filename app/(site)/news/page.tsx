"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  fetchNewsCategories,
  fetchNewsList,
  getNewsExcerpt,
  normalizeNewsImage,
  type ShopNewsCategory,
  type ShopNewsItem,
} from "@/lib/news";

const PAGE_SIZE = 9;

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function NewsCard({ item }: { item: ShopNewsItem }) {
  return (
    <Link
      href={`/news/${encodeURIComponent(item.Slug)}`}
      className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative">
        <img
          src={normalizeNewsImage(item.Thumbnail)}
          alt={item.Title}
          className="h-52 w-full object-cover"
          loading="lazy"
        />
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#003366]">
          {item.Name_category_news || "Tin tức"}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="line-clamp-2 text-[16px] font-extrabold leading-snug text-[#003366] transition-colors group-hover:text-[#33B1FA]">
          {item.Title}
        </h3>

        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-600">
          {getNewsExcerpt(item.Content, 135)}
        </p>

        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>Bài #{item.Id_news}</span>
          <span className="font-semibold text-[#003366] transition-colors group-hover:text-[#33B1FA]">
            Đọc ngay →
          </span>
        </div>
      </div>
    </Link>
  );
}

function FeaturedCard({ item }: { item: ShopNewsItem }) {
  return (
    <Link
      href={`/news/${encodeURIComponent(item.Slug)}`}
      className="group grid overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md md:grid-cols-2"
    >
      <div className="relative">
        <img
          src={normalizeNewsImage(item.Thumbnail)}
          alt={item.Title}
          className="h-64 w-full object-cover md:h-full"
        />
        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-[#003366]">
          {item.Name_category_news || "Tin nổi bật"}
        </div>
      </div>

      <div className="flex flex-col justify-center p-6">
        <h2 className="text-[22px] font-black leading-tight text-[#003366] transition-colors group-hover:text-[#33B1FA]">
          {item.Title}
        </h2>

        <p className="mt-3 line-clamp-4 leading-relaxed text-gray-600">
          {getNewsExcerpt(item.Content, 200)}
        </p>

        <div className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#003366] transition-colors group-hover:text-[#33B1FA]">
          Đọc chi tiết
          <i className="fa-solid fa-arrow-right text-xs"></i>
        </div>
      </div>
    </Link>
  );
}

export default function NewsPage() {
  const [categories, setCategories] = useState<ShopNewsCategory[]>([]);
  const [items, setItems] = useState<ShopNewsItem[]>([]);
  const [latestItems, setLatestItems] = useState<ShopNewsItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<"all" | number>("all");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      try {
        const [categoryRows, latestRows] = await Promise.all([
          fetchNewsCategories(),
          fetchNewsList({ page: 1, limit: 5 }),
        ]);

        if (!active) return;
        setCategories(categoryRows);
        setLatestItems(latestRows.items);
      } catch (error) {
        if (!active) return;
        setErrorMessage(
          error instanceof Error ? error.message : "Không thể tải dữ liệu tin tức."
        );
      }
    };

    loadCategories();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadNews = async () => {
      const appendMode = page > 1;
      if (appendMode) setLoadingMore(true);
      else setLoading(true);

      setErrorMessage("");

      try {
        const response = await fetchNewsList({
          page,
          limit: PAGE_SIZE,
          search: searchKeyword || undefined,
          categoryId: activeCategoryId === "all" ? undefined : activeCategoryId,
        });

        if (!active) return;

        setTotal(response.pagination.total);
        setItems((prev) => {
          if (!appendMode) return response.items;

          const merged = [...prev];
          response.items.forEach((item) => {
            if (!merged.some((current) => current.Id_news === item.Id_news)) {
              merged.push(item);
            }
          });
          return merged;
        });
      } catch (error) {
        if (!active) return;
        setErrorMessage(
          error instanceof Error ? error.message : "Không thể tải danh sách tin tức."
        );
      } finally {
        if (!active) return;
        setLoading(false);
        setLoadingMore(false);
      }
    };

    loadNews();
    return () => {
      active = false;
    };
  }, [page, activeCategoryId, searchKeyword]);

  const featuredItem = items[0] || null;
  const remainingItems = useMemo(() => items.slice(1), [items]);
  const hasMore = items.length < total;

  const onSubmitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearchKeyword(searchInput.trim());
  };

  const onChangeCategory = (categoryId: "all" | number) => {
    setActiveCategoryId(categoryId);
    setPage(1);
  };

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-[1604px] px-4 py-7 sm:px-6 sm:py-10 lg:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-[26px] font-black tracking-tight text-[#003366] sm:text-[32px]">
              Tin tức
            </h1>
            <p className="mt-1 text-gray-600">Tin mới nhất từ 25Zone Shop.</p>
          </div>

          <form onSubmit={onSubmitSearch} className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Tìm bài viết..."
                className="h-11 w-full rounded-2xl border border-gray-200 pl-11 pr-4 outline-none focus:border-[#33B1FA] sm:w-[320px]"
              />
            </div>
            <button
              type="submit"
              className="h-11 rounded-2xl bg-[#003366] px-5 text-sm font-extrabold text-white transition-colors hover:bg-[#33B1FA]"
            >
              Tìm kiếm
            </button>
          </form>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => onChangeCategory("all")}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-extrabold transition-colors",
              activeCategoryId === "all"
                ? "border-[#003366] bg-[#003366] text-white"
                : "border-gray-200 bg-white text-[#003366] hover:border-[#33B1FA] hover:text-[#33B1FA]"
            )}
          >
            Tất cả
          </button>

          {categories.map((category) => {
            const active = activeCategoryId === category.Id_category_news;
            return (
              <button
                key={category.Id_category_news}
                type="button"
                onClick={() => onChangeCategory(category.Id_category_news)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-extrabold transition-colors",
                  active
                    ? "border-[#003366] bg-[#003366] text-white"
                    : "border-gray-200 bg-white text-[#003366] hover:border-[#33B1FA] hover:text-[#33B1FA]"
                )}
              >
                {category.Name_category_news}
              </button>
            );
          })}
        </div>

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {loading ? (
              <div className="rounded-3xl border border-gray-100 bg-white p-6">
                <p className="text-sm text-gray-500">Đang tải tin tức...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-500">
                Không có bài viết phù hợp với bộ lọc hiện tại.
              </div>
            ) : (
              <>
                {featuredItem && <FeaturedCard item={featuredItem} />}

                {remainingItems.length > 0 && (
                  <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {remainingItems.map((item) => (
                      <NewsCard key={item.Id_news} item={item} />
                    ))}
                  </div>
                )}

                {hasMore && (
                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      disabled={loadingMore}
                      onClick={() => setPage((current) => current + 1)}
                      className="h-11 rounded-full border-2 border-[#003366] px-6 text-sm font-extrabold tracking-wide text-[#003366] transition-all hover:border-[#33B1FA] hover:bg-[#33B1FA] hover:text-white disabled:opacity-60"
                    >
                      {loadingMore ? "Đang tải..." : "Xem thêm"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <aside className="lg:col-span-4">
            <div className="space-y-6 lg:sticky lg:top-[110px]">
              <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-black text-[#003366]">Danh mục</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {categories.map((item) => (
                    <button
                      key={`sidebar-${item.Id_category_news}`}
                      type="button"
                      onClick={() => onChangeCategory(item.Id_category_news)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-bold transition-colors",
                        activeCategoryId === item.Id_category_news
                          ? "border-[#003366] bg-[#003366] text-white"
                          : "border-gray-200 text-[#003366] hover:border-[#33B1FA] hover:text-[#33B1FA]"
                      )}
                    >
                      {item.Name_category_news}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-black text-[#003366]">Tin mới</h3>
                <div className="mt-4 space-y-3">
                  {latestItems.length === 0 && (
                    <p className="text-sm text-gray-500">Chưa có dữ liệu tin mới.</p>
                  )}

                  {latestItems.map((item) => (
                    <Link
                      key={`latest-${item.Id_news}`}
                      href={`/news/${encodeURIComponent(item.Slug)}`}
                      className="block rounded-2xl border border-gray-100 p-4 transition hover:border-[#33B1FA] hover:shadow-sm"
                    >
                      <p className="line-clamp-2 font-extrabold text-[#003366]">{item.Title}</p>
                      <p className="mt-2 text-xs text-gray-500">
                        {item.Name_category_news || "Tin tức"}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
