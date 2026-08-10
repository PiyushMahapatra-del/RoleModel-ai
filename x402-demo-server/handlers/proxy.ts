import { Context } from 'hono';

/**
 * Generic Reverse Proxy Handler
 * Forwards requests to the Core API Microservice.
 * This handler is only executed AFTER the x402 middleware verifies payment.
 */
export const handleProxyRequest = (targetUrl: string) => {
  return async (c: Context) => {
    try {
      // 1. Foolproof URL Construction:
      // Ensure we explicitly append the specific feature path WITH the required /api prefix
      const requestPath = c.req.path;
      let fullUrl = targetUrl;
      
      // If the targetUrl doesn't already contain the path, append it safely
      if (!fullUrl.endsWith(requestPath)) {
         // Fix: Inject /api before the request path so the Core API routes correctly
         const apiPath = requestPath.startsWith('/api') ? requestPath : `/api${requestPath}`;
         fullUrl = `${targetUrl.replace(/\/$/, '')}${apiPath}`;
      }

      console.log(`[PROXY] Incoming path: ${requestPath}`);
      console.log(`[PROXY] Forwarding paid request to: ${fullUrl}`);

      // 2. Foolproof Headers:
      // Strip headers that trigger cloud security walls or break routing
      const headers = new Headers();
      c.req.raw.headers.forEach((value, key) => {
        const keyLower = key.toLowerCase();
        if (!['host', 'connection', 'content-length', 'origin', 'referer', 'accept-encoding'].includes(keyLower)) {
          headers.set(key, value);
        }
      });

      const options: RequestInit = {
        method: c.req.method,
        headers,
      };

      // 3. Foolproof Body Handling:
      // Use arrayBuffer() instead of blob() for stable Node.js server-to-server streaming
      if (['POST', 'PUT', 'PATCH'].includes(c.req.method)) {
        const buffer = await c.req.arrayBuffer();
        options.body = buffer;
      }

      // 4. Execute Fetch
      const response = await fetch(fullUrl, options);

      const contentType = response.headers.get('content-type') || '';
      let responseData;
      
      try {
        if (contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
          if (!response.ok) {
            responseData = { error: responseData };
          }
        }
      } catch (parseError) {
        responseData = { error: 'Failed to parse microservice response.' };
      }

      if (!response.ok) {
        console.warn(`[PROXY] Core API returned ${response.status} error.`);
        return c.json(responseData, response.status as any);
      }
      
      return contentType.includes('application/json') 
        ? c.json(responseData, response.status as any)
        : c.text(responseData, response.status as any);
      
    } catch (error) {
      console.error(`[PROXY] Error forwarding request:`, error);
      return c.json({ error: 'Internal Gateway Error: Could not connect to Core API.' }, 502);
    }
  };
};