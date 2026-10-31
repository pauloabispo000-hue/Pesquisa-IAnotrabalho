export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxYkRelJm6X9iU9YjlPECAAzk921Z1uHr0-GEIaqD5xTh7R6pPwX_qmGuj84eXP61hO/exec';
export function toAppsScript(p) {
 const wants = p.notice || p.interview || p.offers;
 return {schemaVersion:2,requestId:p.submissionId,perfil:({current:'atua',past:'ja_atuou',entering:'quer_ingressar',other:'outro'})[p.profile],dificuldade:({yes:'sim',no:'nao',unsure:'nao_lembro'})[p.difficulty],tarefa:p.task,exemplo:p.example,frequencia:({daily:'diaria',weekly:'semanal',monthly:'mensal',rarely:'raramente',unknown:'nao_sei'})[p.frequency]||'',solucao:p.solution,usoIa:({yes:'Sim',no:'Não',unsure:'Não tenho certeza'})[p.ai]||'',nome:wants?p.firstName:'',email:wants?p.email:'',whatsapp:'',privacidade:p.researchConsent,versaoPrivacidade:'2026-10-31',avisarAula:p.notice,receberOfertas:p.offers,aceitaConversa:p.interview,origem:JSON.stringify(p.source).slice(0,250),website:p.website,teste:p.isTest===true};
}
