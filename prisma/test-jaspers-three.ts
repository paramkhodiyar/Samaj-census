async function testJaspersThree() {
  const token = "EAAO8GlT2W5kBR7tpRE9fVSpG265iPSW7fkIPNROT21w8gMSRgJTSlMxRZBBkGlZBtC6HNP3GbN8mOkYuCjHBEDdZBaRNdpQl7G9wai7CuprjZBwrzZCRPENt0ZAnKtimiEQyEBDo2KvZAjWs8Nra9mydbjZCxdpWq0DCAffJtgOBpPpY8ZBrclAZC1Fga8oMpAebZAbrPR5lPMzaWcdb9Shc67Yas3TAAYkIhLkPYhFX56NeBPmIr7FaZCZCmBClaLTF8dZAQ0ZAPYE5hfdY2qD1TBpK1kUsg0v0AZDZD";
  const phoneNumberId = "1135217473016188";
  const templateName = "jaspers_market_order_confirmation_v1";
  const mobile = "9875413483";
  const code = "951753"; // Our test OTP

  let cleanPhone = mobile.replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }

  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

  console.log(`Sending message with template "${templateName}" to: ${cleanPhone}...`);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en_US' },
          components: [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: 'User', // {{1}}
                },
                {
                  type: 'text',
                  text: code, // {{2}} (our OTP!)
                },
                {
                  type: 'text',
                  text: '10 mins', // {{3}} (expiry)
                },
              ],
            },
          ],
        }
      }),
    });

    const data = await response.json();
    console.log('Meta WhatsApp API response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testJaspersThree();
