export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== WEBHOOK RECEBIDO ===');
    console.log('Headers:', req.headers);
    console.log('Body raw:', req.body);
    
    // Parse form data se necessário
    let data = req.body;
    
    // Se é string (form data), converter para objeto
    if (typeof req.body === 'string') {
      const formData = new URLSearchParams(req.body);
      data = {};
      for (const [key, value] of formData) {
        data[key] = decodeURIComponent(value.replace(/\+/g, ' '));
      }
    }
    
    console.log('Dados processados:', data);
    
    // Preparar dados para Google Sheets
    const sheetData = {
      horario: new Date().toLocaleString('pt-BR', { 
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      form_name: data.form_name || 'Get a Quote',
      name: data.Name || '',
      email: data.Email || '',
      phone: data.Phone || '',
      company: data.Company || '',
      business_type: data['Business type'] || '',
      how_did_you_hear: data['How Did You Hear About Us'] || '',
      website: data.Website || '',
      country: data.Country || '',
      average_order: data['Average Order Size'] || '',
      gross_sales: data['Gross Sales Per Year'] || '',
      message: data.Message || '',
      form_id: data.form_id || ''
    };
    
    console.log('Dados para Google Sheets:', sheetData);
    
    // Enviar para Google Apps Script
    const googleResponse = await fetch('https://script.google.com/macros/s/AKfycbw5NCdwxiArp17i0wUpJWHsXvf5cDQz2PQpkL9Oke6V77CGRAjqwyFBCLqyvZdNllbQBg/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sheetData)
    });
    
    const googleResult = await googleResponse.text();
    console.log('Resposta do Google:', googleResult);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Dados processados com sucesso',
      original_data: data,
      processed_data: sheetData,
      google_response: googleResult
    });
    
  } catch (error) {
    console.error('Erro:', error);
    
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    });
  }
}
