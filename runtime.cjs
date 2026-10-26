const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const home=process.env.PCC_DATA_HOME||__dirname,settings=fs.existsSync(path.join(home,'settings.json'))?JSON.parse(fs.readFileSync(path.join(home,'settings.json'),'utf8')):{port:47831,phpPath:''};
const port=Number(process.env.PCC_PORT||settings.port);if(!Number.isInteger(port)||port<1024||port>65535)throw Error('settings.json port must be an integer from 1024 to 65535.');
let php=settings.phpPath||'';if(!php){const found=cp.spawnSync(process.platform==='win32'?'where.exe':'which',[process.platform==='win32'?'php.exe':'php'],{encoding:'utf8',windowsHide:true});if(found.status===0)php=found.stdout.trim().split(/\r?\n/)[0];else if(process.platform==='win32'&&fs.existsSync('C:/xampp/php/php.exe'))php='C:/xampp/php/php.exe';}
if(php&&!path.isAbsolute(php))throw Error('PHP path must be an absolute executable path.');
module.exports={home,port,php,registry:path.join(home,'projects.json'),instance:crypto.createHash('sha256').update(home).digest('hex').slice(0,20)};
