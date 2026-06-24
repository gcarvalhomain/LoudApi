# LoudApi

Este projeto e uma aplicacao simples feita com **ASP.NET Core**.

Ele tem duas partes principais:

1. **Backend**: uma API em C#.
2. **Frontend**: uma pagina HTML/CSS chamada **VELOTV**.

A ideia da pagina e mostrar um site visual sobre eventos de Counter-Strike 2, com informacoes sobre eventos, tickets, noticias e jogadores.

## O que voce precisa instalar

Antes de rodar o projeto, instale:

- .NET 10 SDK
- Um editor de codigo, como Rider ou Visual Studio Code

Para verificar se o .NET esta instalado, rode:


dotnet --version


## Como rodar o projeto

Abra o terminal na pasta do projeto:


C:\Users\Leno Carvalho\Developer\Gabriel\LoudApi


Depois rode:


dotnet restore
dotnet run


Se tudo estiver certo, o terminal vai mostrar algo parecido com:


Now listening on: http://localhost:5152
Application started.


Agora abra no navegador:


http://localhost:5152


## Estrutura de pastas

```text
LoudApi/
+-- frontend/
|   +-- index.html
|   +-- visual/
|       +-- styles/
|           +-- velotv-events.css
+-- src/
|   +-- backend/
|       +-- Program.cs
|       +-- information/
|       +-- priorities/
|       +-- services/
+-- Properties/
|   +-- launchSettings.json
+-- appsettings.json
+-- appsettings.Development.json
+-- LoudApi.csproj
+-- LoudApi.http
+-- PROJECT_STRUCTURE.md
+-- README.md
```

## Explicando cada parte

### `frontend/`

Aqui fica a parte visual do site.

Arquivos importantes:

- `frontend/index.html`: estrutura da pagina.
- `frontend/visual/styles/velotv-events.css`: estilo da pagina, como cores, tamanhos, cards, menu e imagens.

Este projeto usa `frontend` como pasta publica do site.

Isso esta configurado em `LoudApi.csproj`:


<WebRootPath>frontend</WebRootPath>


### `src/backend/`

Aqui fica o codigo C# da API.

### `src/backend/Program.cs`

Este e o arquivo principal do backend.

Ele faz coisas como:

- iniciar a aplicacao;
- configurar Swagger;
- servir os arquivos do frontend;
- registrar os endpoints da API.

### `src/backend/information/`

Esta pasta guarda a API de apresentacao da pagina.

Endpoints:


GET /presentation
GET /presentation/{section}


Exemplo:


http://localhost:5152/presentation


### `src/backend/priorities/`

Esta pasta tem uma API simples de prioridades.

Ela funciona em memoria. Isso significa que os dados somem quando a aplicacao fecha.

Endpoints:


GET    /priorities
GET    /priorities/{id}
POST   /priorities
PUT    /priorities/{id}
DELETE /priorities/{id}


### `src/backend/services/`

Aqui ficam servicos usados pela aplicacao.

No momento, existe um servico para retornar os dados da apresentacao VELOTV.

## Swagger

Swagger e uma pagina que ajuda a testar a API pelo navegador.

Depois de rodar o projeto, abra:


http://localhost:5152/swagger


## Comandos uteis

Restaurar pacotes:


dotnet restore


Compilar o projeto:


dotnet build


Rodar o projeto:


dotnet run


Limpar arquivos gerados:


dotnet clean


## Problemas comuns

### Erro falando sobre `wwwroot`

Se aparecer algo como:


DirectoryNotFoundException: ...\wwwroot\


rode:


dotnet clean
dotnet run


Isso pode acontecer porque antes o ASP.NET usava `wwwroot`, mas agora o projeto usa `frontend`.

### Erro dizendo que `LoudApi.exe` ou `LoudApi.dll` esta em uso

Isso acontece quando o projeto ja esta rodando.

Pare o servidor com:


Ctrl + C


Depois tente de novo:


dotnet build


## Ideias para melhorar no futuro

- Salvar priorities em um banco de dados.
- Criar testes automaticos.
- Melhorar a API de eventos.
- Colocar imagens locais no projeto.
- Separar melhor conteudo, estilos e componentes.

## Resumo rapido

Este projeto serve uma pagina frontend moderna e tambem oferece APIs simples em C#.

Use:


dotnet run


E abra:


http://localhost:5152

