const net = require('net');
const readline = require('readline');


// cria objeto do tipo socket utilizado para
// realizar comunicação entre cliente e servidor
const socket = net.Socket();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

// realiza a conexão com o servidor
socket.connect(2000, "127.0.0.1", () => {
    rl.addListener('line', line => {
        socket.write(line);
    });
});

socket.on("data", function (dados) {
    const resposta = dados.toString().trim();

    // imprime mensagem recebida
    console.log(resposta);

    // encerro a conexão
    //socket.end();
});

//socket.end();