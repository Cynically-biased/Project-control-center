const {parentPort}=require('node:worker_threads');module.exports=(stage,checked)=>parentPort?.postMessage({progress:{stage,checked}});
