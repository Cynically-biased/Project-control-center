const fs=require('node:fs'),path=require('node:path');
const source=/\.(?:php\d?|phtml|js|mjs|cjs|ts|tsx|jsx|py|html?|css|scss|less|xml|svg|ya?ml|toml|jsonc?|vue|svelte|go|rs|java|cs|rb|webmanifest)$/i;
const data=/\.(?:sql|sqlite3?|db|dump|bak|pem|key|p12|pfx|kdbx|log|csv|tsv|xlsx?|parquet)$/i;
function excluded(name,directory,relative=''){
 if(/^(?:database|db)[\\/]/i.test(relative)&&! /^(?:database|db)[\\/](?:migrations?|migrate)(?:[\\/]|$)/i.test(relative))return true;
 if(/^\.env|^\.(?:git|project-monitoring|npmrc|pypirc|netrc)$|secret|credential|api.?key/i.test(name)||data.test(name))return true;
 if(directory&&/^(?:private|uploads?|storage|databases|data|logs?|backups?|dumps?|customers?|client.?data)$/i.test(name))return true;
 if(!directory&&/\.(?:jsonc?|ya?ml|toml|ini|txt|conf|config)$/i.test(name)&&/(?:private|password|passwd|customer|client.?data|database|connection|auth|storage|upload|backup)/i.test(name))return true;
 if(!directory&&(/(?:password|passwd|customer|client.?data|backup|dump)/i.test(name)&&!source.test(name)))return true;
 // Connection configuration can contain credentials. Database service source elsewhere remains eligible.
 if(/(?:^|[\\/])config[\\/](?:database|db|connections?)\./i.test(relative)||/^(?:database|db|connection)(?:[._-]config)?\.(?:php|json|ya?ml|toml)$/i.test(relative))return true;
 return false;
}
function safePath(root,relative){root=path.resolve(root);const full=path.resolve(root,relative);if(!full.startsWith(root+path.sep))throw Error('Path outside project');const parts=path.relative(root,full).split(path.sep);let at=root;for(let i=0;i<parts.length;i++){at=path.join(at,parts[i]);const st=fs.lstatSync(at);if(st.isSymbolicLink()||excluded(parts[i],st.isDirectory(),parts.slice(0,i+1).join(path.sep)))throw Error('Protected project path');if(i===parts.length-1&&!st.isFile())throw Error('Not a regular file');}return full;}
function read(root,relative,max=1024*1024){const full=safePath(root,relative);if(fs.statSync(full).size>max)throw Error('File exceeds validation size limit');return fs.readFileSync(full,'utf8');}
module.exports={excluded,safePath,read,source};
