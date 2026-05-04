export default function SiteFooter() {
 return (
    <footer className="bg-[#002d58] pt-12 pb-8 text-[13px] text-white border-t border-white/10 md:pt-16">
      <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-6">
        <div className="mb-10 grid grid-cols-1 gap-8  w-[70%] mx-auto sm:grid-cols-2 lg:grid-cols-4 lg:gap-10 md:mb-12">
          <div className="flex flex-col items-center text-center sm:items-start sm:text-left lg:items-center lg:text-center">
            <div className="mb-4 flex flex-col items-center sm:items-start lg:items-center">
              <div className="mb-2">
                <span className="material-symbols-outlined !text-[64px] leading-none font-light text-[#33B1FA] ">
                  content_cut
                </span>
              </div>
              <h2 className="text-2xl font-black uppercase tracking-[0.2em]">25ZONE</h2>
            </div>
            <p className="text-xs italic text-gray-400">Hệ thống tóc nam hàng đầu</p>
          </div>

          <div>
            <h3 className="mb-5 text-base font-bold uppercase tracking-wider text-white md:mb-6">
              Về chúng tôi
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li>
                <a className="transition-colors duration-300 hover:text-yellow-400" href="#">
                  Về 25Zone
                </a>
              </li>
              <li>
                <a className="transition-colors duration-300 hover:text-yellow-400" href="#">
                  25Zone Shop
                </a>
              </li>
              <li>
                <a className="transition-colors duration-300 hover:text-yellow-400" href="#">
                  Học cắt tóc
                </a>
              </li>
              <li>
                <a className="transition-colors duration-300 hover:text-yellow-400" href="#">
                  Tìm 25Zone gần nhất
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-base font-bold uppercase tracking-wider text-white md:mb-6">
              Hỗ trợ
            </h3>
            <div className="space-y-3 text-gray-300">
              <p className="font-bold">
                Hotline:{" "}
                <span className="cursor-pointer transition-colors hover:text-yellow-400">
                  1900.27.27.03
                </span>
              </p>
              <p className="cursor-pointer transition-colors hover:text-yellow-400">
                Liên hệ hợp tác: 090.xxx.xxxx
              </p>
              <p className="cursor-pointer transition-colors hover:text-yellow-400">
                Liên hệ nhượng quyền
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-5 text-base font-bold uppercase tracking-wider text-white md:mb-6">
              Chính sách
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li>
                <p>Giờ phục vụ: Thứ 2-Chủ Nhật: 8h00 - 21h00</p>
              </li>
              <li>
                <a className="transition-colors duration-300 hover:text-yellow-400" href="#">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a className="transition-colors duration-300 hover:text-yellow-400" href="#">
                  Điều khoản sử dụng
                </a>
              </li>
            </ul>
          </div>

          {/* <div>
            <h3 className="mb-5 text-base font-bold uppercase tracking-wider text-white md:mb-6">
              Kết nối với chúng tôi
            </h3>
            <div className="flex flex-wrap gap-3 mb-6">
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 hover:bg-[#1877F2] hover:scale-110">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 hover:bg-black hover:scale-110">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61.01 3.91.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 hover:bg-gradient-to-br hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:scale-110">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 hover:bg-[#FF0000] hover:scale-110">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              Theo dõi 25Zone trên mạng xã hội để cập nhật xu hướng tóc mới nhất và nhận ưu đãi độc quyền.
            </p>
          </div> */}
        </div>

        <div className="border-t border-white/5 pt-6 text-center md:pt-8">
          <p className="mx-auto max-w-[1100px] text-[13px] leading-relaxed text-gray-500">
            © 2015 Công ty Cổ Phần TMDV 30Shine. Địa chỉ: 82 Trần Đại Nghĩa, Phường Đồng Tâm,
            Quận Hai Bà Trưng, HN. Số GCNĐKDN: 0107467693. Ngày cấp: 08/06/2016.
          </p>
        </div>
      </div>
    </footer>
  );
}
