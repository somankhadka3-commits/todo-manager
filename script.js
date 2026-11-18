(() => {
const KEY='daylist-tasks-v1';
const $=id=>document.getElementById(id);
const form=$('taskForm'),input=$('taskInput'),list=$('taskList');
let tasks=load(),filter='all',query='',sort='created';
function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x:[]}catch{return[]}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(tasks))}catch{}}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function dateLabel(value){if(!value)return '';const d=new Date(value+'T00:00:00');return d.toLocaleDateString(undefined,{month:'short',day:'numeric'})}
function safeText(s){return String(s)}
function updateCounts(){
const active=tasks.filter(t=>!t.done);
$('allCount').textContent=tasks.length;
$('todayCount').textContent=active.filter(t=>t.due===today()).length;
$('upcomingCount').textContent=active.filter(t=>t.due&&t.due>today()).length;
$('completedCount').textContent=tasks.filter(t=>t.done).length;
const completed=tasks.filter(t=>t.done).length,total=tasks.length,pct=total?Math.round(completed/total*100):0;
$('progressDone').textContent=completed;$('progressTotal').textContent=total;$('progressPercent').textContent=pct+'%';$('progressFill').style.width=pct+'%';
}
function visibleTasks(){
let result=tasks.filter(t=>filter==='all'||(filter==='today'&&!t.done&&t.due===today())||(filter==='upcoming'&&!t.done&&t.due&&t.due>today())||(filter==='completed'&&t.done));
if(query)result=result.filter(t=>t.name.toLowerCase().includes(query));
if(sort==='due')result.sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999'));
else if(sort==='priority'){const rank={high:0,medium:1,low:2};result.sort((a,b)=>rank[a.priority]-rank[b.priority])}
else result.sort((a,b)=>b.created-a.created);
return result;
}
function render(){
updateCounts();list.innerHTML='';
const data=visibleTasks();
$('pageTitle').firstChild.textContent=({all:'All tasks',today:'Today',upcoming:'Upcoming',completed:'Completed'}[filter]);
$('subtitle').textContent=({all:'A little progress goes a long way.',today:'Focus on what you can do today.',upcoming:'A look at what is coming next.',completed:'Look at everything you have accomplished.'})[filter];
$('taskSummary').textContent=data.length?data.length+' '+(data.length===1?'task':'tasks')+' in this view.':'Make room for what matters.';
if(!data.length){const box=document.createElement('div');box.className='empty-state';const symbol=document.createElement('div');symbol.className='empty-symbol';symbol.textContent=filter==='completed'?'✳':'＋';const title=document.createElement('h3');title.textContent=query?'No matching tasks':filter==='completed'?'Nothing completed yet':'A fresh start';const p=document.createElement('p');p.textContent=query?'Try another search term.':'Add a task above and make today count.';box.append(symbol,title,p);if(filter==='all'&&!query){const b=document.createElement('button');b.textContent='Add your first task';b.addEventListener('click',()=>input.focus());box.append(b)}list.append(box);return}
data.forEach(task=>{
const row=document.createElement('article');row.className='task-row'+(task.done?' done':'');
const check=document.createElement('input');check.type='checkbox';check.className='check';check.checked=task.done;check.setAttribute('aria-label','Mark '+task.name+' as '+(task.done?'active':'completed'));check.addEventListener('change',()=>{task.done=check.checked;save();render()});
const content=document.createElement('div');content.className='task-content';const name=document.createElement('div');name.className='task-name';name.textContent=task.name;const meta=document.createElement('div');meta.className='task-meta';const priority=document.createElement('span');priority.className='priority '+task.priority;priority.textContent=task.priority[0].toUpperCase()+task.priority.slice(1)+' priority';meta.append(priority);
if(task.due){const due=document.createElement('span');due.className='due'+(!task.done&&task.due<today()?' overdue':'');due.textContent='◷ '+dateLabel(task.due)+(task.due<today()&&!task.done?' · overdue':'');meta.append(due)}
content.append(name,meta);
const actions=document.createElement('div');actions.className='task-actions';const del=document.createElement('button');del.className='task-action';del.type='button';del.textContent='×';del.title='Delete task';del.setAttribute('aria-label','Delete '+task.name);del.addEventListener('click',()=>{tasks=tasks.filter(t=>t.id!==task.id);save();render()});
actions.append(del);row.append(check,content,actions);list.append(row);
});
}
form.addEventListener('submit',e=>{e.preventDefault();const name=input.value.trim();if(!name)return;tasks.unshift({id:uid(),name,priority:$('priorityInput').value,due:$('dueInput').value,done:false,created:Date.now()});save();input.value='';$('dueInput').value='';filter='all';document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.filter==='all'));render();input.focus()});
document.querySelectorAll('.nav-item').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b===button));render()}));
$('searchInput').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();render()});
$('sortSelect').addEventListener('change',e=>{sort=e.target.value;render()});
$('clearCompleted').addEventListener('click',()=>{tasks=tasks.filter(t=>!t.done);save();render()});
$('dateLine').textContent=new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'}).toUpperCase();
render();
})();