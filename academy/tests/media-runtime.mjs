import vm from 'node:vm';
import assert from 'node:assert/strict';
import {read} from './_util.mjs';
const context={module:{exports:{}},URL};
vm.runInNewContext(read('academy/assets/media-learning.js'),context);
const {videoUrl}=context.module.exports;
for(const language of ['en','he','th']){
 const url=new URL(videoUrl('0elhIcPVtKE',language,'https://index.bustan-energy.com'));
 assert.equal(url.origin,'https://www.youtube-nocookie.com');
 assert.equal(url.pathname,'/embed/0elhIcPVtKE');
 assert.equal(url.searchParams.get('hl'),language);
 assert.equal(url.searchParams.get('cc_lang_pref'),language);
 assert.equal(url.searchParams.get('origin'),'https://index.bustan-energy.com');
}
for(const id of ['', '../bad/path', 'bad<script>', 'https://youtube.com/watch?v=0elhIcPVtKE'])assert.equal(videoUrl(id,'en','https://example.test'),null);
const fallback=new URL(videoUrl('XSKoPKO3vK8','xx','file:///private/project'));
assert.equal(fallback.searchParams.get('hl'),'en');assert.equal(fallback.searchParams.has('origin'),false);
console.log('media runtime: valid video embeds use privacy domain, preserve language and reject malformed video IDs');
