# Transicao do hero para as equipes

## Objetivo

Criar uma transicao guiada pelo scroll apenas entre o banner inicial da pagina `frontend/teams.html` e a secao `TOP TIER S TEAMS`. O banner deve permanecer temporariamente preso enquanto a secao seguinte sobe da parte inferior e o banner desaparece gradualmente. Ao concluir a transicao, o scroll volta ao fluxo normal; `TOP RANKING` e todo o conteudo posterior permanecem inalterados.

## Comportamento

- O banner continua ocupando a altura inicial da viewport.
- Ao rolar para baixo, o banner fica visualmente fixo durante uma distancia curta de scroll.
- A secao `TOP TIER S TEAMS` sobe sobre o banner, partindo da borda inferior da viewport.
- O banner, incluindo seu titulo, reduz a opacidade progressivamente enquanto a primeira secao ganha presenca.
- A sobreposicao cria um crossfade continuo, diretamente ligado ao progresso do scroll, sem animacao automatica por tempo.
- Quando a primeira secao assume sua posicao normal, ela e liberada para seguir o documento.
- A partir desse ponto, cards, `TOP RANKING`, tabelas, rodape e modal usam o scroll atual da pagina sem efeitos adicionais.
- Ao rolar para cima, a transicao acompanha o movimento de forma reversivel.

## Implementacao proposta

Usar uma composicao local com CSS `position: sticky` e uma variavel CSS de progresso atualizada por JavaScript. Um contenedor de transicao delimita apenas o hero e a primeira `surface`; seu espaco vertical fornece a distancia necessaria para o efeito sem capturar ou cancelar eventos de wheel/touch.

O JavaScript mede a posicao desse contenedor em `scroll`/`resize`, normaliza o progresso entre 0 e 1 e atualiza uma unica variavel CSS. CSS transforma esse valor em opacidade e deslocamento. A atualizacao e agrupada com `requestAnimationFrame` para evitar trabalho repetido no mesmo frame.

Nao sera adicionada biblioteca externa. O modal e os listeners dos cards permanecem independentes.

## Responsividade e acessibilidade

- O efeito deve funcionar com mouse, trackpad, teclado e gesto de toque, pois depende da posicao real da pagina e nao intercepta a entrada do usuario.
- As distancias usam unidades relacionadas a viewport e limites responsivos para manter a leitura em desktop e mobile.
- Com `prefers-reduced-motion: reduce`, a pagina usa o fluxo vertical normal, sem sobreposicao ou crossfade prolongado.
- A estrutura semantica, a ordem de leitura e o foco dos cards nao mudam.

## Criterios de aceite

1. O banner aparece normalmente ao abrir `teams.html` no topo.
2. O primeiro scroll faz `TOP TIER S TEAMS` subir sobre o banner enquanto o banner desaparece suavemente.
3. A animacao responde proporcionalmente ao scroll e reverte ao rolar para cima.
4. Ao terminar a transicao, a pagina segue com scroll normal ate `TOP RANKING` e o rodape.
5. O efeito nao e aplicado ao `TOP RANKING`.
6. Cards e modal continuam funcionais.
7. A pagina funciona em larguras desktop e mobile e respeita movimento reduzido.
8. A aplicacao inicia sem erros ou avisos relevantes, e as rotas verificadas respondem com HTTP 200.

## Verificacao

- Executar o build do projeto.
- Iniciar a aplicacao e observar a saida de inicializacao.
- Confirmar HTTP 200 para a pagina e os recursos locais essenciais.
- Validar visualmente o inicio, o meio e o fim da transicao, incluindo retorno do scroll e viewport mobile.
- Executar a verificacao final por outro agente, conforme solicitado pelo usuario.
