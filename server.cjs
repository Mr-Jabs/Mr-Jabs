const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.pdf': 'application/pdf', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
http.createServer((req, res) => {
  const file = path.resolve(root, '.' + decodeURIComponent(req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0]));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404).end('Not found'); return; } res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }); res.end(data); });
}).listen(Number(process.env.PORT) || 3000, '127.0.0.1', () => console.log('Portfolio: http://localhost:' + (process.env.PORT || 3000)));
