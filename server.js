const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8888;
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.svg': 'application/image/svg+xml'
};

const server = http.createServer((request, response) => {
  console.log('request ', request.url);

  let filePath = `.${request.url}`;
  if (filePath.endsWith('/')) {
    filePath = `${filePath}index.html`;
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    console.info(filePath)
    console.info(content)
    if (error) {
      if (error.code == 'ENOENT') {
        response.writeHead(404, { 'Content-Type': contentType });
        response.end('Not Found');
      } else {
        response.writeHead(500);
        response.end(`Sorry, check with the site admin for error: ${error.code}`);
      }
      return;
    }

    response.writeHead(200, { 'Content-Type': contentType });
    response.end(content, 'utf-8');
  });
});

server.on('listening', () => {
  console.log(`Server running at http://127.0.0.1:${PORT}/`);
});

server.on('error', (error) => {
  throw error;
});
  
server.listen(PORT);
