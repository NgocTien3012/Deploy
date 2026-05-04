import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchNewsDetail,
  getNewsExcerpt,
  normalizeNewsImage,
  type ShopNewsItem,
} from "@/lib/news";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const splitParagraphs = (content: string) => {
  return String(content || "")
    .split(/\n+/)
    .map((text) => text.trim())
    .filter(Boolean);
};

function RelatedCard({ item }: { item: Pick<ShopNewsItem, "Id_news" | "Title" | "Slug" | "Thumbnail"> }) {
  return (
    <Link
      href={`/news/${encodeURIComponent(item.Slug)}`}
      className="block rounded-2xl border border-gray-100 p-4 transition hover:border-[#33B1FA] hover:shadow-sm"
    >
      <div className="flex items-start gap-3">
        <img
          src={normalizeNewsImage(item.Thumbnail)}
          alt={item.Title}
          className="h-14 w-20 rounded-lg object-cover"
        />
        <div className="min-w-0">
          <p className="line-clamp-2 font-extrabold text-[#003366]">{item.Title}</p>
          <p className="mt-1 text-xs text-gray-500">Bài #{item.Id_news}</p>
        </div>
      </div>
    </Link>
  );
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await fetchNewsDetail(slug).catch(() => null);

  if (!data?.item) {
    notFound();
  }

  const paragraphs = splitParagraphs(data.item.Content);
  const contentParagraphs = paragraphs.length ? paragraphs : [getNewsExcerpt(data.item.Content, 800)];

  return (
    <main className="bg-white">
      <article className="mx-auto max-w-[1604px] px-4 py-7 sm:px-6 sm:py-10 lg:px-6">
        <div className="text-sm text-gray-500">
          <Link href="/" className="hover:text-[#33B1FA]">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <Link href="/news" className="hover:text-[#33B1FA]">
            Tin tức
          </Link>
          <span className="mx-2">/</span>
          <span className="line-clamp-1 text-gray-700">{data.item.Title}</span>
        </div>

        <h1 className="mt-4 text-[26px] font-black leading-tight text-[#003366] sm:text-[36px]">
          {data.item.Title}
        </h1>

        <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
          <span className="rounded-full border border-gray-100 bg-gray-50 px-3 py-1">
            {data.item.Name_category_news || "Tin tức"}
          </span>
          <span className="rounded-full border border-gray-100 bg-gray-50 px-3 py-1">
            Mã bài #{data.item.Id_news}
          </span>
          <span className="rounded-full border border-gray-100 bg-gray-50 px-3 py-1">
            25Zone Editor
          </span>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-gray-100 shadow-sm">
          <img
            src={normalizeNewsImage(data.item.Thumbnail)}
            alt={data.item.Title}
            className="h-[240px] w-full object-cover sm:h-[420px]"
          />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            {contentParagraphs.map((paragraph, index) => (
              <p key={`${data.item.Id_news}-${index}`} className="text-[15px] leading-relaxed text-gray-700 sm:text-[16px]">
                {paragraph}
              </p>
            ))}

            <div className="mt-6 rounded-3xl border border-gray-100 bg-gray-50 p-6">
              <p className="font-extrabold text-[#003366]">Bạn muốn xem thêm?</p>
              <p className="mt-1 text-sm text-gray-600">
                Cập nhật thêm các bài viết mới nhất tại trang tin tức của 25Zone.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/news"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[#003366] px-6 text-sm font-extrabold text-white transition-colors hover:bg-[#33B1FA]"
                >
                  Quay lại Tin tức
                </Link>
                <Link
                  href="/"
                  className="inline-flex h-11 items-center justify-center rounded-full border-2 border-[#003366] px-6 text-sm font-extrabold text-[#003366] transition-colors hover:border-[#33B1FA] hover:bg-[#33B1FA] hover:text-white"
                >
                  Về trang chủ
                </Link>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="space-y-6 lg:sticky lg:top-[110px]">
              <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-black text-[#003366]">Bài liên quan</h3>
                <div className="mt-4 space-y-3">
                  {data.related.length === 0 && (
                    <p className="text-sm text-gray-500">Chưa có bài liên quan.</p>
                  )}

                  {data.related.map((item) => (
                    <RelatedCard key={item.Id_news} item={item} />
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}
