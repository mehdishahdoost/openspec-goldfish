import {mkdir,copyFile,rm} from 'node:fs/promises';
const output=new URL('../.site/',import.meta.url);
await rm(output,{recursive:true,force:true});
await mkdir(new URL('assets/',output),{recursive:true});
for(const file of ['index.html','style.css','script.js'])await copyFile(new URL(`../website/${file}`,import.meta.url),new URL(file,output));
await copyFile(new URL('../assets/goldfish-logo.png',import.meta.url),new URL('assets/goldfish-logo.png',output));
console.log('Static site staged in .site/');
