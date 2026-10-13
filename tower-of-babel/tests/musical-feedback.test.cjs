const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
let context,oscillators=[],gains=[];
const parameter=()=>({value:0,events:[],setValueAtTime(v,t){this.events.push([v,t])},linearRampToValueAtTime(v,t){this.events.push([v,t])},exponentialRampToValueAtTime(v,t){this.events.push([v,t])},setTargetAtTime(v,t){this.events.push([v,t])}});
const node=()=>({gain:parameter(),frequency:parameter(),detune:parameter(),pan:parameter(),Q:parameter(),connect(){},start(t){this.started=t},stop(t){this.stopped=t}});
class AudioContext{
 constructor(){context=this;this.currentTime=0;this.sampleRate=8000;this.state='running';this.destination=node()}
 createGain(){const n=node();gains.push(n);return n}createDynamicsCompressor(){return node()}createOscillator(){const n=node();oscillators.push(n);return n}createBiquadFilter(){return node()}createStereoPanner(){return node()}createBufferSource(){return node()}
 createBuffer(_,size){return {getChannelData:()=>new Float32Array(size)}}resume(){return Promise.resolve()}
}
const sandbox={window:{AudioContext},document:{hidden:false,documentElement:{dataset:{}},addEventListener(){}},console,performance:{now:()=>0},setInterval(){},clearInterval(){},queueMicrotask};
vm.createContext(sandbox);
const source=fs.readFileSync(path.join(__dirname,'../audio.js'),'utf8');
vm.runInContext(source,sandbox);
(async()=>{
 const a=sandbox.window.SkyAudio;await a.ensure();const origin=sandbox.window.__skyStackAudioDebug().automation.beatOrigin,beat=60/72;
 context.currentTime=origin+beat*1.3;oscillators=[];
 const d=a.deathCue('creature',1,0,4);assert.equal(d.beatIndex,4);assert.equal(d.time,origin+beat*4);assert.equal(d.end,d.time+beat*4);assert(oscillators.every(o=>o.started===d.time),'all death attacks start on 1');
 assert(a.miningError('stone'));assert(!a.miningError('buried'),'held attempts limited to a quarter-note slot');
 context.currentTime=origin+beat*4.1;const next=a.deathCue('fey',1,0,0);assert.equal(next.beatIndex,8);assert.equal(next.end,next.time);
 a.setSfxEnabled(false);oscillators=[];assert(a.deathCue('worker',1,0,2));assert.equal(oscillators.length,0);assert(!a.miningError());
 await a.setPaused(true);assert.equal(a.deathCue(),null);assert(!a.miningError());
 console.log('PASS next-bar death attacks, musical durations, muted visual clock, mining debounce and pause');
})().catch(e=>{console.error(e);process.exitCode=1});
