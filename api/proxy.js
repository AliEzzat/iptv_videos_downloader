export default async function handler(req, res) {
  // Get the real target URL from the ?url=... query param
  const targetUrl = decodeURIComponent(req.query.url);
  const fetchOptions = {
    method: req.method,
    headers: { ...req.headers, host: undefined },
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
  };
  try {
    const response = await fetch(targetUrl, fetchOptions);
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    const data = await response.arrayBuffer();
    res.send(Buffer.from(data));
  } catch (error) {
    res.status(500).json({ error: 'Proxy error', details: error.message });
  }
}