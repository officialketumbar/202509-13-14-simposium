/* global CONFIG */
const $  = q => document.querySelector(q);
const $$ = q => document.querySelectorAll(q);

/* ---------- UTIL ---------- */
const luhn16 = str => {
  const d = str.split('').map(Number);
  const last = d.pop();
  const sum = d.reduce((s,n,i)=>{
    const t = (i%2===0?2:1)*n;
    return s + (t>9?t-9:t);
  },0);
  return (10 - (sum%10))%10 === last;
};
const sleep = ms => new Promise(r=>setTimeout(r,ms));

/* ---------- UI ---------- */
const ui = {
  loading: (()=>{
    const ov = $('#loadingOverlay');
    return { on:()=>ov.hidden=false, off:()=>ov.hidden=true };
  })(),
  status:(elId,msg,type='info')=>{
    const node = $(`#${elId}`); if(!node)return;
    node.textContent = msg; node.className = `status ${type}`; node.hidden = !msg;
  },
  toggleForm:(show=false)=> $('#regForm').hidden = !show,
  btnState:(btn,disable=true)=>{
    btn.disabled = disable;
    btn.textContent = disable ? 'Mohon tunggu…' : btn.dataset.default;
  },
  fillForm: d => Object.keys(d).forEach(k=>{ const el=$(`#${k}`); if(el) el.value=d[k]; }),
  clearForm:()=> $$('#regForm input:not([readonly])').forEach(i=>i.value='')
};

/* ---------- API ---------- */
const api = {
  call: async (endpoint,payload=null,timeout=8000)=>{
    const controller = new AbortController();
    const t = setTimeout(()=>controller.abort(),timeout);
    const url = `${CONFIG.GAS_URL}${endpoint}`;
    const opt = payload
      ? {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload), signal:controller.signal}
      : {method:'GET', signal:controller.signal};
    const res = await fetch(url,opt);
    clearTimeout(t);
    if(!res.ok) throw new Error('Network error');
    return res.json();
  }
};

/* ---------- CEK NIK ---------- */
$('#cekBtn').addEventListener('click', async ()=>{
  const input = $('#nikInput');
  const nik   = input.value.trim();
  const btn   = $('#cekBtn');
  if(!/^\d{16}$/.test(nik) || !luhn16(nik)) return ui.status('nikStatus','NIK 16 digit tidak valid','error');
  ui.status('nikStatus');
  ui.btnState(btn,true);
  ui.loading.on();
  try{
    const res = await api.call(`?action=checkNIK&nik=${nik}`);
    if(!res.success) throw new Error(res.message);
    if(res.found) ui.fillForm(res.data);
    else{
      ui.clearForm();
      $('#nikDisplay').value = nik;
      ui.status('nikStatus','NIK belum terdaftar, silakan lengkapi form','info');
    }
    ui.toggleForm(true);
  }catch(e){
    ui.status('nikStatus', e.message,'error');
  }finally{
    ui.loading.off();
    ui.btnState(btn,false);
  }
});

/* ---------- SUBMIT ---------- */
$('#regForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const payload = Array.from($$('#regForm input')).reduce((o,i)=>({...o,[i.id]:i.value.trim()}),{});
  if(Object.values(payload).some(v=>!v)) return ui.status('submitStatus','Isian belum lengkap','error');
  const btn = $('#submitBtn');
  ui.btnState(btn,true);
  ui.loading.on();
  try{
    const res = await api.call('',{action:'register',data:payload});
    if(!res.success) throw new Error(res.message);
    ui.status('submitStatus','Registrasi ulang berhasil!','success');
    $('#regForm').reset();
    ui.toggleForm(false);
    $('#nikInput').value='';
    ui.status('nikStatus');
    await sleep(2000); // biar pesan terbaca
    ui.status('submitStatus');
  }catch(e){
    ui.status('submitStatus',e.message,'error');
  }finally{
    ui.loading.off();
    ui.btnState(btn,false);
  }
});