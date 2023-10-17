const http = require('http');
const path = require("path");
const fs = require('fs');

const HOST = 'localhost';
const PORT = 8000;

const server = http.createServer((req, res) => {

  const slug = req.url === "/" ? "index.html" : req.url;


  fs.readFile(path.join(__dirname, slug), (err, data) => {
    res.setHeader('Content-Type', 'text/html');
    if (err) {
      res.statusCode = 404;
      res.end('<h1>404 not found</h1>');
    } else {
      res.statusCode = 200;
      res.write(data);
      res.end();
    }
  });

});

server.listen(PORT, HOST, () => console.log(`Server running at http://${HOST}:${PORT}/`));
