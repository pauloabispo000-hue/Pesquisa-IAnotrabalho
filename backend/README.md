# Recebimento da pesquisa — Google Apps Script

Serviço publicado: https://script.google.com/macros/s/AKfycbxYkRelJm6X9iU9YjlPECAAzk921Z1uHr0-GEIaqD5xTh7R6pPwX_qmGuj84eXP61hO/exec

As respostas ficam em uma planilha privada do proprietário. O repositório não armazena contatos nem respostas. Não publicar chaves ou credenciais.

## Integração com a página

Enviar POST com corpo JSON e Content-Type: text/plain;charset=UTF-8 para evitar preflight desnecessário. O serviço aceita também application/json e formulário com campo payload contendo JSON. Usar um requestId único (16 a 80 caracteres alfanuméricos, _ ou -), mantido nas novas tentativas do mesmo envio.

Campos:
- requestId: identificador único.
- perfil: atua, ja_atuou, quer_ingressar ou outro.
- tarefa: texto obrigatório, até 1000 caracteres.
- exemplo: texto obrigatório, até 2500.
- frequencia: diaria, semanal, mensal ou raramente.
- solucao: texto obrigatório, até 1500.
- usoIa: opcional, até 1000.
- nome: obrigatório, até 100.
- email: obrigatório, até 254.
- whatsapp: opcional, até 40.
- privacidade: true após ciência explícita sobre o uso dos dados.
- versaoPrivacidade: "2026-10-31".
- avisarAula, receberOfertas, aceitaConversa: booleanos opcionais, separados e desmarcados por padrão.
- origem: opcional, até 250; usar somente identificadores de campanha, sem dados pessoais.
- website: honeypot; deve permanecer vazio.

Resposta de sucesso: {"ok":true,"requestId":"..."}.
Reenvio já gravado: mesmo sucesso com duplicate:true.
Falha: {"ok":false,"error":"..."}.
Não mostrar sucesso antes de ler ok:true. Não usar mode:no-cors: resposta opaca não confirma gravação. Testar a leitura da resposta a partir da hospedagem final; o teste no editor não valida CORS ou o formulário completo.

GET retorna apenas estado do serviço, nunca dados da planilha.

## Operação
Projeto vinculado à planilha: executar configurar uma vez no editor para registrar o destino em Script Properties. Implantação: Web app, executar como proprietário, acesso Anyone. Publicar nova versão quando alterar o código. A planilha permanece privada.

Validações implementadas: tamanho de payload, campos, enumerações, e-mail, ciência da privacidade, honeypot, lock de escrita, deduplicação por ID e neutralização de fórmulas. Honeypot não substitui proteção robusta contra abuso; acompanhar uso e cotas antes de ampliar tráfego.

## Verificação em 31/10/2026
- GET do endereço publicado retornou ok:true.
- Teste interno real: gravação na planilha, deduplicação e rejeição de e-mail inválido aprovados.
- Registro fictício excluído ao final; apenas cabeçalhos permaneceram.
- A página de captura ainda precisa ser enviada/conectada e testada na hospedagem final.
