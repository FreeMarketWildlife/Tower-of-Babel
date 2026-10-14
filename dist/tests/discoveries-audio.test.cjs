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
context.currentTime=origin+beat*4;oscillators=[];
const id=a.discoveryCue(6,1);assert(id);assert(oscillators.every(o=>o.started===origin+beat*6),'all reward tones attack together on the completing half note');assert(!a.discoveryCue(6,2),'bounded to one reward per half note');
a.cancelDiscoveryCue(id);assert(sandbox.window.__skyStackAudioDebug().discoveryHistory[0].cancelled);
const variants=[];for(let seed=0;seed<4;seed++){context.currentTime=origin+beat*(8+seed*2);assert(a.discoveryCue(8+seed*2,seed));variants.push(sandbox.window.__skyStackAudioDebug().discoveryHistory.at(-1).variant)}assert.equal(new Set(variants).size,4);
assert(!a.discoveryCue(15,1),'only half notes');a.setVolume('sfx',0);assert(!a.discoveryCue(16,1));a.setVolume('sfx',1);await a.setPaused(true);assert(!a.discoveryCue(16,1));
console.log('PASS reward half-note onsets, four chord voicings, cancellation, debounce, Effects mute and pause');
})().catch(e=>{console.error(e);process.exitCode=1});
