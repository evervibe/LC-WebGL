#!/usr/bin/env node
import http from 'node:http';
import fs from 'fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const port = process.env.PORT ? Number(process.env.PORT) : 5174;

const routes = {
  '/items': 'items.json',
  '/npcs': 'npcs.json',
  '/quests': 'quests.json'
};

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(payload));
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    sendJson(res, 400, { error: 'Bad request' });
    return;
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS'
    });
    res.end();
    return;
  }

  const route = routes[req.url];
  if (!route) {
    sendJson(res, 404, { error: 'Not found' });
    return;
  }

  try {
    const raw = fs.readFileSync(path.join(dataDir, route));
    sendJson(res, 200, JSON.parse(raw.toString()));
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
});

server.listen(port, () => {
  console.log(`[mock-api] läuft auf http://localhost:${port}`);
});
