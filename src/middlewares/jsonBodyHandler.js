// Exporta uma função assíncrona que atua como um middleware.
// Ela é 'async' porque precisa usar 'await' para consumir o stream da requisição.
export async function jsonBodyHandler(request, response) {
  
  // Inicializa um array vazio para armazenar os 'chunks' (pedaços) de dados
  // que chegam do corpo (body) da requisição.
  const buffers = [];

  // O objeto 'request' (http.IncomingMessage) é um 'Async Iterable'.
  // Usamos o loop 'for await...of' para consumir o stream de dados do corpo da requisição.
  // O loop espera ('await') por cada 'chunk' de dados até que o stream termine.
  for await (const chunk of request) {
    
    // Cada 'chunk' é um objeto 'Buffer' (dados binários).
    // Adicionamos cada Buffer recebido ao nosso array.
    buffers.push(chunk);
  }

  // Usamos um bloco try...catch para lidar com possíveis erros de parsing.
  // Se o corpo da requisição estiver vazio, ou não for um JSON válido,
  // 'JSON.parse()' irá falhar e lançar um erro.
  try {
    // 1. Buffer.concat(buffers): Pega o array de Buffers (ex: [<Buffer 1>, <Buffer 2>])
    //    e os une em um único Buffer.
    // 2. .toString(): Converte esse Buffer unificado em uma string (usando UTF-8 por padrão).
    // 3. JSON.parse(...): Converte a string JSON em um objeto/array JavaScript.
    // 4. request.body = ...: Anexa o objeto JavaScript resultante ao objeto 'request',
    //    permitindo que os manipuladores de rota (no server.js) o acessem.
    request.body = JSON.parse(Buffer.concat(buffers).toString());
    
  } catch (error) {
    // Se o 'try' falhar (ex: requisição GET sem corpo, ou JSON malformado),
    // definimos 'request.body' como 'null' para evitar erros de 'undefined'
    // nos manipuladores de rota.
    request.body = null;
  }

  // Define o cabeçalho 'Content-Type' da *resposta* como 'application/json'.
  // Nota: Isso é aplicado a *todas* as requisições que passam por este middleware.
  // Em uma aplicação real, seria melhor definir o Content-Type da resposta
  // dentro do próprio manipulador de rota, pois nem todas as rotas
  // podem retornar JSON (ex: uma rota GET pode retornar texto plano).
  response.setHeader("Content-Type", "application/json");
}