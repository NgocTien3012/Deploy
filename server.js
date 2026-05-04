const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
// cPanel (Phusion Passenger) sẽ tự động gán cổng vào process.env.PORT
const port = process.env.PORT || 3000;

// Khởi tạo ứng dụng Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Parse URL để xử lý các tham số query
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Lỗi khi xử lý request:', req.url, err);
      res.statusCode = 500;
      res.end('Lỗi máy chủ nội bộ (Internal Server Error)');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> App đang chạy trên cổng ${port}`);
    });
});
