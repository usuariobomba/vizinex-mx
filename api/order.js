export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const API_KEY = 'skuVwANNCTIUTecoOWbUh6Ck1bSUAgJEnNb3Wvxb6';
  const API_URL = 'http://api.cpa.tl/api/lead/send';
  const OFFER_ID = '20414'; // From user request
  const STREAM_ID = 'wV6UOX80'; // From user request

  try {
    const body = req.body;
    
    // Extract IP and User Agent
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Construct data for Traffic Light API
    // Note: The API expects form-urlencoded or similar, but the examples show `http_build_query` (POST fields).
    // We will send it as form-urlencoded which is standard for this type of API.
    
    // Map incoming fields to API fields
    const apiData = new URLSearchParams();
    apiData.append('key', API_KEY);
    apiData.append('id', Date.now().toString()); // Generate a lead ID (using timestamp)
    apiData.append('offer_id', OFFER_ID);
    apiData.append('stream_hid', STREAM_ID);
    apiData.append('name', body.name || '');
    apiData.append('phone', body.phone || '');
    apiData.append('comments', body.comments || '');
    apiData.append('country', 'MX'); // Hardcoded or body.country
    apiData.append('address', body.address || '');
    apiData.append('tz', body.timezone_int || '3'); // Default to 3 if missing
    apiData.append('web_id', body.web_id || '');
    apiData.append('ip_address', ip);
    apiData.append('user_agent', userAgent);
    
    // UTMs and Subs
    const optionalFields = [
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
        'sub1', 'sub2', 'sub3', 'sub4', 'sub5', 'sub1024'
    ];

    optionalFields.forEach(field => {
        if (body[field]) {
            apiData.append(field, body[field]);
        }
    });

    console.log('Sending data to Traffic Light:', Object.fromEntries(apiData));

    const response = await fetch(API_URL, {
      method: 'POST',
      body: apiData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const responseText = await response.text();
    console.log('Traffic Light Response:', responseText);

    let result;
    try {
        result = JSON.parse(responseText);
    } catch (e) {
        // If not JSON, treat as error or raw text
        console.error('Failed to parse response JSON', e);
        res.status(500).json({ error: 'Invalid response from affiliate network', raw: responseText });
        return;
    }

    if (response.ok && !result.error && !result.errmsg) {
      // Success
      res.status(200).json({ success: true, data: result });
    } else {
      // API Error
      res.status(400).json({ 
          error: result.error || result.errmsg || 'Unknown error from affiliate network', 
          details: result 
      });
    }

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
