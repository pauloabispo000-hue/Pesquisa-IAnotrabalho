// Prévia local apenas. O recebimento das respostas é executado pelo Apps Script.
import http from'node:http';import{readFileSync}from'node:fs';import{fileURLToPath}from'node:url';
const allowed={'/':'index.html','/index.html':'index.html','/styles.css':'styles.css','/app.js':'app.js','/integration.js':'integration.js'};
const n=process.argv.indexOf('--port');const port=Number(process.env.PORT||(n>=0?process.argv[n+1]:4173));
http.createServer((req,res)=>{const file=allowed[new URL(req.url,'http://localhost').pathname];if(!file){res.writeHead(404);res.end('Não encontrado');return;}res.writeHead(200,{'Content-Type':file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8'});res.end(readFileSync(fileURLToPath(new URL(file,import.meta.url))));}).listen(port,'0.0.0.0');
