# PROJETO PARTY-TIME

Projeto realizado no curso do Matheus Battisti e aperfeiçoado para TypeScript.

## Para rodar o projeto

Primeiro: Clone este respositório com o seguinte comando no seu terminal:

```bash
git clone https://github.com/VictorMonteiro7/party-time-backend <nome-da-pasta>
```

Após o comando acima, entre na pasta do projeto e crie um arquivo _.env_.

O projeto está feito com MongoDB, e usando variáveis ambientes. As variáveis que estáo sendo usadas são:

```
PORT=
MG_DB=
MG_USER=
MG_PASS=
MG_PORT=
PASS_BUFFER=
JWT_SECRET=
```

**Lembre-se: Configure as variáveis de acordo com o seu gosto.**

Após essas configurações, será necessário instalar as dependências. Isso pode ser feito com o seguinte comando abaixo:

```bash
npm install
```

Por fim, mas não menos importante, para rodar o projeto, use o seguinte comando:

```bash
npm run start-dev
```

Ele rodará no localhost (127.0.0.1) com a porta que foi declarada no _.env_.
O link final ficará assim: **http://localhost:PORTA**.

###### Victor Monteiro.
