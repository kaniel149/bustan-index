/* Media loads on request; diagrams, alternatives and learning prompts work offline. */
(() => {
  function videoUrl(id, lang, origin) {
    if (!/^[\w-]{11}$/.test(id)) return null;
    const url=new URL('https://www.youtube-nocookie.com/embed/'+id);
    const language=['en','he','th'].includes(lang)?lang:'en';
    Object.entries({autoplay:'1',rel:'0',hl:language,cc_load_policy:'1',cc_lang_pref:language}).forEach(([k,v])=>url.searchParams.set(k,v));
    if(/^https?:\/\//.test(origin))url.searchParams.set('origin',origin);
    return url.href;
  }
  if(typeof module!=='undefined')module.exports={videoUrl};
  if(typeof document==='undefined')return;
  document.addEventListener('DOMContentLoaded',()=>{
    const lang=()=>document.body.dataset.lang||'en';
    const tr=(en,he,th)=>({en,he,th})[lang()]||en;
    let dialog,opener;
    function close(){dialog?.close();opener?.focus();}
    function enlarge(button){
      opener=button;const figure=button.closest('figure'),source=figure.querySelector('[data-diagram]');
      if(!dialog){dialog=document.createElement('dialog');dialog.className='diagram-dialog';dialog.innerHTML='<button type="button" class="btn diagram-close"></button><img><p></p>';document.body.appendChild(dialog);dialog.querySelector('button').addEventListener('click',close);dialog.addEventListener('click',e=>{if(e.target===dialog)close()});dialog.addEventListener('close',()=>opener?.focus());}
      const mobile=window.matchMedia('(max-width:600px)').matches;
      dialog.querySelector('img').src=`../media/diagrams/${source.dataset.diagram}-${lang()}${mobile?'-mobile':''}.svg`;
      dialog.querySelector('img').alt=source.alt;
      dialog.querySelector('p').textContent=figure.querySelector('figcaption').innerText;
      dialog.querySelector('button').textContent=tr('Close image','סגירת התמונה','ปิดภาพ');
      dialog.setAttribute('aria-label',source.alt);dialog.showModal();
    }
    document.querySelectorAll('[data-enlarge-diagram]').forEach(button=>button.addEventListener('click',()=>enlarge(button)));
    document.querySelectorAll('[data-play-video]').forEach(button=>button.addEventListener('click',()=>{
      const section=button.closest('[data-video-id]'),url=videoUrl(section.dataset.videoId,lang(),location.origin);
      if(!url)return;
      const iframe=document.createElement('iframe');iframe.src=url;iframe.title=section.querySelector('.source-video-title').textContent;
      iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';
      section.querySelector('.video-stage').replaceChildren(iframe);iframe.focus();
    }));
    function filterLibrary(){
      const input=document.getElementById('media-query');if(!input)return;
      const query=input.value.trim().toLocaleLowerCase(),audio=document.getElementById('media-audio').value;
      const cards=[...document.querySelectorAll('[data-media-card]')];let count=0;
      cards.forEach(card=>{const show=(!query||card.textContent.toLocaleLowerCase().includes(query))&&(audio==='all'||card.dataset.audio===audio);card.hidden=!show;if(show)count++});
      document.getElementById('media-result-count').textContent=tr(`Videos found: ${count}`,`סרטונים שנמצאו: ${count}`, `พบ ${count} วิดีโอ`);
    }
    document.getElementById('media-filters')?.addEventListener('submit',e=>e.preventDefault());
    document.getElementById('media-query')?.addEventListener('input',filterLibrary);
    document.getElementById('media-audio')?.addEventListener('change',filterLibrary);
    function refresh(){
      filterLibrary();
      document.querySelectorAll('[data-diagram]').forEach(img=>{img.src=`../media/diagrams/${img.dataset.diagram}-${lang()}.svg`;img.alt=img.getAttribute('data-alt-'+lang())||img.getAttribute('data-alt-en')});
      document.querySelectorAll('[data-diagram-source]').forEach(source=>{source.srcset=`../media/diagrams/${source.dataset.diagramSource}-${lang()}-mobile.svg`});
      document.querySelectorAll('[data-play-video]').forEach(button=>button.setAttribute('aria-label',tr('Play video: ','הפעלת הסרטון: ','เล่นวิดีโอ: ')+button.closest('section').querySelector('.source-video-title').textContent));
      document.querySelectorAll('[data-component-image]').forEach(img=>img.alt=tr('Top left: solar panel. Top right: inverter. Bottom left: battery. Bottom right: electricity meter. Conceptual identification illustration.','למעלה משמאל פאנל, למעלה מימין ממיר, למטה משמאל סוללה ולמטה מימין מונה חשמל. איור המחשה לזיהוי רכיבים.','ซ้ายบนแผงโซลาร์ ขวาบนอินเวอร์เตอร์ ซ้ายล่างแบตเตอรี่ ขวาล่างมิเตอร์ ภาพประกอบเพื่อรู้จักอุปกรณ์'));
      if(dialog?.open)close();
    }
    document.addEventListener('academy:lang',refresh);refresh();
  });
})();
