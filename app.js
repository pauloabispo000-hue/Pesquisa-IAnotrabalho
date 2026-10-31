import {APPS_SCRIPT_URL, toAppsScript} from './integration.js';
'use strict';
function newId() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  const h = [...bytes].map(v => v.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}
const form = document.querySelector('#survey');
const panels = [...form.querySelectorAll('[data-step]')];
const next = document.querySelector('#next'), back = document.querySelector('#back'), submit = document.querySelector('#submit');
let step = 0, busy = false, submissionId = newId();
const params = new URLSearchParams(location.search);
const source = Object.fromEntries(['utm_source','utm_medium','utm_campaign'].map(k => [k,(params.get(k)||'').slice(0,120)]));
function showStep(n, focus = true) {
  step=n;
  panels.forEach((panel,i)=>panel.hidden=i!==n);
  document.querySelectorAll('.steps li').forEach((li,i)=>{li.removeAttribute('aria-current');li.classList.toggle('complete',i<n);if(i===n)li.setAttribute('aria-current','step');});
  document.querySelector('#step-count').textContent=`Etapa ${n+1} de 3`;
  back.hidden=n===0; next.hidden=n===2;submit.hidden=n!==2;
  document.querySelector('#send-error').hidden=true;
  if(focus){panels[n].querySelector('legend').focus();document.querySelector('#pesquisa').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}

}
function markError(id,message) {
  const el=document.getElementById(id), err=document.getElementById(`${id}-error`);
  if(err)err.textContent=message;
  if(el) {if(message)el.setAttribute('aria-invalid','true');else el.removeAttribute('aria-invalid');}
}
function validate() {
  const fields=[...panels[step].querySelectorAll('input,textarea,select')];
  fields.forEach(f=>markError(f.id,''));
  let first=null;
  if(step===0&&!form.elements.profile.value){document.querySelector('#profile-error').textContent='Selecione a opção que descreve seu momento.';first=form.elements.profile[0];}
  else document.querySelector('#profile-error').textContent='';
  fields.filter(f=>f.required&&!f.disabled).forEach(f=>{
    let message='';
    if(f.type==='checkbox'&&!f.checked)message='Confirme sua participação para enviar a resposta.';
    else if(f.type!=='checkbox'&&!f.value.trim())message='Preencha este campo para continuar.';
    else if(f.type==='email'&&!f.validity.valid)message='Digite um e-mail válido, como nome@exemplo.com.';
    if(message){markError(f.id,message);first ||= f;}
  });
  if(first){first.focus();return false;}return true;
}
next.addEventListener('click',()=>{if(validate())showStep(step+1);});
back.addEventListener('click',()=>{if(!busy)showStep(step-1);});
form.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.tagName==='INPUT'&&step<2){e.preventDefault();next.click();}});
form.elements.profile.forEach(input=>input.addEventListener('change',()=>{
  document.querySelector('#profile-error').textContent='';
  document.querySelector('#experience-context').textContent=input.value==='current'?'Pense nos últimos sete dias de trabalho.':'Se tiver experiência, pense no último período em que realizou essas atividades. Você também pode informar que não tem uma situação para contar.';
}));
const difficulty=document.querySelector('#difficulty');
difficulty.addEventListener('change',()=>{
  const yes=difficulty.value==='yes';document.querySelector('#experience-fields').hidden=!yes;
  ['task','example','frequency','solution'].forEach(id=>{const f=document.getElementById(id);f.disabled=!yes;f.required=yes&&id!=='solution';});
});
// Disabled while absent from the visible path; retained in memory if the visitor returns.
['task','example','frequency','solution'].forEach(id=>document.getElementById(id).disabled=true);
function contacts(){const wanted=['notice','interview','offers'].some(k=>form.elements[k].checked);document.querySelector('#contact-fields').hidden=!wanted;form.elements.email.required=wanted;form.elements.email.disabled=!wanted;form.elements.firstName.disabled=!wanted;}
['notice','interview','offers'].forEach(k=>form.elements[k].addEventListener('change',contacts));contacts();
form.addEventListener('input',e=>{if(e.target.id)markError(e.target.id,'');});
form.addEventListener('submit',async e=>{
  e.preventDefault();if(busy)return;
  for(let n=0;n<3;n++){const saved=step;step=n;if(!validate()){showStep(n);validate();return;}step=saved;}
  const d=new FormData(form);const payload={submissionId,source,isTest:params.get('teste')==='1',profile:d.get('profile'),difficulty:d.get('difficulty'),task:d.get('task')||'',example:d.get('example')||'',frequency:d.get('frequency')||'',solution:d.get('solution')||'',ai:d.get('ai')||'',firstName:d.get('firstName')||'',email:d.get('email')||'',notice:d.has('notice'),interview:d.has('interview'),offers:d.has('offers'),researchConsent:d.has('researchConsent'),website:d.get('website')||''};
  busy=true;submit.disabled=true;back.disabled=true;submit.textContent='Enviando…';
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),45000);
  try {
    const wire = toAppsScript(payload);
    const response=await fetch(APPS_SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify(wire),redirect:'follow',credentials:'omit',signal:controller.signal});
    let result;try{result=await response.json();}catch{throw new Error('Não foi possível confirmar o salvamento. Tente novamente.');}
    if(!response.ok||result.ok!==true||result.requestId!==submissionId)throw new Error(result.error||'Não foi possível salvar sua resposta.');
    document.querySelector('#receipt-code').textContent=result.requestId;
    document.querySelector('#success-notice').textContent=payload.notice?'Você escolheu receber o aviso da aula por e-mail quando ela estiver disponível.':'Você não solicitou o aviso da aula. Sua participação já está registrada.';
    document.querySelector('#form-content').hidden=true;document.querySelector('#success').hidden=false;document.querySelector('#success').focus();
    form.reset();
  }catch(error){const box=document.querySelector('#send-error');box.textContent=(error.name==='AbortError'?'A conexão demorou mais que o esperado.':error.message)+' Suas respostas continuam nesta página. Você pode tentar novamente sem duplicar o envio.';box.hidden=false;}
  finally{clearTimeout(timeout);busy=false;submit.disabled=false;back.disabled=false;submit.innerHTML='Enviar minha resposta <span aria-hidden="true">↗</span>';}
});
const dialog=document.querySelector('#privacy-dialog');document.querySelectorAll('.privacy-open').forEach(b=>b.addEventListener('click',()=>dialog.showModal()));document.querySelector('#close-privacy').addEventListener('click',()=>dialog.close());
