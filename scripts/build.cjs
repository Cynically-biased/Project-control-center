const path=require('node:path');
(async()=>{const {packager}=await import('@electron/packager');const results=await packager({dir:path.resolve(__dirname,'..'),name:'Project Control Center',platform:'win32',arch:'x64',out:path.resolve(__dirname,'../dist'),overwrite:true,asar:false,prune:true,ignore:[/^\/dist(?:\/|$)/,/^\/\.git(?:\/|$)/,/^\/test(?:\/|$)/,/^\/scripts(?:\/|$)/,/^\/(projects|settings|ai-connection)\.json$/,/^\/ai-conversations(?:\/|$)/,/^\/\.project-monitoring(?:\/|$)/,/\.tmp$/]});console.log(results.join('\n'));})().catch(e=>{console.error(e.message);process.exitCode=1;});

