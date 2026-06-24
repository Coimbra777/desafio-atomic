const http = require('node:http');

const mode = process.argv[2] || 'development';
const port = Number(process.env.PORT || process.env.FRONTEND_PORT || 3000);
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>TaskFlow</title>
    <style>
      body {
        margin: 0;
        font-family: sans-serif;
        background: #f3f4f6;
        color: #111827;
      }
      main {
        max-width: 720px;
        margin: 64px auto;
        padding: 32px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 18px 45px rgba(17, 24, 39, 0.12);
      }
      code {
        background: #e5e7eb;
        padding: 2px 6px;
        border-radius: 6px;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>TaskFlow frontend scaffold</h1>
      <p>Etapa 1 concluida. A base Next.js sera criada nas proximas etapas.</p>
      <p>Modo atual: <code>${mode}</code></p>
      <p>API esperada: <code>${apiUrl}</code></p>
    </main>
  </body>
</html>`;

const server = http.createServer((_request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  response.end(html);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`[taskflow-frontend] Placeholder server listening on port ${port} (${mode}).`);
});

