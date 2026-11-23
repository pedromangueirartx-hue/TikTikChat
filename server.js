
const express = require('express');

const app = express();

const http = require('http').createServer(app);

const io = require('socket.io')(http);

// Histórico das mensagens
const historico = [];

// Disponibilizando os arquivos
app.use(express.static(__dirname));

// Rota principal
app.get('/', (req, res) => {

    res.sendFile(__dirname + '/index.html');

});

// Conexão dos usuários
io.on('connection', (socket) => {

    console.log('Usuário conectado');

    // Enviar histórico para quem acabou de entrar
    socket.emit('chat history', historico);

    // Receber mensagens
    socket.on('chat message', (data) => {

        if (
            !data ||
            typeof data.nome !== 'string' ||
            typeof data.mensagem !== 'string'
        ) {
            return;
        }

        const nome = data.nome.trim().slice(0, 30);

        const mensagem = data.mensagem.trim().slice(0, 500);

        if (!nome || !mensagem) return;

        // Criar mensagem
        const novaMensagem = {

            id: socket.id,

            nome: nome,

            mensagem: mensagem

        };

        // Guardar no histórico
        historico.push(novaMensagem);

        // Limitar às últimas 100 mensagens
        if (historico.length > 100) {

            historico.shift();

        }

        // Enviar mensagem para todos
        io.emit('chat message', novaMensagem);

    });

    // Desconexão
    socket.on('disconnect', () => {

        console.log('Usuário desconectado');

    });

});

// Porta do servidor
const PORT = process.env.PORT || 3000;

// Iniciar servidor
http.listen(PORT, () => {

    console.log(`Servidor rodando em http://localhost:${PORT}`);

});
