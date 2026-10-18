const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
let context,oscillators=[],gains=[];
const parameter=()=>({value:0,events:[],setValueAtTime(v,t){this.events.push([v,t])},linearRampToValueAtTime(v,t){this.events.push([v,t])},exponentialRampToValueAtTime(v,t){this.events.push([v,t])},setTargetAtTime(v,t){this.events.push([v,t])}});
const node=()=>({gain:parameter(),frequency:parameter(),detune:parameter(),pan:parameter(),Q:parameter(),connect(){},disconnect(){},start(t){this.started=t},stop(t){this.stopped=t}});
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
 context.currentTime=origin+beat*1.2;oscillators=[];const small=a.levelReward(1,5),smallCount=oscillators.length;
 assert.equal(small.beatIndex,4);assert.equal(small.time,origin+beat*4);assert.equal(oscillators[0].started,small.time);assert(oscillators.some(o=>o.started>small.time),'level motif unfolds rhythmically, unlike simultaneous discovery shimmer');
 oscillators=[];const large=a.levelReward(3,100);assert(oscillators.length>smallCount);assert.equal(large.beatIndex,small.beatIndex);
 for(const o of oscillators)assert(Math.abs((o.started-origin)/beat*2-Math.round((o.started-origin)/beat*2))<1e-7,'all notes on eighth-note grid');
 a.setVolume('sfx',0);oscillators=[];assert(a.levelReward(2,10));assert.equal(oscillators.length,0,'muted celebrations keep visual plan');await a.setPaused(true);assert.equal(a.levelReward(),null);
 console.log('PASS downbeat level motif, ascending rhythmic identity, larger voice count, score grid, muted visuals and pause');
})().catch(e=>{console.error(e);process.exitCode=1});
