# Server

## Como executar a aplicação?

Primeiro você precisará instalar o Docker em sua máquina, se não tiver bem, mas se não tiver, segue esta documentação do próprio [Docker](https://docs.docker.com/install/).

Assim que terminar a instalação, você precisará criar dois containers que serão utilizados para executar a aplicação:

Para criar o container com a imagem do postgres

```sh
$ docker run --name seu-container -e POSTGRES_PASSWORD=umasenhacriptografada -p 5432:5432 -t -d postgres
```

E um container contendo a imagem do redis

```sh
$ docker run --name seu-container -p 6379:6379 -t -d redis:alpine
```

Sendo assim, você estará ápto a executar o nosso projeto.

## Como visualizar os dados?

O postgres tem uma interface chamada de [Postbird](https://www.electronjs.org/apps/postbird) que você deverá instalar na sua máquina.

Ao abrir o programa, estando o container do postgres rodando, você abrirá uma conexão com o banco, então colocará no username como por padrão `postgres` e a senha criptografada que você escolheu, clicando em `Connect`, irá abrir uma novo conexão com o postgres.

Agora você criará uma base do seu banco de dados. Onde tem um dropdown a esquerda do seu monitor chamado de `Select database`, clique nele e vá em `Create database`, vai abrir um alert e coloque o nome da aplicação, ou qualquer nome que preferir, ou que seja viável para sua equipe (lembrando, que vai ser utilizado mais pra frente este nome). Depois é só clicar em Create database e sua base já está criada.

Logo em seguida, com a aplicação, você deverá instalar os pacotes, com o comando:

```js
$ yarn
```

Assim que terminar, o projeto está sendo utilizado o express e o sequelize para fazer a conexão, mas para isso temos que refatorar algumas variáveis ambiente do projeto.

### Refatorando variáveis ambiente

Temos o arquivo `.env.example` e com ele você copiará o conteúdo dele e criará um arquivo `.env`, colando o conteúdo.

Para ficar mais fácil, é só executar este comando:

```js
$ cp .env.example .env
```

Assim, você terá o conteúdo copiado neste arquivo `.env`.

Agora, vamos refatorar as variáveis ambiente desta aplicação:

```md
# Auth

<!-- Este campo você utilizará o md5 para formatar o AppSecret, ex: APP_SECRET=liadknfjnasdfuh234jb4b5kj2345 -->

APP_SECRET=

# Database

<!--
  Nestes campos, você o utilizará para fazer a conexão com o banco de dados.

  Para o docker, você pode estar utilizando o DB_HOST=localhost, o DB_USER=postgres que é o padrão, o DB_PASS=senhacriptografada que você colocou quando criou o container e o DB_NAME=namedoseudatabase, foi para este momento que precisariamos do nome do seu database.
 -->

DB_HOST=
DB_USER=
DB_PASS=
DB_NAME=

# Mail

<!-- Aqui, você utilizará o Mailtrap para desenvolvimento (link depois deste script), ao se logar, você criará uma inbox, apenas colocando o nome dela e clicando no botão ao lado. Logo em seguida, ele te informará as configurações smtp, que serão utilizadas -->

MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASS=

# Redis

<!-- Aqui são configurações padrão, é só informar o que irei colocar aqui que ele vai funcionar -->

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Sentry

<!-- Este campo, é para registro de erros, logo depois colocarei o link para você ter essa url no seu projeto -->

SENTRY_DSN=
```

- [Mailtrat](https://maitrap.io)
- [Sentry](https://sentry.io/welcome/)

## Inicializar meu banco de dados

Assim que você clonar este repositório, ele já está inicializado, no arquivo `src/app.js` como `import './database'`, então agora é só executar as migrations do sequelize, com o comando:

```sh
$ yarn sequelize db:migrate
```

E executar também os seeders, com o comando:

```sh
$ yarn sequelize db:seed:all
```

## Pronto?

Sim!! Agora é só executar o script `dev`, que você estará conseguindo executar normalmente a aplicação, com o comando:

```sh
$ yarn dev
```
