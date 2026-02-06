// api/consultar.js
const axios = require('axios');

module.exports = async (req, res) => {
  // Habilita CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Responde a requisições OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Aceita apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  
  try {
    const { placa, renavam } = req.body;
    
    if (!placa || !renavam) {
      return res.status(400).json({ error: 'Placa e RENAVAM são obrigatórios' });
    }
    
    // 1. Usa o token QUE JÁ FUNCIONA
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZW5hdmFtIjoiMDA0Njc4ODA0NzYiLCJwbGF0ZSI6Ik5SUzVKNDciLCJpYXQiOjE3NzAzMzIwMzR9.QmpzZTRGYiTxapKcyIzd8eZxooEGtQM3sAsMevX125c';

    // 2. Consulta a API externa (etapa 1)
    const resposta1 = await axios.post(
      'https://detranmatogrossosul-govbr.vercel.app/api/scrape5',
      { renavam, plate: placa },
      { headers: { Authorization: token } }
    );

    const userId = resposta1.data.userId;

    // 3. Busca os dados completos (etapa 2)
    const resposta2 = await axios.get(
      `https://detranmatogrossosul-govbr.vercel.app/veiculo/${userId}`
    );

    // 4. Retorna os dados HTML
    res.setHeader('Content-Type', 'text/html');
    res.send(resposta2.data);

  } catch (error) {
    console.error('Erro na consulta:', error.message);
    res.status(500).send('Erro ao consultar débitos. Tente novamente.');
  }
};