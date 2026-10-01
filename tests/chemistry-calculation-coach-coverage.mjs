import fs from 'node:fs';
const html=fs.readFileSync('subjects/chemistry-calculation-coach.html','utf8');
const js=fs.readFileSync('subjects/chemistry-calculation-coach.js','utf8');
const bridge=fs.readFileSync('subject-tool-bridge.js','utf8');
const failures=[];
for(const token of ['AQA 7405','20%','14','Core calculations','Physical chemistry','Acids & buffers','Exam practice'])if(!html.includes(token))failures.push(`HTML missing: ${token}`);
const skills=['moles','particles','solutions','gas','stoich','empirical','yield','titration','uncertainty','energetics','rates','equilibrium','acidbase','cells'];
for(const skill of skills)if(!js.includes(`'${skill}'`))failures.push(`Skill missing: ${skill}`);
for(const token of ['6.022e23','pV = nRT','Percentage yield','Titration concentration','Titre uncertainty','Calorimetry, Hess & Gibbs','rate = k[A]^m[B]^n','Kc & Kp','pH, Ka, pKa and buffers','Ecell = Epositive − Enegative'])if(!js.includes(token)&&!html.includes(token))failures.push(`Required calculation feature missing: ${token}`);
for(const formula of ['m/mr','p*v/(R*t)','n*t/k','ct*vt','2*r+end','m*c*dt','rate/den','10**(-pH)','ep-en'])if(!js.includes(formula))failures.push(`Calculation implementation missing: ${formula}`);
if(!bridge.includes("'calculation-coach':{hub:'subjects/chemistry-calculation-coach.html'"))failures.push('Chemistry Calculation Coach route missing');
if(!bridge.includes('openChemistryCalculationCoach'))failures.push('Chemistry Calculation Coach bridge missing');
if(!bridge.includes("ensureCoachCard('calculation-coach','chemistry'"))failures.push('Chemistry-only card guard missing');
if(failures.length){console.error('Chemistry Calculation Coach coverage audit failed:');for(const f of failures)console.error(`- ${f}`);process.exit(1)}
console.log('Chemistry Calculation Coach coverage passed: AQA 7405 quantitative skills, formulas and Chemistry-only routing are represented.');