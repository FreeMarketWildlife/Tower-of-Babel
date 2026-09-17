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
const source=fs.readFileSync(path.join(__dirname,'../audio.js'),'utf8').replace('window.SkyAudio={','window.audioTest={playBar,scheduleBirds};window.SkyAudio={');
vm.runInContext(source,sandbox);
(async()=>{
 const a=sandbox.window.SkyAudio;await a.ensure();const origin=sandbox.window.__skyStackAudioDebug().automation.beatOrigin;
 const sample=(mix)=>{a.setNightMix(mix);oscillators=[];gains=[];sandbox.window.audioTest.playBar(0,10);return {notes:oscillators.filter(o=>o.frequency.value>20),peaks:gains.flatMap(g=>g.gain.events.map(e=>e[0]))}};
 const day=sample(0),night=sample(1);
 assert.ok(night.notes.length<day.notes.length*.75,'night leaves more silence');
 assert.ok(Math.max(...night.peaks)<Math.max(...day.peaks),'night has softer voices');
 assert.ok(night.notes.some(o=>o.stopped-o.started>2&&o.frequency.value>600),'long singing upper melody');
 assert.ok(!night.notes.some(o=>Math.abs(o.frequency.value-440*2**((38-69)/12))<.01&&o.stopped-o.started<.3),'no daytime pulse at night');
 assert.equal(sandbox.window.__skyStackAudioDebug().arrangement,'nocturne');
 assert.equal(sandbox.window.__skyStackAudioDebug().automation.beatOrigin,origin);assert.equal(a.rhythm().bpm,72);
 oscillators=[];sandbox.window.audioTest.scheduleBirds();assert.equal(oscillators.length,0,'birds rest at night');
 a.setMusicEnabled(false);assert.equal(sandbox.window.__skyStackAudioDebug().nightMix,1);a.setMusicEnabled(true);
 sample(.5);assert.equal(sandbox.window.__skyStackAudioDebug().arrangement,'twilight');
 sample(0);assert.equal(sandbox.window.__skyStackAudioDebug().arrangement,'day');
 a.setNightMix(NaN);assert.equal(sandbox.window.__skyStackAudioDebug().nightMix,0);
 console.log('PASS sparse softer nocturne, sustained melody, twilight blend, unchanged 72 BPM clock, night birds and music toggle');
})().catch(e=>{console.error(e);process.exitCode=1});
