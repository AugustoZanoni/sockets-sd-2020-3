const net = require('net');
let cardapio = {
    BURGERS: {
        "Rafael's Cheddar Burguer": "30.90",
        "Rafael's Bacon Burguer": "28.90",
        "Rafael's Classic Burguer": "25.90"
    },
    MACARRONAS: {
        "Macarronada Grande": "25.90",
        "Macarronada Média": "20.90",
        "Macarronada Pequena": "15.90",
    }
}

var carrinho = {}
carrinho.pedido = []
carrinho.valor = 0



// função que trata todos os eventos da conexão no servidor
function trataRequisicoes(socket) {
    // imprime mensagem ao conectar
    console.log("Conexão realizada!");

    // código que executa quando a conexão é encerrada
    socket.on("end", function () {
        console.log("Conexão finalizada!");
    });
    socket.write("Olá. Seja bem vindo ao Rafael's Lanches. \n");
    socket.write("Escolha uma opção do nosso cardápio. \n");

    socket.write('###########################################')
    socket.write('\n')
    socket.write('                CARDÁPIO')
    socket.write('\n')
    socket.write('###########################################')
    socket.write('\n')



    Object.keys(cardapio).forEach(function (categoria) {
        //console.log( categoria )
        socket.write('\n')
        socket.write('#-----------------------------------------#')
        socket.write('\n')
        socket.write('                ' + categoria)
        socket.write('\n')
        let contador = 0
        Object.keys(cardapio[categoria]).forEach(function (item) {
            //console.log(item + " --> " + 'R$ ' + cardapio[categoria][item]);

            socket.write(categoria[0] + `${contador} - ` + item + " --> " + 'R$ ' + cardapio[categoria][item]);
            contador = contador + 1
            socket.write('\n')
        })

    })
    socket.write('\n')
    socket.write('\n')

    function decodificaPedido(pedido) {
        //separa a string do pedido do cliente em letra e número

        let pedido_letra = `${pedido}`[0].toUpperCase()
        let pedido_numero = `${pedido}`[1]
        //console.log('a letra do pedido dele é '+ pedido_letra)
        //console.log('o numero do pedido dele é ' + pedido_numero)


        for (categoria in cardapio) { //pega todas as categorias do cardápio
            //console.log(categoria)
            let categoria_letra = `${categoria}`[0]
            //console.log(`${categoria}`[0])
            if (pedido_letra === categoria_letra) {
                //console.log('ele pediu a categoria ' + categoria)

                console.log('O cliente pediu ' + Object.keys(cardapio[categoria])[pedido_numero]);
                let pedido_cliente = Object.keys(cardapio[categoria])[pedido_numero]
                let pedido_valor = parseFloat(Object.values(cardapio[categoria])[pedido_numero])
                // console.log(pedido_valor)
                // carrinho.push(pedido_cliente + pedido_valor)

                carrinho.pedido.push(pedido_cliente)
                console.log(pedido_valor)
                carrinho.valor = carrinho.valor + pedido_valor

            }

        }
    }

    // código que executa quando dados são recebidos
    socket.on("data", function (dados) {
        const comando = dados.toString();
        // console.log(comando)
        // console.log(dados.toString())

        decodificaPedido(comando)
        
        console.log(carrinho)


        if (comando == 0) {
            
            socket.write("                PEDIDO FINALIZADO")
            socket.write('#-----------------------------------------#')
            
            socket.write('\n')
            //socket.write(carrinho)

            for (item in carrinho.pedido){
                console.log(carrinho.pedido[item])
                socket.write(carrinho.pedido[item])
                socket.write('\n')
            }
            
            socket.write('#-----------------------------------------#')
            socket.write('\n')
            socket.write('TOTAL a pagar: ' + carrinho.valor)
            socket.write('\n')

        }



        //     case "B3":
        //         socket.write("Boa noite\n");
        //         break;

        //     case "FIM":
        //         socket.end();
        //         break;


        //     default:
        //         const c = comando.split(" ");

        //         if (c[0] === "MENSAGEM") {
        //             socket.write("Bom dia " + c[1]);
        //         } else {
        //             socket.write("Desculpe, não consegui entender o que você quis dizer. Faça o seu pedido usando o código do produto desejado :)");
        //             socket.write("Ex: B1");

        //         }

        //}
    });
}


// cria servidor
const server = net.createServer(trataRequisicoes);

// escuta em porta de rede
server.listen(2000, "127.0.0.1");
