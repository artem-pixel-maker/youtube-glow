(() => {
  const api = window.YHALSettings;
  const KEY = "yhal-v2-local-settings";
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  let settings = api.normalize(readSettings());
  function readSettings(){try{return JSON.parse(localStorage.getItem(KEY)||"null")||api.defaults}catch(_){return api.defaults}}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(settings));}catch(_){} }
  function render(){
    document.documentElement.style.setProperty("--accent",api.themes[settings.theme]);
    document.documentElement.style.setProperty("--accent-soft",api.themes[settings.theme]+"28");
    document.body.dataset.theme=settings.theme;
    document.body.classList.toggle("compact",settings.compact);
    $$('[data-setting]').forEach(input=>input.checked=!!settings[input.dataset.setting]);
    $('#theme').value=settings.theme; $('#intensity').value=settings.intensity; $('#intensity-value').value=settings.intensity+"%"; $('#intensity-value').textContent=settings.intensity+"%";
    $$('.preview-toolbar button').forEach(b=>b.style.borderColor=(b.dataset.preview==="lights"&&settings.lights)||(b.dataset.preview==="focus"&&settings.focus)?api.themes[settings.theme]:"");
    $('.fake-player').style.boxShadow=settings.lights?`inset 0 0 ${Math.round(settings.intensity*.55)}px ${api.themes[settings.theme]}55`:"none";
    $('.fake-progress i').style.width=Math.max(4,settings.intensity)+"%";
    $$('.mobile-nav a').forEach(a=>a.classList.toggle('active',a.hash===location.hash||(!location.hash&&a.hash==="#home")));
  }
  function persist(){settings=api.normalize(settings);save();render();}
  $$('[data-setting]').forEach(input=>input.addEventListener('change',()=>{settings[input.dataset.setting]=input.checked;persist()}));
  $('#theme').addEventListener('change',e=>{settings.theme=e.target.value;persist()});
  $('#intensity').addEventListener('input',e=>{settings.intensity=Number(e.target.value);persist()});
  $('#reset-settings').addEventListener('click',()=>{settings=api.normalize({...api.defaults});persist();announce('Settings reset on this device.')});
  $('#jump-settings').addEventListener('click',()=>$('#settings').scrollIntoView({behavior:'smooth'}));
  $('#open-settings').addEventListener('click',()=>$('#settings').scrollIntoView({behavior:'smooth'}));
  function announce(msg){$('#import-status').textContent=msg;setTimeout(()=>{if($('#import-status').textContent===msg)$('#import-status').textContent=''},3500)}
  function exportSettings(){const blob=new Blob([JSON.stringify({app:"YouTube Highlights and Ambient Lights",version:2,settings},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='youtube-glow-settings.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);announce('Settings exported. Import the file on another device if needed.')}
  $('#export-settings').addEventListener('click',exportSettings);
  $('#import-settings').addEventListener('click',()=>$('#import-file').click());
  $('#import-file').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{const data=JSON.parse(await file.text());settings=api.normalize(data.settings||data);persist();announce('Settings imported successfully.')}catch(_){announce('That file is not a valid Glow settings JSON.')}e.target.value=''});
  $$('.preview-toolbar button').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.preview==='lights'){settings.lights=!settings.lights;persist()}else if(b.dataset.preview==='focus'){settings.focus=!settings.focus;persist()}else announce('Preview only: playback buttons do not control YouTube here.')}));
  window.addEventListener('hashchange',render);
  if('serviceWorker' in navigator && location.protocol!=='file:') window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
  render();
})();
