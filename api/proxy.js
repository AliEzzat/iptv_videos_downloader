export default async function handler(req, res) {
  // Remove `/api/proxy` from the path and append the rest to the target URL
  const targetUrl = req.url.replace(/^\/api\/proxy/, 'http://').replace('player_api_php', 'player_api.php');
  // Forward the method, headers, and body
  console.log(targetUrl);
  const fetchOptions = {
    method: req.method,
    headers: { ...req.headers, host: undefined }, // Remove host header for CORS
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
  };
  try {
    const response = await fetch(targetUrl, fetchOptions);
    // Copy status and headers
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    // Pipe the response body
    const data = await response.arrayBuffer();
    res.send(Buffer.from(data));
  } catch (error) {
    res.status(500).json({ error: 'Proxy error', details: error.message });
  }
}