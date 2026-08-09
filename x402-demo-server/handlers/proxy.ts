import { Context } from 'hono';

/**
 * Generic Reverse Proxy Handler
 * Forwards requests to the Core API Microservice.
 * This handler is only executed AFTER the x402 middleware verifies payment.
 */
export const handleProxyRequest = (targetUrl: string) => {
  return async (c: Context) => {
    try {
      console.log(`[PROXY] Forwarding paid request to: ${targetUrl}`);

      // Forward headers (excluding host and connection headers)
      const headers = new Headers();
      c.req.raw.headers.forEach((value, key) => {
        if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
          headers.set(key, value);
        }
      });

      // Prepare fetch options
      const options: RequestInit = {
        method: c.req.method,
        headers,
      };

      // Forward body if applicable
      if (['POST', 'PUT', 'PATCH'].includes(c.req.method)) {
        // Clone the request so we can read the body
        const reqClone = c.req.raw.clone();
        options.body = await reqClone.blob();
      }

      // Execute proxy request
      const response = await fetch(targetUrl, options);

      // Read response data
      const contentType = response.headers.get('content-type') || '';
      let responseData;
      
      try {
        if (contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
          // Try to coerce it to JSON if it failed but we want an error object
          if (!response.ok) {
            responseData = { error: responseData };
          }
        }
      } catch (parseError) {
        responseData = { error: 'Failed to parse microservice response.' };
      }

      if (!response.ok) {
        console.warn(`[PROXY] Microservice returned ${response.status} error.`);
        return c.json(responseData, response.status as any);
      }
      
      return contentType.includes('application/json') 
        ? c.json(responseData, response.status as any)
        : c.text(responseData, response.status as any);
      
    } catch (error) {
      console.error(`[PROXY] Error forwarding request to ${targetUrl}:`, error);
      return c.json({ error: error instanceof Error ? error.message : 'Internal Gateway Error' }, 502);
    }
  };
};
