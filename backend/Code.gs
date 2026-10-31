/**
 * IA no Trabalho: receptor de pesquisa. Nunca retorna respostas ou contatos.
 * Execute configurar uma vez pelo editor antes de implantar.
 */
const COLUNAS = ['Recebido em','ID de envio','Perfil','Atividade difícil','Exemplo recente','Frequência','Solução atual','Uso de IA','Nome','E-mail','WhatsApp','Avisar aula','Receber ofertas','Aceita conversa','Origem','Versão privacidade'];
function configurar() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Execute configurar no projeto vinculado à planilha.');
  PropertiesService.getScriptProperties().setProperty('PESQUISA_PLANILHA_ID', ss.getId());
  let sh = ss.getSheetByName('Respostas');
  if (!sh) {
    const first = ss.getSheets()[0];
    sh = first.getLastRow() === 0 ? first.setName('Respostas') : ss.insertSheet('Respostas');
  }
  if (sh.getLastRow() === 0) sh.appendRow(COLUNAS);
  sh.setFrozenRows(1);
  sh.getRange(1,1,1,COLUNAS.length).setFontWeight('bold').setBackground('#153D67').setFontColor('#FFFFFF');
  sh.setColumnWidth(1,160);
  sh.setColumnWidths(3,6,200);
  console.log('Planilha de respostas preparada.');
}
function doGet() {
  return json_({ok:true,service:'pesquisa-ia-no-trabalho',version:1});
}
function doPost(e) {
  try {
    if (!e || !e.postData || e.postData.contents.length > 20000) throw new Error('Envio inválido.');
    let d;
    const raw = e.postData.contents;
    if (String(e.postData.type).indexOf('application/json') === 0 || raw.trim().charAt(0) === '{') d = JSON.parse(raw);
    else d = e.parameter.payload ? JSON.parse(e.parameter.payload) : e.parameter;
    if (!d || typeof d !== 'object' || Array.isArray(d)) throw new Error('Envio inválido.');
    if (d.website) throw new Error('Envio recusado.');
    const id = campo_(d.requestId,80,true);
    if (!/^[A-Za-z0-9_-]{16,80}$/.test(id)) throw new Error('Identificador de envio inválido.');
    const perfil = campo_(d.perfil,80,true);
    if (!['atua','ja_atuou','quer_ingressar','outro'].includes(perfil)) throw new Error('Selecione seu perfil.');
    const tarefa = campo_(d.tarefa,1000,true);
    const exemplo = campo_(d.exemplo,2500,true);
    const frequencia = campo_(d.frequencia,80,true);
    if (!['diaria','semanal','mensal','raramente'].includes(frequencia)) throw new Error('Selecione a frequência.');
    const solucao = campo_(d.solucao,1500,true);
    const nome = campo_(d.nome,100,true);
    const email = campo_(d.email,254,true).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Informe um e-mail válido.');
    const usoIa = campo_(d.usoIa,1000,false);
    const whatsapp = campo_(d.whatsapp,40,false);
    const origem = campo_(d.origem,250,false);
    if (d.privacidade !== true && d.privacidade !== 'true') throw new Error('Confirme a ciência sobre o uso dos dados.');
    const versao = campo_(d.versaoPrivacidade,40,true);
    if (versao !== '2026-10-31') throw new Error('Atualize a página e tente novamente.');
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) throw new Error('Serviço ocupado. Tente novamente com o mesmo envio.');
    try {
      const sid = PropertiesService.getScriptProperties().getProperty('PESQUISA_PLANILHA_ID');
      if (!sid) throw new Error('Serviço ainda não configurado.');
      const sh = SpreadsheetApp.openById(sid).getSheetByName('Respostas');
      if (!sh) throw new Error('Serviço ainda não configurado.');
      if (sh.getLastRow() > 1 && sh.getRange(2,2,sh.getLastRow()-1,1).createTextFinder(id).matchEntireCell(true).findNext()) return json_({ok:true,requestId:id,duplicate:true});
      const cells = [new Date(),id,perfil,tarefa,exemplo,frequencia,solucao,usoIa,nome,email,whatsapp,sim_(d.avisarAula),sim_(d.receberOfertas),sim_(d.aceitaConversa),origem,versao];
      sh.appendRow(cells.map(seguro_));
      SpreadsheetApp.flush();
      return json_({ok:true,requestId:id});
    } finally { lock.releaseLock(); }
  } catch (err) {
    const msg = String(err.message || '');
    const permitidas = ['Envio inválido.','Envio recusado.','Identificador de envio inválido.','Selecione seu perfil.','Selecione a frequência.','Informe um e-mail válido.','Confirme a ciência sobre o uso dos dados.','Atualize a página e tente novamente.','Serviço ocupado. Tente novamente com o mesmo envio.','Serviço ainda não configurado.','Preencha os campos obrigatórios.','Texto excede o tamanho permitido.'];
    return json_({ok:false,error:permitidas.includes(msg) ? msg : 'Não foi possível salvar. Tente novamente com o mesmo envio.'});
  }
}
function campo_(v,max,required) {
  if (v !== undefined && v !== null && typeof v !== 'string') throw new Error('Envio inválido.');
  const s = String(v || '').trim();
  if (required && !s) throw new Error('Preencha os campos obrigatórios.');
  if (s.length > max) throw new Error('Texto excede o tamanho permitido.');
  return s;
}
function sim_(v) { return v === true || v === 'true' ? 'Sim' : 'Não'; }
function seguro_(v) { return typeof v === 'string' && /^[=+@\-\t\r\n]/.test(v) ? "'" + v : v; }
function json_(v) { return ContentService.createTextOutput(JSON.stringify(v)).setMimeType(ContentService.MimeType.JSON); }
