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
    if(targetUrl.includes("get_account_info")){
      return res.status(200).json({
  "user_info": {
    "username": "aliezzat",
    "password": "36622511",
    "message": "",
    "auth": 1,
    "status": "Active",
    "exp_date": "1785793040",
    "is_trial": "0",
    "active_cons": "0",
    "created_at": "1722708363",
    "max_connections": "1",
    "allowed_output_formats": [
      "m3u8",
      "ts",
      "rtmp"
    ]
  },
  "server_info": {
    "url": "lionzhd.com",
    "port": "2095",
    "https_port": "2096",
    "server_protocol": "http",
    "rtmp_port": "25462",
    "timezone": "Asia/Kuwait",
    "timestamp_now": 1757376544,
    "time_now": "2025-09-09 03:09:04",
    "process": true
  }
}); 
    }
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
