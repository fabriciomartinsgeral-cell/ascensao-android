/* ASCENSÃO V12 — camada aditiva sobre a V11.
   Preserve tarefas, dados, imagens, conquistas e compatibilidade de backups. */
const V12_DRIVE_FILE='ASCENSAO-backup.json';
const V12_DRIVE_SCOPE='https://www.googleapis.com/auth/drive.appdata';
let v12Token='',v12TokenClient=null,v12DriveBusy=false,v12DriveTimer=null,v12Dirty=false,v12RemoteVersion='',v12RemoteId='',v12DriveNote='Desconectado';
let v12BackupMuted=false, v12Revision=0;
function v12Ensure(){
 st.settings ||= {};
 const s=st.settings;
 if(typeof s.v12WarnOnExit!=='boolean')s.v12WarnOnExit=true;
 s.v12Drive ||= {clientId:'',auto:false};
 s.v12Calendar ||= {};
 const c=s.v12Calendar;
 const defaults={taskPriority:'all',taskStatus:'all',taskType:'all',taskSearch:'',showTasks:true,showHabits:true,showExtras:true,showTaskStats:true,showHabitStats:true,showDetails:true,density:'normal'};
 for(const [k,v] of Object.entries(defaults))if(c[k]===undefined)c[k]=v;
}
v12Ensure();
const v12OldSide=side;
side=function(){
 const shell=document.createElement('div');shell.innerHTML=v12OldSide();const sidebar=shell.querySelector('.sidebar');
 const bottom=sidebar?.querySelector('.side-bottom');
 if(bottom){
  const section=document.createElement('div');section.className='v12-sidebar-tools';
  section.innerHTML='<div class="nav-label v9-nav-heading">DADOS E AJUDA</div><nav class="nav-list">'+
   navLink('data','▤','Dados locais e Drive')+navLink('tutorial','?','Tutorial')+
   '<button class="nav-btn" data-action="v12-exit"><span style="font-size:19px;line-height:1;width:21px;text-align:center">⇥</span><span>Sair / fazer backup</span></button></nav>';
  sidebar.insertBefore(section,bottom);
  const footer=bottom.querySelector('.side-footer');if(footer)footer.textContent='Dados no navegador · backup JSON · Google Drive opcional.';
 }
 return shell.innerHTML;
};
function v12SafeFields(c){return {...c};}
function v12CalendarOptions(){
 const c=st.settings.v12Calendar;
 const filter=[['all','Todos'],...st.settings.priorities.map(p=>[p.id,p.name])];
 return `<details class="v12-cal-controls" open><summary>⚙ Personalizar o calendário <span class="v12-badge">Filtros e aparência</span></summary>
 <div class="v12-cal-options">
 <label>Prioridade das missões<select data-v12-cal="taskPriority">${options(filter,c.taskPriority)}</select></label>
 <label>Status das missões<select data-v12-cal="taskStatus">${options([['all','Todos'],['done','Concluídas'],['missed','Puladas'],['overdue','Atrasadas'],['todo','Pendentes']],c.taskStatus)}</select></label>
 <label>Tipo de missão<select data-v12-cal="taskType">${options([['all','Todos os tipos'],['system','Do sistema'],['portal','Vinculadas a portais'],['regular','Outras tarefas']],c.taskType)}</select></label>
 <label>Tamanho dos dias<select data-v12-cal="density">${options([['compact','Compacto'],['normal','Padrão'],['spacious','Espaçoso']],c.density)}</select></label>
 </div><div class="v12-cal-visibility">
 ${[['showTasks','Missões no calendário'],['showHabits','Hábitos no calendário'],['showExtras','Treinos e metas no dia'],['showTaskStats','Indicadores de missões'],['showHabitStats','Gráficos dos hábitos'],['showDetails','Detalhes das missões']].map(([key,label])=>`<label class="v12-checkbox-row"><input type="checkbox" data-v12-cal="${key}" ${c[key]?'checked':''}><span><strong>${label}</strong></span></label>`).join('')}
 </div><div class="v12-buttonbar"><button class="btn ghost tiny-btn" data-action="v12-cal-reset">Restaurar todos os filtros</button><button class="btn ghost tiny-btn" data-action="v11-cal-today">↗ Ir para hoje</button></div><p class="v12-small-print">As métricas de missões seguem os filtros acima e calculam o aproveitamento apenas sobre a seleção visível. Ao mostrar somente concluídas, a taxa dessa seleção será 100%. As métricas de hábitos usam o seletor da V11, logo abaixo.</p></details>`;
}
const v12PreviousCalendarStatuses=v8CalendarStatuses;
v8CalendarStatuses=function(date){
 v12Ensure();const c=st.settings.v12Calendar;
 if(!c.showTasks)return {tasks:[],done:0,missed:0,overdue:0,pending:0,total:0,eligible:0,rate:0};
 const old=v12PreviousCalendarStatuses(date);
 if(c.taskPriority==='all'&&c.taskStatus==='all'&&c.taskType==='all')return old;
 const tasks=old.tasks.filter(t=>{
  const status=v8Effective(t,date);
  const type=t.period==='system'?'system':(t.goalId&&String(t.goalId).startsWith('portal:'))?'portal':'regular';
  return (c.taskPriority==='all'||t.priority===c.taskPriority)&&(c.taskStatus==='all'||status===c.taskStatus)&&(c.taskType==='all'||type===c.taskType);
 });
 const count=key=>tasks.filter(t=>v8Effective(t,date)===key).length;
 const done=count('done'),missed=count('missed'),overdue=count('overdue'),pending=tasks.length-done-missed-overdue;
 return {tasks,done,missed,overdue,pending,total:tasks.length,eligible:date>TODAY()?0:tasks.length,rate:tasks.length?Math.round(100*done/tasks.length):0};
};
const v12PreviousFilterHabits=v11FilterHabits;
v11FilterHabits=function(){return st.settings.v12Calendar.showHabits?v12PreviousFilterHabits():[];};
const v12PreviousCalendarPage=v8CalendarPage;
v8CalendarPage=function(){
 v12Ensure();const c=st.settings.v12Calendar,root=document.createElement('div');
 root.innerHTML=v12PreviousCalendarPage();
 const layout=root.querySelector('.v8-calendar-layout');if(layout)layout.insertAdjacentHTML('beforebegin',v12CalendarOptions());
 if(c.density!=='normal')root.classList.add('v12-cal-density-'+c.density);
 if(!c.showTasks)root.classList.add('v12-hide-task-dots');
 if(!c.showTaskStats){const report=root.querySelector('.v8-surface:has(.v8-report-header)');if(report)report.style.display='none';}
 if(!c.showDetails){const panel=root.querySelector('.v8-day-details');if(panel)panel.style.display='none';}
 if(!c.showHabits){root.querySelectorAll('.v11-habit-analytics,.v11-calendar-detail,.v11-calendar-controls,.v11-calendar-legend,.v11-cal-habit-dots').forEach(node=>node.style.display='none');}
 else if(!c.showHabitStats){root.querySelectorAll('.v11-habit-analytics').forEach(node=>node.style.display='none');}
 if(!c.showExtras){root.querySelectorAll('.v8-surface').forEach(node=>{if(node.textContent.includes('ATIVIDADES DO DIA')&&node.querySelector('.v8-daily-extras'))node.style.display='none';});}
 return root.innerHTML;
};
function v12GetStatusLine(){const secure=location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1';const ok=!!v12Token;return `<span class="v12-badge">${ok?'● Conectado ao Google':'○ Não conectado'}</span><small class="muted">${esc(v12DriveNote)}</small>${!secure?'<small style="color:var(--gold)">A conexão exige localhost ou HTTPS.</small>':''}`;}
function v12DataPage(){v12Ensure();const s=st.settings,drive=s.v12Drive;return `${pageHeading('SEGURANÇA / PORTABILIDADE','Dados locais e sincronização','Consulte seus backups, transfira dados entre dispositivos e conecte o Google Drive.')}
 <div class="v12-data-grid"><div>
 <section class="v12-control-panel"><h2>Seus dados, sob seu controle</h2><p>Missões, histórico, hábitos, portais, conquistas, imagens, treinos e finanças são armazenados localmente no navegador. Apagar os dados do site pode eliminá-los.</p>
 <div class="v12-cloud-indicator"><span class="v12-badge"><span class="v12-status-dot"></span> Armazenamento local</span><small class="muted">Backup JSON portátil · inclui mídias do banco local</small></div>
 <div class="v12-buttonbar"><button class="btn primary" data-action="v12-export">↓ Salvar backup no computador</button><button class="btn ghost" data-action="import">↑ Restaurar backup JSON</button><button class="btn ghost" data-action="v12-exit">⇥ Sair / fazer backup</button></div>
 <input type="file" id="import-file" accept="application/json,.json" class="sr-only" aria-label="Selecionar backup JSON"><p class="v12-small-print">O backup salva um arquivo. Para restaurá-lo, use “Restaurar backup JSON”; a restauração substitui os dados atuais.</p></section>
 <section class="v12-control-panel"><h2>Google Drive <span class="v12-badge">Opcional</span></h2><p>Salve e restaure uma cópia na pasta privada do aplicativo no Drive. Essa pasta não aparece como um arquivo comum em “Meu Drive”.</p>
 <div id="v12-drive-status" class="v12-cloud-indicator">${v12GetStatusLine()}</div>
 <form id="v12-drive-config"><div class="v12-field"><label>ID do cliente OAuth 2.0 (Google Cloud)</label><input type="text" name="clientId" autocapitalize="none" spellcheck="false" maxlength="250" placeholder="000000000000-xxxx.apps.googleusercontent.com" value="${esc(drive.clientId||'')}" required></div><button class="btn ghost" type="submit">Salvar configuração</button></form>
 <div class="v12-buttonbar"><button class="btn primary" data-action="v12-drive-connect">Conectar Google</button><button class="btn ghost" data-action="v12-drive-upload" ${v12Token?'':'disabled'}>↑ Enviar backup</button><button class="btn ghost" data-action="v12-drive-download" ${v12Token?'':'disabled'}>↓ Restaurar do Drive</button><button class="btn ghost" data-action="v12-drive-disconnect" ${v12Token?'':'disabled'}>Desconectar</button></div>
 <label class="v12-checkbox-row" style="margin-top:18px"><input type="checkbox" id="v12-auto-cloud" ${drive.auto?'checked':''}><span><strong>Enviar automaticamente quando eu alterar dados</strong><small>Só funciona com conexão ativa e internet. Em caso de conflito, o app pede uma decisão antes de substituir a cópia.</small></span></label>
 <div class="v12-warning"><b>Ativação necessária:</b> crie um projeto no Google Cloud, ative a Drive API, configure a tela de consentimento OAuth e crie um <b>ID de cliente para Aplicativo da Web</b> com a origem exata onde hospedar o app (por exemplo, https://seu-dominio.com ou http://localhost:8000). Cole o ID acima. Não coloque uma senha ou segredo de cliente no HTML.</div>
 <p class="v12-help">A autorização utiliza o escopo <code>drive.appdata</code> e o Google Identity Services. O app não acessa todos os seus documentos. É necessário estar online para usar Drive. <a href="https://developers.google.com/workspace/drive/api/guides/appdata" target="_blank" rel="noopener noreferrer">Documentação oficial</a>.</p></section></div>
 <div><section class="v12-control-panel"><h2>Preferências de backup</h2><label class="v12-checkbox-row"><input id="v12-warn-exit" type="checkbox" ${s.v12WarnOnExit?'checked':''}><span><strong>Alertar ao fechar a página com alterações desde o último backup</strong><small>O navegador apresenta seu próprio aviso. A mensagem personalizada aparece no botão “Sair / fazer backup”.</small></span></label><div class="v12-warning">Navegadores não permitem personalizar o aviso de fechar a aba nem iniciar um download automaticamente durante o fechamento. No celular, o aviso pode nem aparecer. Use “Sair / fazer backup” para escolher salvar o arquivo com segurança.</div></section>
 <section class="v12-control-panel"><h2>Como migrar entre aparelhos</h2><div class="v12-settings-list">${[['1','No aparelho atual, salve um backup JSON ou envie ao Drive.'],['2','No novo aparelho, abra o ASCENSÃO na mesma versão.'],['3','Importe o JSON ou conecte ao Drive e clique em Restaurar.'],['4','Confira seus dados antes de voltar a fazer alterações.']].map(([i,t])=>`<div style="display:flex;gap:12px"><span class="v12-badge">${i}</span><p style="margin:0">${t}</p></div>`).join('')}</div></section>
 <section class="v12-control-panel"><h2>Quer conhecer tudo?</h2><p>Veja a configuração de imagens, insígnias, XP e quadros personalizados no tutorial interativo.</p><button class="btn primary" data-action="nav" data-page="tutorial">Abrir tutorial →</button></section></div></div>`;}
function v12TutorialPage(){return `${pageHeading('GUIA / PRIMEIROS PASSOS','Tutorial do ASCENSÃO','Conheça o sistema, personalize cada área e aprenda a acompanhar sua evolução.')}
 <section class="v12-hero"><div><div class="eyebrow">◈ SUA JORNADA, SEU SISTEMA</div><h1>Transforme objetivos grandes em pequenas vitórias diárias.</h1><p>O ASCENSÃO reúne planejamento, execução, hábitos, treino, metas de longo prazo e evolução pessoal em um só lugar. Cada missão cumprida ajuda a acompanhar seu progresso real — e você decide o que importa.</p><div class="v12-buttonbar"><button class="btn primary" data-action="nav" data-page="missions">Organizar meu dia</button><button class="btn ghost" data-action="nav" data-page="settings">Personalizar</button></div></div><div class="v12-orb" aria-hidden="true"><span>◈</span></div></section>
 <div class="v12-quicknav"><button class="btn ghost" data-action="nav" data-page="missions"><strong>01 · PLANEJE</strong><small>Crie missões e distribua por períodos.</small></button><button class="btn ghost" data-action="nav" data-page="habits"><strong>02 · PRATIQUE</strong><small>Registre hábitos bons e hábitos a evitar.</small></button><button class="btn ghost" data-action="nav" data-page="calendar"><strong>03 · ACOMPANHE</strong><small>Veja resultados no calendário e nos gráficos.</small></button></div>
 <h2 class="v12-section-heading">Comece aqui · passo a passo</h2><div class="v12-step-grid">
 ${[
 ['01','Monte o personagem','Abra Personagem, escolha uma imagem e avalie os seis Pilares da Vida. O gráfico mostra como estão as áreas importantes para você.','dashboard','Abrir personagem'],
 ['02','Planeje seu dia','Na Organização diária, adicione tarefas em Missões do Sistema, Manhã, Tarde ou Noite. Arraste cartões para mudar de coluna.','missions','Abrir missões'],
 ['03','Crie um Portal','Use Portais e metas para um objetivo grande, com requisitos, missões vinculadas, metas intermediárias e o desafio final.','goals','Abrir portais'],
 ['04','Cuide da constância','Cadastre um hábito bom ou um hábito a evitar. Registre cada dia; hábitos bons aceitam marcação parcial.','habits','Abrir hábitos'],
 ['05','Analise o calendário','Selecione um dia e veja o que foi feito, pulado ou ficou pendente. Ajuste filtros de hábitos, status, prioridades e visual.','calendar','Abrir calendário'],
 ['06','Proteja seus dados','Salve um arquivo de backup no computador ou configure o Google Drive. Não dependa exclusivamente dos dados locais.','data','Abrir dados locais']
 ].map(([num,title,description,page,button])=>`<article class="v12-step"><span class="v12-number">${num}</span><h3>${title}</h3><p>${description}</p><button class="btn ghost tiny-btn" data-action="nav" data-page="${page}">${button} →</button></article>`).join('')}
 </div><h2 class="v12-section-heading">Guia completo das funcionalidades</h2>
 ${[
 ['Perfil, imagens e títulos por nível',`<p>Seu personagem tem uma progressão até o nível 100. A quantidade de XP necessária cresce com cada nível. Os retratos e títulos mudam a cada 10 níveis, nos marcos 10, 20, 30... 100.</p><ol><li>Abra <b>Configurações e dados → Customização do personagem</b>.</li><li>Escolha o retrato do nível 1 e, depois, as imagens ou GIFs dos marcos de 10 níveis.</li><li>Edite os títulos correspondentes. Eles surgirão quando atingir cada marco.</li><li>Volte para Personagem e confira a prévia.</li></ol><p>GIFs grandes podem ocupar bastante espaço: faça backup das imagens regularmente.</p>`],
 ['Pilares da Vida e equilíbrio',`<p>Na página Personagem, avalie Financeiro, Espiritual, Amizade, Família, Saúde Física e Saúde Mental. O gráfico radar apresenta a distribuição das avaliações. O objetivo é uma autorreflexão, não uma classificação médica.</p><ol><li>Acesse Personagem.</li><li>Selecione uma avaliação verbal para cada pilar (de Péssimo a Perfeito).</li><li>Revise os valores quando sua vida mudar.</li></ol>`],
 ['Conquistas, medalhas e insígnias',`<p>Insígnias são marcos personalizáveis, como completar uma quantidade de missões, alcançar certo nível ou chegar a 90 dias de um hábito.</p><ol><li>Abra <b>Conquistas</b> e escolha criar uma insígnia.</li><li>Defina nome, descrição e imagem quadrada, preferencialmente 1:1.</li><li>Escolha uma condição e a quantidade necessária.</li><li>Salve. Ao cumprir o requisito, ela aparecerá entre as insígnias do personagem.</li></ol><p>Você pode editar ou excluir suas próprias conquistas.</p>`],
 ['Missões: diária, semanal e Kanban',`<ol><li>Em <b>Organização diária</b>, distribua as tarefas por Missões do Sistema, Manhã, Tarde e Noite.</li><li>Use a entrada rápida para digitar várias missões separadas por vírgulas.</li><li>Na <b>Organização semanal</b>, arraste as tarefas entre os dias da semana.</li><li>No <b>Kanban</b>, acompanhe o fluxo: To do, Em progresso, Concluído e Stand by.</li><li>Use o cadeado para impedir movimentações e o botão Aparência para alterar cores e tamanhos.</li></ol><p>Missões do Sistema são obrigatórias e podem causar perda de nível se falharem: use somente para compromissos que realmente deseja tratar dessa forma.</p>`],
 ['Hábitos bons, hábitos a evitar e ciclos de 90 dias',`<p>O sistema acompanha seus registros de dias bem-sucedidos e falhas. Hábitos bons também podem ser marcados como parcialmente feitos.</p><ol><li>Entre em Hábitos e crie seu hábito.</li><li>Escolha <b>Bom</b> ou <b>A evitar</b>.</li><li>Registre cada dia: Feito, Parcialmente feito, Não feito; ou Superado/Não superado.</li><li>Acompanhe a sequência, as frases motivacionais e os relatórios.</li><li>Ao completar 90 dias consecutivos, uma medalha é registrada e o novo ciclo começa.</li></ol><p>A duração de 90 dias é uma regra de gamificação, não uma garantia científica de mudança permanente.</p>`],
 ['Portais, requisitos, metas e chefe final',`<ol><li>Escolha <b>Abrir portal</b> e informe o objetivo principal e o Tier.</li><li>Adicione os requisitos necessários para começar.</li><li>Cadastre as missões recorrentes do portal e defina a frequência.</li><li>Inclua metas intermediárias com nome e prazo.</li><li>Defina o desafio final e a recompensa em XP.</li></ol><p>Exemplo: tirar a CNH → juntar recursos → estudar e praticar → passar no exame.</p>`],
 ['Academia: treinos, descanso e evolução',`<ol><li>Na Academia, crie um card de treino.</li><li>Cadastre os exercícios, séries, repetições, cargas e descanso.</li><li>Durante o treino, toque em cada série concluída; o cronômetro ajuda a controlar os intervalos.</li><li>Acompanhe a meta de peso e seus registros na área de Peso e dieta.</li><li>Em Minha evolução, anexe fotos e organize-as numa linha do tempo.</li></ol><p>As fotos de evolução ficam no armazenamento local e são incluídas nos backups completos.</p>`],
 ['Finanças e metas de compra',`<ol><li>Defina a meta da reserva financeira e registre depósitos ou retiradas.</li><li>Crie um card para cada compra, com foto, preço, prazo e prioridade.</li><li>O sistema calcula quanto guardar por mês.</li><li>Marque como Comprado para mover o card para o histórico.</li></ol>`],
 ['Calendário, filtros e relatórios',`<ol><li>Acesse Calendário e dados.</li><li>Use as setas para mudar o mês e <b>Hoje</b> para voltar à data atual.</li><li>Abra <b>Personalizar o calendário</b> para filtrar tarefas por prioridade, status e tipo, além de ocultar ou exibir detalhes e gráficos.</li><li>Escolha quais hábitos quer acompanhar no seletor de hábitos.</li><li>Clique em um dia para consultar e corrigir registros.</li></ol><p>O aproveitamento de missões considera os registros previstos até a data analisada. Habituais parciais contam com peso de 50% na métrica de hábitos.</p>`],
 ['Backup local, Google Drive e privacidade',`<ol><li>Abra <b>Dados locais e Drive</b> no menu lateral.</li><li>Escolha <b>Salvar backup no computador</b> para baixar um JSON com as informações.</li><li>Para usar Drive, crie um projeto Google Cloud com Drive API e OAuth para navegador, ative o consentimento e cole o Client ID na configuração.</li><li>Hospede o aplicativo em HTTPS ou localhost. Clique em <b>Conectar Google</b>.</li><li>Escolha Enviar backup ou Restaurar do Drive. A sincronização automática é opcional.</li></ol><p>O arquivo é salvo numa pasta privada do aplicativo no Drive. O app não tem autorização para ler seus outros arquivos. Em caso de conflito entre cópias, faça uma escolha explícita antes de sobrescrever.</p>`]
 ].map(([heading,body],i)=>`<details class="v12-accordion" ${i===0?'open':''}><summary>${esc(heading)}</summary><div>${body}</div></details>`).join('')}
 <div class="v12-control-panel" style="margin-top:20px"><h2>Você constrói sua própria evolução.</h2><p>Escolha algumas ações importantes, mantenha a rotina flexível e use as estatísticas para aprender com seus resultados — sem depender de perfeição todos os dias.</p><div class="v12-buttonbar"><button class="btn primary" data-action="nav" data-page="missions">Começar agora</button><button class="btn ghost" data-action="nav" data-page="data">Configurar proteção dos dados</button></div></div>`;}
const v12PreviousRender=render;
render=function(){v12Ensure();v12PreviousRender();
 const main=document.querySelector('main.main');
 if(main&&['data','tutorial'].includes(ui.page)){
  const header=main.querySelector('header.topbar')?.outerHTML||'';main.innerHTML=header+(ui.page==='data'?v12DataPage():v12TutorialPage());
 }
 if(main&&ui.page==='settings'&&(ui.v9SettingsTab||'general')==='general'){
  const card=document.createElement('section');card.className='v12-control-panel v12-settings-preview';card.innerHTML='<h2>Backup, Google Drive e aviso ao sair</h2><p>Os ajustes de backup e sincronização ficam em um lugar de fácil acesso no menu lateral.</p><label class="v12-checkbox-row"><input type="checkbox" id="v12-warn-exit" '+(st.settings.v12WarnOnExit?'checked':'')+'><span><strong>Ativar aviso ao fechar a página com alterações</strong><small>O texto do aviso nativo do navegador não pode ser personalizado.</small></span></label><div class="v12-buttonbar"><button class="btn primary" data-action="nav" data-page="data">Abrir dados locais e Drive →</button></div>';
  main.append(card);
 }
 document.title=(ui.page==='tutorial'?'Tutorial':ui.page==='data'?'Dados locais':document.title.split(' · ')[0])+' · ASCENSÃO V12';
};
// Não envia credenciais nem altera a base de dados enquanto não houver ação do usuário.
const v12PreviousSave=save;
save=function(){v12PreviousSave();v12Dirty=true;v12Revision++;if(v12Token&&st.settings?.v12Drive?.auto&&!v12BackupMuted)v12ScheduleUpload();};
function v12ScheduleUpload(){clearTimeout(v12DriveTimer);v12DriveTimer=setTimeout(()=>{if(v12Token&&st.settings.v12Drive.auto&&v12Dirty)v12Upload(false).catch(err=>v12DriveError(err));},12000);}
function v12DriveUiUpdate(note){v12DriveNote=note;const box=document.getElementById('v12-drive-status');if(box)box.innerHTML=v12GetStatusLine();}
function v12DriveError(err){console.warn('Falha Google Drive:',err);v12DriveUiUpdate('Erro: '+(err?.message||'Falha de rede'));toast('Drive: '+(err?.message||'Não foi possível sincronizar'),'negative');}
function v12GisReady(){return !!(window.google?.accounts?.oauth2?.initTokenClient);}
function v12ConnectDrive(){
 v12Ensure();const clientId=st.settings.v12Drive.clientId.trim();
 if(!clientId)return toast('Informe e salve primeiro o ID OAuth do Google Cloud.','negative');
 if(!(location.protocol==='https:'||['localhost','127.0.0.1'].includes(location.hostname)))return toast('Abra este app via HTTPS ou localhost para conectar o Google Drive.','negative');
 if(!v12GisReady()){
  if(!document.querySelector('#v12-gis-sdk')){
   const script=document.createElement('script');script.id='v12-gis-sdk';script.src='https://accounts.google.com/gsi/client';script.async=true;script.onload=()=>v12DriveUiUpdate('Biblioteca Google pronta. Clique em Conectar novamente.');script.onerror=()=>v12DriveUiUpdate('Não foi possível carregar o login Google. Confira sua internet.');document.head.appendChild(script);
  }
  toast('Carregando o login Google. Clique em Conectar novamente quando estiver pronto.');return;
 }
 try{
  v12TokenClient=google.accounts.oauth2.initTokenClient({client_id:clientId,scope:V12_DRIVE_SCOPE,callback:async result=>{
   if(result.error)return v12DriveError(Error(result.error_description||result.error));
   v12Token=result.access_token||'';v12RemoteId='';v12RemoteVersion='';
   v12DriveUiUpdate('Autorização concedida. Escolha enviar ou restaurar uma cópia.');render();
   try{const files=await v12DriveList();const f=files[0];if(f){v12RemoteId=f.id;v12DriveUiUpdate('Existe um backup na nuvem, atualizado em '+new Date(f.modifiedTime).toLocaleString('pt-BR')+'. Escolha restaurar ou substituir.');}else v12DriveUiUpdate('Conectado. Nenhum backup encontrado: pode enviar o primeiro.');}catch(err){v12DriveError(err);}
  }});
  v12TokenClient.requestAccessToken({prompt:'consent'});
 }catch(err){v12DriveError(err);}
}
async function v12Api(path,opts={}){
 if(!v12Token)throw Error('Conecte-se ao Google antes de sincronizar.');
 const headers=new Headers(opts.headers||{});headers.set('Authorization','Bearer '+v12Token);
 const response=await fetch('https://www.googleapis.com'+path,{...opts,headers});
 if(!response.ok){let msg;try{const o=await response.json();msg=o.error?.message}catch{}if(response.status===401){v12Token='';v12DriveUiUpdate('A autorização expirou. Conecte novamente.');}
  throw Error(msg||('HTTP '+response.status));}
 return response;
}
async function v12DriveList(){
 const params=new URLSearchParams({spaces:'appDataFolder',q:"name = '"+V12_DRIVE_FILE+"' and trashed = false",fields:'nextPageToken,files(id,name,modifiedTime,size)',pageSize:'100'});
 const r=await v12Api('/drive/v3/files?'+params);const value=await r.json();return (value.files||[]).sort((a,b)=>String(b.modifiedTime).localeCompare(String(a.modifiedTime)));
}
async function v12BuildBackup(){
 const media=await v6MediaAll(),files=[];
 for(const m of media){try{files.push({id:m.id,name:m.name,data:await v6ToDataURL(m.blob)})}catch{}}
 return {app:'ascensao',version:12,exportedAt:new Date().toISOString(),data:{...st,activityLog:await allStoredEvents()},media:files};
}
async function v12Export(){const contents=await v12BuildBackup(),body=new Blob([JSON.stringify(contents)],{type:'application/json'});const url=URL.createObjectURL(body),a=document.createElement('a');a.href=url;a.download='ascensao-v12-backup-'+TODAY()+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);v12Dirty=false;try{localStorage.setItem('ascensao_v12_last_backup',String(Date.now()))}catch{}toast('Backup completo baixado. Guarde o arquivo em local seguro.','positive');return true;}
exportV3=v12Export;
async function v12Upload(manual){
 if(v12DriveBusy)return;if(!v12Token)throw Error('Conecte o Google Drive antes.');
 v12DriveBusy=true;v12DriveUiUpdate('Enviando backup completo...');
 try{
  const files=await v12DriveList();let remote=files[0];
  if(remote){
   const other=!!v12RemoteVersion&&remote.modifiedTime!==v12RemoteVersion;
   if(other){v12DriveUiUpdate('CONFLITO: backup remoto mudou. Restaure ou substitua manualmente.');if(!manual)throw Error('Existe uma versão mais recente na nuvem. Sincronização automática pausada.');if(!confirm('A cópia do Google Drive mudou desde sua última sincronização. Substituir mesmo assim?'))return;}
   if(!v12RemoteVersion){if(!manual){v12DriveUiUpdate('O Drive já tem um backup. Escolha manualmente antes de ativar o envio automático.');return;}
    if(!confirm('Já existe um backup no Drive. Substituir pelo conteúdo deste navegador?'))return;}
  }
  const revisionAtStart=v12Revision;const backup=await v12BuildBackup(),json=JSON.stringify(backup);
  if(json.length>100_000_000)throw Error('Backup maior que 100 MB. Reduza mídias muito grandes.');
  if(!remote){
   const res=await v12Api('/drive/v3/files?fields=id,name,modifiedTime',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:V12_DRIVE_FILE,mimeType:'application/json',parents:['appDataFolder']})});remote=await res.json();
  }
  const update=await v12Api('/upload/drive/v3/files/'+encodeURIComponent(remote.id)+'?uploadType=media&fields=id,name,modifiedTime',{method:'PATCH',headers:{'Content-Type':'application/json'},body:json});const updated=await update.json();
  v12RemoteId=updated.id;v12RemoteVersion=updated.modifiedTime;v12Dirty=v12Revision!==revisionAtStart;
  v12DriveUiUpdate('Backup no Google Drive atualizado em '+new Date().toLocaleString('pt-BR'));
  toast('Backup salvo no Google Drive.','positive');
 }finally{v12DriveBusy=false;if(v12Dirty&&v12Token&&st.settings.v12Drive.auto)v12ScheduleUpload();}
}
async function v12Download(){
 if(!v12Token)throw Error('Conecte o Google Drive antes.');if(v12DriveBusy)return;
 v12DriveBusy=true;try{
  const files=await v12DriveList();if(!files.length)throw Error('Nenhum backup encontrado no Drive.');const remote=files[0];
  if(!confirm('Restaurar backup do Drive (de '+new Date(remote.modifiedTime).toLocaleString('pt-BR')+') e SUBSTITUIR os dados locais? Faça um backup local antes.'))return;
  v12DriveUiUpdate('Baixando e restaurando backup...');
  const response=await v12Api('/drive/v3/files/'+encodeURIComponent(remote.id)+'?alt=media');const json=await response.text();if(json.length>100_000_000)throw Error('Arquivo muito grande para restaurar.');
  const obj=JSON.parse(json);const data=validateImport(obj);
  const originalDrive={...st.settings.v12Drive};const originalWarning=st.settings.v12WarnOnExit;
  st=normalize(data);ensureV3();ensureV6();v11Ensure();v12Ensure();st.settings.v12Drive=originalDrive;st.settings.v12WarnOnExit=originalWarning;allDbHistory=[];queuedEvents=[];
  if(database){try{const tx=database.transaction(['snapshot','events'],'readwrite');tx.objectStore('events').clear();tx.objectStore('snapshot').clear();}catch{}}
  queuedEvents.push(...(st.activityLog||[]));await v6MediaRestore(Array.isArray(obj.media)?obj.media:[]);
  v12RemoteId=remote.id;v12RemoteVersion=remote.modifiedTime;v12BackupMuted=true;save();v12BackupMuted=false;v12Dirty=false;ui.page='data';render();
  v12DriveUiUpdate('Backup do Google Drive restaurado.');toast('Backup restaurado. Confira seus registros.','positive');
 }finally{v12DriveBusy=false;v12BackupMuted=false;}
}
// Evitar uploads disparados por restauração.
const v12PreSyncSave=save;
save=function(){v12PreSyncSave();if(v12BackupMuted){clearTimeout(v12DriveTimer);return;}};
const v12PrevAction=action;
action=function(name,el){switch(name){
 case 'v12-export':v12Export().catch(e=>toast(e.message,'negative'));return;
 case 'v12-exit':{
  if(!st.settings.v12WarnOnExit){toast('Os dados estão salvos neste navegador. Faça backup antes de fechar, se desejar.');return;}
  showModal('Backup antes de sair',`<p style="font-size:15px;line-height:1.7">Atenção, os dados foram salvos no cache do navegador. Deseja salvar as alterações como backup no seu computador?</p><p class="v12-help" style="margin-top:12px">Ao escolher salvar, o backup será baixado. Em seguida, feche a aba manualmente.</p><button class="btn ghost" type="button" data-action="v12-exit-no" style="margin-top:12px">Não, meus dados locais bastam</button>`,'v12-exit-form','Sim, baixar backup');return;
 }
 case 'v12-exit-no':closeModal();toast('O aplicativo permanece aberto. Os dados locais foram mantidos.');return;
 case 'v12-drive-connect':v12ConnectDrive();return;
 case 'v12-drive-upload':v12Upload(true).catch(v12DriveError);return;
 case 'v12-drive-download':v12Download().catch(v12DriveError);return;
 case 'v12-drive-disconnect':{v12Token='';v12TokenClient=null;v12RemoteVersion='';v12RemoteId='';clearTimeout(v12DriveTimer);v12DriveUiUpdate('Desconectado. Não foram apagados backups do Drive.');render();return;}
 case 'v12-cal-reset':st.settings.v12Calendar={};v12Ensure();save();render();toast('Filtros do calendário restaurados.','positive');return;
 default:return v12PrevAction(name,el);
 }};
document.addEventListener('change',event=>{const el=event.target;
 if(el.hasAttribute('data-v12-cal')){const key=el.dataset.v12Cal;if(!(key in st.settings.v12Calendar))return;st.settings.v12Calendar[key]=el.type==='checkbox'?el.checked:el.value;save();render();}
 if(el.id==='v12-warn-exit'){st.settings.v12WarnOnExit=el.checked;save();toast(el.checked?'Aviso ativado.':'Aviso desativado.');}
 if(el.id==='v12-auto-cloud'){st.settings.v12Drive.auto=el.checked;save();toast(el.checked?'Envio automático ativado quando houver conexão.':'Envio automático desativado.');}
},true);
document.addEventListener('submit',async event=>{
 const form=event.target;
 if(form.id==='v12-drive-config'){
  event.preventDefault();event.stopPropagation();const clientId=form.querySelector('[name=clientId]')?.value.trim()||'';
  if(!/^\d+-[a-zA-Z0-9-]+\.apps\.googleusercontent\.com$/.test(clientId))return toast('Informe um ID OAuth de aplicativo Web válido.','negative');
  st.settings.v12Drive.clientId=clientId;v12Token='';v12RemoteVersion='';v12RemoteId='';save();render();toast('ID OAuth salvo. Clique em Conectar Google.','positive');return;
 }
 if(form.id==='v12-exit-form'){
  event.preventDefault();event.stopPropagation();const button=form.querySelector('[type=submit]');if(button)button.disabled=true;
  try{await v12Export();closeModal();toast('Backup baixado. Pode fechar a aba manualmente.','positive');}catch(e){toast(e.message,'negative');if(button)button.disabled=false;}
 }
},true);
window.addEventListener('beforeunload',e=>{if(!st.settings?.v12WarnOnExit||!v12Dirty)return; e.preventDefault();e.returnValue='';});
// Relembrar que downloads só podem ser iniciados em uma interação explícita.
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&v12Dirty){try{localStorage.setItem('ascensao_v12_last_visit',new Date().toISOString())}catch{}}});
render();
