const http = require('http');

console.log("Tentando contactar backend para fechar...");
const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api',
  method: 'GET'
}, (res) => {
  console.log('Status:', res.statusCode);
  res.on('data', d => console.log(d.toString()));
});

req.on('error', console.error);
req.end();
