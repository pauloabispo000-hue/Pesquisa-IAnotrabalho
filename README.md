# Pesquisa IA no Trabalho

Página de captura e pesquisa para identificar necessidades reais de assistentes administrativos antes de produzir a aula e escolher o curso. Responsável: Paulo Bispo.

## Arquitetura atual

Página estática (`index.html`, `styles.css`, `app.js`, `integration.js`) → Google Apps Script → planilha privada do proprietário. Não é necessário hospedar Node ou SQLite para receber respostas. O servidor do pacote anterior foi substituído por esta integração.

O endereço público de recebimento está em `integration.js` e em [backend/README.md](backend/README.md). O link `/home/projects/.../edit` abre o editor e não recebe o formulário. O envio usa a implantação `/macros/s/.../exec`.

## Publicar a página

Os quatro arquivos públicos podem ser hospedados como site estático, inclusive GitHub Pages. No GitHub Pages, selecione a branch `main`, pasta `/ (root)`. Essa configuração de hospedagem é separada do commit dos arquivos e não foi feita por este código. Abra o endereço publicado e faça um teste completo antes de divulgar.

O servidor Google já está implantado como Web app, com acesso público de recebimento. A planilha permanece privada e não há rota que liste suas respostas. Atualizações do código Apps Script exigem nova versão da implantação; editar o arquivo no GitHub não atualiza automaticamente o projeto Google.

## Prévia e testes

```sh
npm test
npm run dev
```

Node é usado apenas para testes e prévia local, não para coleta. Abra `http://localhost:4173/?teste=1`. O parâmetro `teste=1` marca o registro como teste na planilha. Não use esse parâmetro nas publicações reais. O arquivo `preview.mjs` serve somente os quatro arquivos públicos explicitamente permitidos.

O formulário não guarda rascunhos pessoais no navegador. Voltar entre etapas preserva o preenchimento na memória da aba; atualizar ou fechar a aba descarta o preenchimento ainda não enviado. Uma nova tentativa após falha usa o mesmo requestId enquanto a aba não for atualizada, impedindo duplicação acidental.

## Privacidade e operação

- Consentimento da pesquisa obrigatório; avisos da aula, ofertas e conversa separados e desmarcados.
- E-mail só é exigido quando alguma preferência de contato é selecionada; primeiro nome opcional.
- Relato aberto antes da pergunta sobre IA; opção de não ter dificuldade ou experiência.
- Origem de campanha registrada; sem pixels publicitários ou sistema de eventos de abandono nesta versão.
- Confirmação somente após leitura de `ok:true` e correspondência do `requestId`.
- Não são enviados e-mails automaticamente. O responsável deve aplicar as preferências quando preparar os contatos posteriores.
- Retenção prevista de até 180 dias, com revisão/exclusão manual pelo responsável. Esta versão não instala gatilhos nem apaga registros automaticamente. Backups devem seguir a mesma rotina.
- Registros de teste ficam identificados na coluna "Registro de teste". Exclua-os da análise, sem confundir com respostas reais.

## Validação

Cinco testes automatizados aprovados: contrato página/Apps Script, envio sem contato, resposta sem dificuldade, frequência desconhecida, preferências condicionais, deduplicação, validações, neutralização de fórmulas e compatibilidade com o contrato anterior. O teste automatizado usa mocks em memória, sem escrever na planilha real.

Em 31/10/2026 foi feita uma submissão fictícia pela página de prévia, com `teste=1`; o navegador conseguiu ler a confirmação real do Apps Script. Esse registro não é evidência de demanda. O teste deve ser repetido no endereço definitivo, pois origem e hospedagem podem afetar a comunicação.

Revisão editorial: [docs/analise-publicidade.md](docs/analise-publicidade.md). Nenhuma resposta, contato coletado, captura de conta ou credencial é incluída no repositório.
