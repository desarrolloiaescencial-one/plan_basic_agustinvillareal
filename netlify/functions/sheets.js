export async function handler(event) {
  try {
    const GAS_URL = process.env.GAS_URL

    let response

    if (event.httpMethod === 'GET') {
      // 👉 manejar GET correctamente
      const params = new URLSearchParams(event.queryStringParameters || {})
      response = await fetch(`${GAS_URL}?${params}`, {
        method: 'GET',
      })
    } else {
      // 👉 manejar POST
      const body = JSON.parse(event.body || '{}')

      response = await fetch(GAS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(body),
      })
    }

    const text = await response.text()

    // 🔥 debug clave
    console.log('RAW RESPONSE:', text)

    let data
    try {
      data = JSON.parse(text)
    } catch {
      return {
        statusCode: 500,
        body: JSON.stringify({
          ok: false,
          error: 'Apps Script no devolvió JSON válido',
          raw: text,
        }),
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: error.message,
      }),
    }
  }
}