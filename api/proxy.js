// Vercel Serverless Function

const ALLOWED_HOSTS = ['lionzhd.com:8080', 'lionzhd.com:2095'];

export default async function handler(req, res) {
  const rawUrl = req.query.url;

  if (!rawUrl) {
    return res.status(400).json({ error: 'Missing "url" query param' });
  }

  let targetUrl;
  try {
    targetUrl = decodeURIComponent(rawUrl);
    const urlObj = new URL(targetUrl);
    const hostPort = `${urlObj.hostname}:${urlObj.port}`;
    if (!ALLOWED_HOSTS.includes(hostPort)) {
      return res.status(403).json({ error: { code: '403', message: 'Forbidden: Host not allowed' } });
    }
  } catch (err) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  try {
    const headers = { ...req.headers, 'user-agent': 'VercelProxy' };
    delete headers.host;

    const backendRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
    });

    res.status(backendRes.status);
    backendRes.headers.forEach((val, key) => res.setHeader(key, val));
    const buffer = await backendRes.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({
      error: {
        code: '500',
        message: 'Proxy failed',
        details: err.message || err.toString(),
      },
    });
  }
}
