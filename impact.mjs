export const defaults = Object.freeze({hours:80, internalRate:32, supportRate:15, monthlyFee:1200, pricingMode:'hourly', reviewPercent:10, coordinationHours:0, setup:0, currency:'EUR'});
export const limits = Object.freeze({hours:[0,240],internalRate:[0,150],supportRate:[0,100],monthlyFee:[0,20000],reviewPercent:[0,100],coordinationHours:[0,80],setup:[0,5000]});
export const workloadDefaults = Object.freeze({ap:25,books:25,bank:20,close:10,payroll:0,tax:0});
export const workloadLabels = Object.freeze({ap:'Accounts payable',books:'Bookkeeping',bank:'Bank reconciliation',close:'Month-end & reporting',payroll:'Payroll journal support',tax:'Tax & VAT records'});
export const contactEmail='smartscale2026@gmail.com';
export function emailDraftLink(subject,body=''){return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}${body?'&body='+encodeURIComponent(body):''}`;}
export function sumWorkload(workload) {
  let total=0;
  for(const key of Object.keys(workloadDefaults)) {
    const value=workload[key];
    if(value==='' || !Number.isFinite(Number(value)) || Number(value)<0 || Number(value)>240) throw new RangeError('Enter hours from 0 to 240 for each workflow.');
    total+=Number(value);
  }
  if(total>240)throw new RangeError('Keep the combined workload within 240 hours per month.');
  return total;
}
export function calculateImpact(input) {
  const pricingMode=input.pricingMode??'hourly';
  if(!['hourly','fixed'].includes(pricingMode))throw new RangeError('Choose a valid pricing model');
  const v = {};
  for (const [key,[min,max]] of Object.entries(limits)) {
    const inactive=(key==='supportRate'&&pricingMode==='fixed')||(key==='monthlyFee'&&pricingMode==='hourly');
    const raw=inactive?defaults[key]:(input[key]??defaults[key]);
    const value = Number(raw);
    if (raw === '' || !Number.isFinite(value) || value < min || value > max) throw new RangeError(`Invalid ${key}`);
    v[key] = value;
  }
  const baseline = v.hours * v.internalRate;
  const reviewHours = v.hours * v.reviewPercent / 100;
  const supportCost = pricingMode==='fixed'?v.monthlyFee:v.hours*v.supportRate;
  const reviewCost = reviewHours * v.internalRate;
  const coordinationHours = v.hours>0?v.coordinationHours:0;
  const coordinationCost = coordinationHours * v.internalRate;
  const ongoingCost = supportCost + reviewCost + coordinationCost;
  const monthlySavings = baseline - ongoingCost;
  return {baseline,reviewHours,coordinationHours,coordinationCost,supportCost,reviewCost,ongoingCost,monthlySavings,annualSavings:monthlySavings*12,firstMonthSavings:monthlySavings-v.setup,firstYearSavings:monthlySavings*12-v.setup,freedHours:v.hours-reviewHours-coordinationHours,savingsPercent:baseline>0?monthlySavings/baseline*100:null,setup:v.setup};
}
export function createPilotBrief(data) {
  const names = {ap:'Accounts payable',books:'Bookkeeping',bank:'Bank reconciliation',close:'Month-end & reporting support'};
  const scope = {ap:'Up to 100 supplier invoices in one agreed batch.',books:'Up to 100 current-period transactions in one agreed batch.',bank:'Up to two bank / credit card accounts, with up to 150 statement lines per account.',close:'Up to four agreed supporting schedules for one current period, using complete source records.'};
  if (!names[data.workflow]) throw new RangeError('Choose a workflow');
  return `SMART SCALE ACCOUNTING — PILOT DISCUSSION BRIEF\n\nPrepared by: ${data.name.trim()}\nPractice: ${data.firm.trim()}\nWorkflow: ${names[data.workflow]}\nPreferred start: ${data.start || 'To be agreed'}\n\nPROPOSED BOUNDARIES\nTwo weeks, up to 20 delivery hours, one client entity and one workflow.\n${scope[data.workflow]}\nWhichever is reached first: the agreed volume or 20 delivery hours. Complexity and access confirmed before acceptance.\n\nYOUR WORKFLOW\n${data.notes.trim() || 'Volumes, systems and review preferences to be discussed.'}\n\nDELIVERABLES\nAgreed batch or schedules prepared for review; exception log; supporting records / review pack; handover notes.\n\nREVIEW & APPROVAL\nYour team retains final review, supplier changes, payment approval and statutory submissions. Success criteria and reviewer agreed before start. Measure completed work, delivery hours, reviewer and coordination time, corrections and turnaround against the agreed batch.\n\nCOMMERCIAL TERMS\nA fixed fee and scope are agreed in writing before any work begins. This brief is a discussion request, not a booking or quote. No automatic monthly commitment.\n\nNEXT STEP\nEmail this brief to ${contactEmail}. Please do not include confidential client records.`;
}
export function createEnquiryBrief(data) {
  if(!data.name?.trim()||!data.firm?.trim()||!Array.isArray(data.services)||!data.services.length)throw new RangeError('Add your name, practice and at least one service.');
  return `SMART SCALE ACCOUNTING — OUTSOURCING ENQUIRY\n\nName: ${data.name.trim()}\nPractice / business: ${data.firm.trim()}\nReply details: ${data.email?.trim()||'To be shared in our conversation'}\n\nSERVICES OF INTEREST\n${data.services.map(x=>workloadLabels[x]||x).join('\n')}\n\nPREFERRED ARRANGEMENT\n${data.arrangement||'To be discussed'}\n\nSYSTEMS & WORKLOAD\nSoftware: ${data.software?.trim()||'To be discussed'}\nMonthly volume / period: ${data.volume?.trim()||'To be discussed'}\nPreferred start: ${data.start||'To be agreed'}\n\nADDITIONAL CONTEXT\n${data.notes?.trim()||'None provided.'}\n\nSCOPING NOTES\nScope, hours, turnaround, fee, access, confidentiality and reviewer responsibilities must be agreed before work starts. Payroll and tax requests are limited to records, approved journals and administration within assessed competence; independent payroll processing, tax advice and statutory filings are excluded.\n\nThis brief has not been sent. Email it to ${contactEmail}. Do not include confidential client data.`;
}
