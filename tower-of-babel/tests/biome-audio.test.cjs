'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
let context,oscillators=[],buffers=[],nodes=[];
const parameter=()=>({value:0,events:[],setValueAtTime(v,t){this.events.push([v,t])},linearRampToValueAtTime(v,t){this.events.push([v,t])},exponentialRampToValueAtTime(v,t){this.events.push([v,t])},setTargetAtTime(v,t){this.events.push([v,t])}});
const node=()=>{const n={gain:parameter(),frequency:parameter(),detune:parameter(),pan:parameter(),Q:parameter(),connect(){},start(t){this.started=t},stop(t){this.stopped=t}};nodes.push(n);return n};
class AudioContext {
 constructor(){context=this;this.currentTime=0;this.sampleRate=8000;this.state='running';this.destination=node()}
 createGain(){return node()}createDynamicsCompressor(){return node()}createOscillator(){const n=node();oscillators.push(n);return n}createBiquadFilter(){return node()}createStereoPanner(){return node()}createBufferSource(){const n=node();buffers.push(n);return n}
 createBuffer(_,size){return{getChannelData:()=>new Float32Array(size)}}resume(){return Promise.resolve()}
}
const sandbox={window:{AudioContext},document:{hidden:false,documentElement:{dataset:{}},addEventListener(){}},console,performance:{now:()=>0},setInterval(){},clearInterval(){},queueMicrotask};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../audio.js'),'utf8').replace('window.SkyAudio={','window.audioTest={playBar};window.SkyAudio={'),sandbox);
(async()=>{
 const a=sandbox.window.SkyAudio,debug=sandbox.window.__skyStackAudioDebug;
 await a.ensure();const origin=a.rhythm().epoch,bar=debug().bar;
 a.setNightMix(.7);a.setBiome({mountains:0,plains:0,jungle:4,ocean:0});
 assert.equal(debug().biome.target.jungle,1,'normalized biome input');assert.equal(debug().biome.mix.mountains,1,'no instant boundary jump');
 context.currentTime=1;sandbox.window.audioTest.playBar(0,1.1);
 assert.ok(debug().biome.mix.jungle>0&&debug().biome.mix.jungle<.5,'gentle transition');
 context.currentTime=30;sandbox.window.audioTest.playBar(0,30.1);assert.ok(debug().biome.mix.jungle>.999,'settles into new region');
 assert.equal(debug().nightMix,.7);assert.equal(a.rhythm().epoch,origin);assert.equal(a.rhythm().bpm,72);assert.equal(debug().bar,bar,'biome changes do not restart or advance score');
 const signatures=[];
 for(const biome of ['mountains','plains','jungle','ocean']){
  a.setBiome(biome);context.currentTime+=60;oscillators=[];sandbox.window.audioTest.playBar(3,context.currentTime+.1);
  signatures.push(JSON.stringify(oscillators.map(o=>[o.type,o.frequency.value,o.started-context.currentTime,o.stopped-o.started])));
 }
 assert.equal(new Set(signatures).size,4,'each region has a distinct arrangement');
 a.setBiome({mountains:NaN,plains:-1,jungle:Infinity});assert.equal(debug().biome.target.mountains,1,'invalid inputs fall back to spawn score');
 for(const species of ['bird','butterfly','worm','mole','rabbit','firefly']){
  context.currentTime+=1;const before=oscillators.length+buffers.length;
  assert.equal(a.animalSound(species,.6),true);assert.ok(oscillators.length+buffers.length>before,'sound exists for '+species);
  assert.equal(a.animalSound(species,.6),false,'short repeat guard');
 }
 assert.equal(debug().animalCues,6);assert.equal(a.animalSound('unknown'),false);
 a.setSfxEnabled(false);context.currentTime+=1;const muted=oscillators.length+buffers.length;assert.equal(a.animalSound('bird'),false);assert.equal(oscillators.length+buffers.length,muted);
 assert.equal(debug().animalCues,6);a.setSfxEnabled(true);assert.equal(a.animalSound('bird'),true);
 for(const n of nodes)for(const p of ['gain','frequency','detune','pan','Q'])for(const [v,t]of n[p].events){assert.ok(Number.isFinite(v));assert.ok(Number.isFinite(t));}
 console.log('PASS four biome arrangements, smooth normalized blending, night mix and 72 BPM clock unchanged; six bounded animal sounds and SFX mute.');
})().catch(e=>{console.error(e);process.exitCode=1});
