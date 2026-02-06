const axios = require('axios');

module.exports = async (req, res) => {
  // 1. CONFIGURA CORS PRIMEIRO
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 2. RESPONDE OPTIONS IMEDIATAMENTE
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 3. SÓ ACEITA POST
  if (req.method !== 'POST') {
    return res.status(405).send('Use POST');
  }
  
  try {
    // 4. PEGA O BODY CORRETAMENTE (Vercel manda como string/buffer)
    let bodyData;
    if (typeof req.body === 'string') {
      bodyData = JSON.parse(req.body);
    } else if (Buffer.isBuffer(req.body)) {
      bodyData = JSON.parse(req.body.toString());
    } else {
      bodyData = req.body || {};
    }
    
    const { placa, renavam } = bodyData;
    
    if (!placa || !renavam) {
      return res.status(400).json({ error: 'Preencha placa e RENAVAM' });
    }
    
    // 5. CONSULTA (MESMO CÓDIGO QUE FUNCIONA LOCAL)
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZW5hdmFtIjoiMDA0Njc4ODA0NzYiLCJwbGF0ZSI6Ik5SUzVKNDciLCJpYXQiOjE3NzAzMzIwMzR9.QmpzZTRGYiTxapKcyIzd8eZxooEGtQM3sAsMevX125c';
    
    // Primeira chamada
    const resposta1 = await axios.post(
      'https://detranmatogrossosul-govbr.vercel.app/api/scrape5',
      { renavam, plate: placa },
      { headers: { Authorization: token } }
    );
    
    const userId = resposta1.data.userId;
    
    // Segunda chamada
    const resposta2 = await axios.get(
      `https://detranmatogrossosul-govbr.vercel.app/veiculo/${userId}`
    );
    
    // 6. RETORNA HTML
    res.setHeader('Content-Type', 'text/html');
    res.send(resposta2.data);
    
  } catch (error) {
    console.error('Erro Vercel:', error.message);
    res.status(500).send('Erro: ' + error.message);
  }
};
