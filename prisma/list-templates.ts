async function listTemplates() {
  const token = "EAAO8GlT2W5kBR7tpRE9fVSpG265iPSW7fkIPNROT21w8gMSRgJTSlMxRZBBkGlZBtC6HNP3GbN8mOkYuCjHBEDdZBaRNdpQl7G9wai7CuprjZBwrzZCRPENt0ZAnKtimiEQyEBDo2KvZAjWs8Nra9mydbjZCxdpWq0DCAffJtgOBpPpY8ZBrclAZC1Fga8oMpAebZAbrPR5lPMzaWcdb9Shc67Yas3TAAYkIhLkPYhFX56NeBPmIr7FaZCZCmBClaLTF8dZAQ0ZAPYE5hfdY2qD1TBpK1kUsg0v0AZDZD";
  const businessAccountId = "1767026787950276";

  const url = `https://graph.facebook.com/v18.0/${businessAccountId}/message_templates`;

  console.log('Fetching message templates...');
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log('Templates Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

listTemplates();
