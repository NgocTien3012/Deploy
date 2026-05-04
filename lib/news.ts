const NEWS_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.25zone.io.vn";

type MessagePayload = {
  message?: string;
};

export type ShopNewsCategory = {
  Id_category_news: number;
  Name_category_news: string;
};

export type ShopNewsItem = {
  Id_news: number;
  Title: string;
  Slug: string;
  Content: string;
  Thumbnail: string;
  Status?: number;
  Id_category_news: number;
  Name_category_news?: string;
};

export type ShopNewsListResponse = {
  items: ShopNewsItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
};

export type ShopNewsDetailResponse = {
  item: ShopNewsItem;
  related: Array<
    Pick<ShopNewsItem, "Id_news" | "Title" | "Slug" | "Thumbnail" | "Id_category_news">
  >;
};

type ListNewsParams = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
};

const buildUrl = (path: string) => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${NEWS_API_BASE_URL}${normalized}`;
};

const readJson = async <T,>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const getMessage = (payload: unknown, fallback: string) => {
  if (payload && typeof payload === "object" && "message" in payload) {
    const value = (payload as MessagePayload).message;
    if (typeof value === "string" && value.trim()) return value;
  }
  return fallback;
};

export const normalizeNewsImage = (thumbnail?: string | null) => {
  if (!thumbnail) return "/img/news-1.jpg";
  if (/^https?:\/\//i.test(thumbnail)) return thumbnail;
  return buildUrl(thumbnail);
};

export const getNewsExcerpt = (content: string, max = 150) => {
  const text = String(content || "").trim().replace(/\s+/g, " ");
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}...`;
};

export const fetchNewsCategories = async (): Promise<ShopNewsCategory[]> => {
  const response = await fetch(buildUrl("/api/news/categories"), {
    cache: "no-store",
  });
  const payload = await readJson<ShopNewsCategory[] | MessagePayload>(response);

  if (!response.ok) {
    throw new Error(getMessage(payload, "Không thể tải loại tin."));
  }

  return Array.isArray(payload) ? payload : [];
};

export const fetchNewsList = async (
  params: ListNewsParams = {}
): Promise<ShopNewsListResponse> => {
  const query = new URLSearchParams();
  query.set("page", String(params.page || 1));
  query.set("limit", String(params.limit || 9));
  if (params.search) query.set("search", params.search.trim());
  if (params.categoryId && params.categoryId > 0) {
    query.set("categoryId", String(params.categoryId));
  }

  const response = await fetch(buildUrl(`/api/news?${query.toString()}`), {
    cache: "no-store",
  });
  const payload = await readJson<ShopNewsListResponse | MessagePayload>(response);

  if (!response.ok) {
    throw new Error(getMessage(payload, "Không thể tải danh sách tin tức."));
  }

  if (
    payload &&
    typeof payload === "object" &&
    "items" in payload &&
    "pagination" in payload
  ) {
    return payload as ShopNewsListResponse;
  }

  return {
    items: [],
    pagination: {
      page: 1,
      limit: params.limit || 9,
      total: 0,
    },
  };
};

export const fetchNewsDetail = async (
  slug: string
): Promise<ShopNewsDetailResponse | null> => {
  const response = await fetch(buildUrl(`/api/news/${encodeURIComponent(slug)}`), {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  const payload = await readJson<ShopNewsDetailResponse | MessagePayload>(response);

  if (!response.ok) {
    throw new Error(getMessage(payload, "Không thể tải chi tiết tin tức."));
  }

  if (
    payload &&
    typeof payload === "object" &&
    "item" in payload &&
    "related" in payload
  ) {
    return payload as ShopNewsDetailResponse;
  }

  return null;
};
