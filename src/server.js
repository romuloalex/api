// Importa o módulo 'http' nativo do Node.js.
// O prefixo 'node:' é uma boa prática que garante que estamos importando um módulo nativo,
// e não um pacote de terceiros com o mesmo nome.
import http from "node:http";

// Importa a função 'jsonBodyHandler' de um arquivo local (middleware).
// A sintaxe de importação nomeada { ... } é usada porque o arquivo 'jsonBodyHandler.js'
// provavelmente usa 'export function jsonBodyHandler ...'.
// A extensão '.js' é obrigatória ao usar ES Modules no Node.js.
import { jsonBodyHandler } from "./middlewares/jsonBodyHandler.js";

// Cria uma instância do servidor HTTP.
// http.createServer() aceita uma função (callback) chamada 'Request Listener'.
// Esta função será executada para *cada* requisição HTTP que o servidor receber.
const server = http.createServer(async (request, response) => {
  // A função do listener é marcada como 'async' para permitir o uso de 'await'
  // na chamada do middleware assíncrono (jsonBodyHandler).

  // Desestrutura o objeto 'request' (que é uma instância de http.IncomingMessage)
  // para extrair as propriedades 'method' (ex: "GET", "POST") e 'url' (ex: "/products").
  const { method, url } = request;

  // Executa o middleware de parsing de JSON.
  // 'await' pausa a execução desta função até que 'jsonBodyHandler' termine.
  // Isso é crucial porque 'jsonBodyHandler' lê o corpo (body) da requisição
  // de forma assíncrona (consumindo um stream).
  // Espera-se que este middleware modifique o objeto 'request', adicionando
  // a propriedade 'request.body' com o JSON já parseado.
  await jsonBodyHandler(request, response);

  // Início da lógica de roteamento manual.

  // Rota 1: Lidar com requisições GET para /products
  if (method === "GET" && url === "/products") {
    // Se a condição for verdadeira:
    // response.end() envia a resposta ao cliente e fecha a conexão.
    // Por padrão, o status code será 200 OK e o Content-Type será inferido como 'text/plain'.
    // O 'return' é vital para encerrar a execução da função aqui e evitar
    // que o código caia no manipulador 404 abaixo.
    return response.end("Lista de produtos!");
  }

  // Rota 2: Lidar com requisições POST para /products
  if (method === "POST" && url === "/products") {
    // Se a condição for verdadeira:

    // response.writeHead(201) define explicitamente o Status Code da resposta.
    // 201 Created é o status semanticamente correto para um POST que cria um recurso.
    // .end() é chamado em seguida (method chaining).
    // JSON.stringify(request.body) converte o objeto JavaScript (que o middleware
    // parseou e colocou em 'request.body') de volta para uma string JSON
    // para ser enviada na resposta.
    return response.writeHead(201).end(JSON.stringify(request.body));
  }

  // Rota "Catch-All" (Pega-Tudo) / Manipulador 404
  // Se nenhuma das condições 'if' anteriores for atendida, o código chega aqui.
  // response.writeHead(404) define o status para 404 Not Found.
  // .end() envia a mensagem de erro e fecha a conexão.
  return response.writeHead(404).end("Rota não encontrada!");
});

// "Liga" o servidor e o faz escutar por conexões de entrada na porta 3333.
// A partir deste ponto, o processo Node.js permanecerá ativo,
// aguardando requisições HTTP.
server.listen(3333);