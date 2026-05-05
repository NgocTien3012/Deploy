<<<<<<< HEAD
# 25zone-next (App Router + TypeScript) — “app hết, components không có _”

Bản này đúng yêu cầu của bạn:
- **Không dùng `_components`** nữa.
- Components chung đặt tại: `app/components/`
- Pages nằm trong `app/(site)/...` (URL vẫn y nguyên)

## Cấu trúc thư mục
```
app/
  layout.tsx              # Root layout: head/font/global css
  globals.css
  components/
    SiteHeader.tsx
    SiteFooter.tsx
  (site)/
    layout.tsx            # Bọc Header/Footer cho toàn site
    page.tsx              # Home (25zoneshop.html)
    products/
      page.tsx            # product.html
      [id]/
        page.tsx          # detail.html
    cart/
      page.tsx            # cart.html
    checkout/
      page.tsx            # checkout.html
    account/
      info/page.tsx       # thongtinusser.html
      address/page.tsx    # diachi.html
      orders/page.tsx     # donhang.html
public/
  img/                    # Bạn tự copy từ dự án cũ
```

## Chạy project
```bash
npm install
npm run dev
```

## Assets (ảnh)
Copy folder `img/` cũ vào: `public/img/`

Lưu ý: ảnh có dấu cách (vd: `image 2.png`, `banner shop.png`) đã encode `%20` trong code.
=======
# Deploy
Wiz
>>>>>>> 5c89f1b1e668ec0549defd7e49c35bf90aa6603f
