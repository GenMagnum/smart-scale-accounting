export const workflowOptions = Object.freeze({
  ap:{label:'Accounts payable',detail:'Invoices, supplier reconciliations and payment preparation',sample:'supplier'},
  books:{label:'Bookkeeping',detail:'Routine posting, approved journals and supporting records',sample:'close'},
  bank:{label:'Bank reconciliation',detail:'Bank and card matching, differences and query logs',sample:'bank'},
  close:{label:'Month-end preparation',detail:'Close checklists, schedules and reporting inputs',sample:'close'}
});
export const goals = Object.freeze({clients:'Make room for client work',review:'Protect time for review',deadlines:'Keep work moving on time',evenings:'Reduce overtime',exploring:'Understand my options'});
export const workTypes = Object.freeze({recurring:'Recurring monthly work',backlog:'A one-off backlog',both:'Recurring work and a backlog'});
export const pressures = Object.freeze({manageable:'Manageable — we are keeping up',stretched:'Stretched — it takes extra effort',overloaded:'Behind — work is building up',unsure:'I am not sure yet'});
export function freshCheck(){return {selected:[],hours:{ap:0,books:0,bank:0,close:0},unknown:[],delegated:{ap:0,books:0,bank:0,close:0},type:'',pressure:'',goal:'',backlogHours:'',reviewPercent:10,coordinationHours:2,example:false};}
export function exampleCheck(){return {...freshCheck(),selected:['ap','bank'],hours:{ap:25,bank:15,books:0,close:0},delegated:{ap:25,bank:15,books:0,close:0},type:'recurring',pressure:'stretched',goal:'review',example:true};}
function number(value,label,max){if(value===''||value===null||!Number.isFinite(Number(value))||Number(value)<0||Number(value)>max)throw new RangeError(`${label}: enter a number from 0 to ${max}.`);return Number(value);}
export function validateCheck(s,step=3){
  if(!Array.isArray(s.selected)||!s.selected.length||s.selected.some(k=>!Object.hasOwn(workflowOptions,k))||new Set(s.selected).size!==s.selected.length)throw new RangeError('Choose at least one workflow.');
  if(!Array.isArray(s.unknown)||s.unknown.some(k=>!s.selected.includes(k)))throw new RangeError('Check the workflows marked as unknown.');
  let hours=0;
  for(const k of s.selected)if(!s.unknown.includes(k))hours+=number(s.hours[k],workflowOptions[k].label,240);
  if(hours>240)throw new RangeError('Keep known hours within 240. Start with a smaller group of tasks if needed.');
  if(step<2)return;
  if(!Object.hasOwn(workTypes,s.type)||!Object.hasOwn(pressures,s.pressure)||!Object.hasOwn(goals,s.goal))throw new RangeError('Choose the work pattern, how it feels and what you would like to make room for.');
  if(s.type!=='recurring'&&s.backlogHours!=='')number(s.backlogHours,'Backlog hours',5000);
  if(step<3)return;
  for(const k of s.selected)if(!s.unknown.includes(k)){const h=number(s.delegated[k],`Hours to delegate for ${workflowOptions[k].label}`,240);if(h>Number(s.hours[k]))throw new RangeError(`For ${workflowOptions[k].label}, handover hours cannot exceed your current hours.`);}
  number(s.reviewPercent,'Review percentage',100);number(s.coordinationHours,'Coordination hours',80);
}
export function assessCheck(s){
  validateCheck(s);
  const known=s.selected.filter(k=>!s.unknown.includes(k));
  const total=known.reduce((n,k)=>n+Number(s.hours[k]),0);
  const delegated=known.reduce((n,k)=>n+Number(s.delegated[k]),0);
  const review=delegated*Number(s.reviewPercent)/100;
  const coordination=delegated>0?Number(s.coordinationHours):0;
  const net=delegated-review-coordination;
  const recommended=known.filter(k=>Number(s.delegated[k])>0).sort((a,b)=>Number(s.delegated[b])-Number(s.delegated[a]))[0]||s.selected[0];
  let kind='pilot',title=`Start with ${workflowOptions[recommended].label.toLowerCase()}.`,next='Try one current-period batch and measure the handover before expanding.';
  if(!known.length){kind='measure';title='Measure a small batch first.';next='Your hours are not known yet. Time one representative batch, including queries and review, before comparing capacity or costs.';}
  else if(!delegated){kind='process';title='Start with a clearer workflow.';next='You have not chosen any hours to hand over. Use a checklist and query log to clarify the work; outsourcing can wait until you have a suitable task.';}
  else if(net<=0){kind='refine';title='Refine the handover first.';next='Under these assumptions, review and coordination use all the time transferred, or more. Simplify the batch or keep it in-house until the handover is worthwhile.';}
  else if(s.type==='backlog'){kind='project';title='Scope the catch-up work separately.';next='A backlog needs its own period, records review and milestones. Discuss a project scope; the standard pilot covers current-period work.';}
  else if(s.type==='both'){title='Separate catch-up from the monthly rhythm.';next='Start any recurring pilot with one current-period batch. Review the backlog separately so its effort is not hidden in the monthly estimate.';}
  else if(s.pressure==='manageable'){kind='optional';title='A small handover is optional.';next='You report that work is manageable. Keep your current process if it serves you well, or test a small handover to protect time for your chosen priority.';}
  return {total,delegated,review,coordination,net,recommended,sample:workflowOptions[recommended].sample,kind,title,next,unknown:s.unknown.length,recurring:s.type!=='backlog'};
}
export const fmtHours=n=>new Intl.NumberFormat('en-IE',{maximumFractionDigits:1}).format(n);
export function workloadSummary(s){const r=assessCheck(s);const period=r.recurring?'hours/month':'hours for the selected one-off batch';return `SMART SCALE ACCOUNTING — WORKLOAD SUMMARY${s.example?' (ILLUSTRATIVE EXAMPLE)':''}\n\nWork pattern: ${workTypes[s.type]}\nYour assessment: ${pressures[s.pressure]}\nYour priority: ${goals[s.goal]}\n\n${s.selected.map(k=>`${workflowOptions[k].label}: ${s.unknown.includes(k)?'hours unknown; excluded from estimate':`${fmtHours(Number(s.hours[k]))} current, ${fmtHours(Number(s.delegated[k]))} proposed for handover`}`).join('\n')}\n\nMODELLED CAPACITY (${period})\nTransferred: ${fmtHours(r.delegated)}\nRetained review: ${fmtHours(r.review)} (${s.reviewPercent}%)\nCoordination: ${fmtHours(r.coordination)}\nNet capacity change: ${fmtHours(r.net)}\n${s.type!=='recurring'?`Separate backlog estimate: ${s.backlogHours===''?'not known':fmtHours(Number(s.backlogHours))+' hours'}; not added to the capacity calculation.\n`:''}\nSUGGESTED NEXT STEP\n${r.title}\n${r.next}\n\nYour firm retains final review, accounting judgements, payment approval and statutory submissions. Estimates use your inputs, assume equal provider delivery hours and exclude onboarding time, unknown work and new-client revenue. Capacity is not guaranteed cash savings. A scoped pilot can test effort, reviewer time, corrections and turnaround.\n\nThis summary has not been sent. Discuss it with Earl at smartscale2026@gmail.com. No confidential client records are needed for this initial discussion.`;}
