const axios = require('axios');

module.exports = async (req, res) => {
  console.log('=== API INICIADA ===');
  
  // 1. PERMITE TUDO (CORS completo)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 2. Responde OPTIONS imediatamente
  if (req.method === 'OPTIONS') {
    console.log('✅ OPTIONS respondido');
    return res.status(200).end();
  }
  
  // 3. SE NÃO FOR POST, responde mas não bloqueia
  if (req.method !== 'POST') {
    console.log('⚠️ Método não POST:', req.method);
    // Mas ainda responde algo útil
    return res.status(200).send('API Detran MS - Use POST com {placa, renavam}');
  }
  
  console.log('✅ POST recebido - Processando...');
  
  try {
    // 4. PEGA OS DADOS DE QUALQUER JEITO
    let placa, renavam;
    
    // Tenta pegar do body
    if (req.body) {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      placa = body.placa || 'NRS5J47';
      renavam = body.renavam || '00467880476';
    } else {
      // Se não tiver body, usa valores fixos
      placa = 'NRS5J47';
      renavam = '00467880476';
    }
    
    console.log(`🔍 Consultando: ${placa} / ${renavam}`);
    
    // 5. FAZ A CONSULTA REAL
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZW5hdmFtIjoiMDA0Njc4ODA0NzYiLCJwbGF0ZSI6Ik5SUzVKNDciLCJpYXQiOjE3NzAzMzIwMzR9.QmpzZTRGYiTxapKcyIzd8eZxooEGtQM3sAsMevX125c';
    
    const resposta1 = await axios.post(
      'https://detranmatogrossosul-govbr.vercel.app/api/scrape5',
      { renavam, plate: placa },
      { headers: { Authorization: token } }
    );
    
    const userId = resposta1.data.userId;
    console.log(`🆔 User ID: ${userId}`);
    
    const resposta2 = await axios.get(
      `https://detranmatogrossosul-govbr.vercel.app/veiculo/${userId}`
    );
    
    console.log('✅ Sucesso! Enviando resposta...');
    res.setHeader('Content-Type', 'text/html');
    res.send(resposta2.data);
    
  } catch (error) {
    console.error('💥 ERRO:', error.message);
    res.status(500).json({ 
      error: error.message,
      message: 'Erro na consulta ao Detran MS'
    });
  }
};
