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
let auth;
var novoPedido = {}
let flagAdmOpt;


// função que trata todos os eventos da conexão no servidor
function trataRequisicoes(socket) {
    // imprime mensagem ao conectar
    console.log("Conexão realizada!");
    socket.write('Digite Seu Nome')

    // código que executa quando a conexão é encerrada
    socket.on("end", function () {
        auth = undefined;
        flagAdmOpt = undefined;
        console.log("Conexão finalizada!");
    });
    function Auth(comando) {
        if (comando == 'adm') {
            ShowMenuAdm();
            auth = true;
        } else {
            ShowMenu();
            auth = false;
        }
    }
    function ShowMenuAdm() {
        socket.write("Olá, seja bem vindo administrador \n");
        socket.write("Escolha uma opção \n");

        socket.write('###########################################')
        socket.write('\n')
        socket.write('                OPÇÕES ADMINISTRATIVAS')
        socket.write('\n')
        socket.write('###########################################')
        socket.write('\n')
        socket.write('OP1 --> adicionar um item ao cardapio')
        socket.write('\n')
        socket.write('OP2 --> remover um item do cardápio')

    }
    function ShowMenu() {
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
        socket.write('###########################################')
        socket.write('\n')
        socket.write('Escolha o seu pedido digitando o código do lanche. Ex: B2')
        socket.write('\n')
        socket.write('Escolha um lanche de cada vez. Para finalizar o pedido digite 0')
    }
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
                if (!auth) {
                    console.log('O cliente pediu ' + Object.keys(cardapio[categoria])[pedido_numero]);
                    let pedido_cliente = Object.keys(cardapio[categoria])[pedido_numero]
                    let pedido_valor = parseFloat(Object.values(cardapio[categoria])[pedido_numero])
                    // console.log(pedido_valor)
                    // carrinho.push(pedido_cliente + pedido_valor)

                    carrinho.pedido.push(pedido_cliente)
                    console.log(pedido_valor)
                    carrinho.valor = carrinho.valor + pedido_valor
                } if (auth && flagAdmOpt) {
                    return categoria
                    console.log(categoria)
                } if (auth && !flagAdmOpt) {
                    let pedido_cliente = Object.keys(cardapio[categoria])[pedido_numero]
                    return [categoria, pedido_cliente]
                }


            }

        }
    }
    function finalizaPedido() {
        socket.write("            PEDIDO FINALIZADO")
        socket.write('#-----------------------------------------#')

        socket.write('\n')
        //socket.write(carrinho)

        for (item in carrinho.pedido) {
            console.log(carrinho.pedido[item])
            socket.write(carrinho.pedido[item])
            socket.write('\n')
        }

        socket.write('#-----------------------------------------#')
        socket.write('\n')
        socket.write('TOTAL a pagar: ' + carrinho.valor)
        socket.write('\n')
    }
    // código que executa quando dados são recebidos
    socket.on("data", function (dados) {
        const comando = dados.toString();
        (auth == undefined) ? Auth(comando) : processaComando(comando);

        function processaComando(comando) {
            if (auth) {
                comandosAdm(comando)
            } if (!auth) {
                comandosCliente(comando)
            }
        }

        function comandosAdm(comando) {
            if (flagAdmOpt) {
                adcItemCardapio(comando)
            } if (!flagAdmOpt) {
                rmItemCardapio(comando)
            }if (comando == 'OP1') {
                socket.write('\n')
                socket.write('\nDigite o produto da seguinte forma, separados por vírgula como no exemplo: CATEGORIA,DESCRIÇÃO,PREÇO')
                flagAdmOpt = true;
            } if (comando == 'OP2') {
                flagAdmOpt = false;
                socket.write('\nDigite o código do Produto para REMOVE-LO. EX: B1')

            } 

            function rmItemCardapio(comando) {
                let arrayItemDecodificado = decodificaPedido(comando),
                    cat = arrayItemDecodificado[0],
                    desc = arrayItemDecodificado[1];
                    console.log(arrayItemDecodificado);
                delete cardapio[`${cat}`][`${desc}`]
                console.log(cardapio);
            }

            function adcItemCardapio(comando) {
                let novoItem = comando.split(","),
                    categoria = novoItem[0],
                    item = novoItem[1],
                    preco = novoItem[2];
                novoPedido[`${categoria}`] = { [`${item}`]: preco }
                console.log(novoPedido);
                Object.assign(cardapio[`${categoria}`], novoPedido[`${categoria}`]);
                console.log(`O seguinte pedido foi adicionado com sucesso ${item}`)
                console.log(cardapio);
                //BURGERS,Rafael's Carne Seca,50.30
                //MACARRONAS,Macarronada Completa Gigante,30.80

            }

        }
        function comandosCliente(comando) {
            if (comando.length == 2) {
                decodificaPedido(comando)

            }
            if (comando == 0) {
                finalizaPedido();
                socket.write('Sua conexão será finalizada em alguns instantes')
                socket.destroy()
            }
        }


    });
}


// cria servidor
const server = net.createServer(trataRequisicoes);

// escuta em porta de rede
server.listen(2000, "127.0.0.1");