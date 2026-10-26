const {parentPort,workerData}=require('node:worker_threads');
try{const {scan}=require('./server.cjs');scan(workerData);parentPort.postMessage({result:workerData});}catch(e){parentPort.postMessage({error:e.message});}
