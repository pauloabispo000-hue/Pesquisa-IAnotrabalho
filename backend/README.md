# Recebimento da pesquisa — Google Apps Script, versão 2

Serviço publicado: https://script.google.com/macros/s/AKfycbxYkRelJm6X9iU9YjlPECAAzk921Z1uHr0-GEIaqD5xTh7R6pPwX_qmGuj84eXP61hO/exec


A implantação existente foi atualizada para a versão 2, mantendo endereço e público de acesso. Respostas e contatos ficam na planilha privada, nunca no GitHub. Não há consulta pública dos registros.

## Contrato

POST com corpo JSON e `Content-Type: text/plain;charset=UTF-8`. Seguir redirecionamentos e ler o JSON retornado; não usar `mode:no-cors`, que impede confirmar a gravação. A página usa `credentials:omit` e não transmite credenciais da conta Google.

- `schemaVersion`: número 2.
- `requestId`: identificador por envio (16 a 80 caracteres alfanuméricos, hífen ou sublinhado), preservado na retentativa.
- `perfil`: `atua`, `ja_atuou`, `quer_ingressar`, `outro`.
- `dificuldade`: `sim`, `nao`, `nao_lembro`.
- `tarefa`, `exemplo`: obrigatórios somente se dificuldade=`sim`; limites 1000 e 2500 caracteres.
- `frequencia`: obrigatória com dificuldade=`sim`: `diaria`, `semanal`, `mensal`, `raramente`, `nao_sei`.
- `solucao`: opcional, até 1500 caracteres.
- `usoIa`: opcional, até 1000 caracteres.
- `nome`: opcional, até 100 caracteres.
- `email`: até 254, obrigatório se `avisarAula`, `receberOfertas` ou `aceitaConversa` for true.
- `whatsapp`: opcional, até 40; a página atual não solicita telefone.
- `privacidade`: true; `versaoPrivacidade`: `2026-10-31`.
- `avisarAula`, `receberOfertas`, `aceitaConversa`: booleanos independentes.
- `origem`: até 250 caracteres, somente códigos de campanha, sem dados pessoais.
- `website`: honeypot vazio; `teste`: true para registros fictícios de verificação.

Se não há preferência de contato, nome e e-mail não são armazenados pela versão 2. Ausência de dificuldade não gera relato inventado: os campos descritivos ficam vazios e a escolha é preservada em coluna própria.

Sucesso: `{"ok":true,"requestId":"..."}`. Reenvio já persistido: acrescenta `duplicate:true`. Falha: `{"ok":false,"error":"..."}`. O cliente deve verificar `ok` e o ID, não apenas o status HTTP.

## Evolução da planilha

As 16 colunas originais permanecem na mesma ordem. São adicionadas somente duas colunas ao final: "Dificuldade relatada" e "Registro de teste". O receptor confere o cabeçalho existente antes de adicionar esses títulos e não substitui respostas. O contrato anterior, sem schemaVersion, continua exigindo os campos da versão 1 para compatibilidade.

Projeto vinculado à planilha: `configurar` registra a propriedade `PESQUISA_PLANILHA_ID`. Não executar de novo desnecessariamente. A versão 2 reutiliza a propriedade e o destino existentes. `doGet` retorna apenas saúde e versão, nunca respostas. O código usa validação, lock, deduplicação e neutralização de fórmulas. Honeypot e limite de payload não são proteção completa contra abuso; acompanhar cotas e execução antes de ampliar tráfego.

Retenção é manual pelo responsável; não há exclusão ou envio de mensagens automático. Na análise, filtrar "Registro de teste" diferente de "Sim", separar os perfis e revisar os relatos. Contagens de visitantes/abandono não são coletadas por este backend.

Fontes técnicas: https://developers.google.com/apps-script/guides/content e https://developers.google.com/apps-script/guides/web . O serviço de conteúdo redireciona para script.googleusercontent.com; o cliente precisa seguir esse fluxo. Verificar CORS na hospedagem definitiva.
