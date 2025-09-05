// 1. CONFIG (ganti dengan URL baru Anda, pastikan tanpa spasi)
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxx/exec';

// 2. UI HELPER ----------
const showLoading = () => document.getElementById('loadingOverlay').style.display = 'flex';
const hideLoading = () => document.getElementById('loadingOverlay').style.display = 'none';
function showStatus(el, msg, type) {
  const node = document.getElementById(el);
  node.textContent = msg; node.className = `status-message ${type}`; node.style.display = 'block';
}
function clearStatus(el) { const node = document.getElementById(el); node.textContent = ''; node.style.display = 'none'; }

// 3. CEK NIK ----------
async function checkNIK() {
  const nik = document.getElementById('nikInput').value.trim();
  if (!nik || nik.length !== 16 || !/^\d+$/.test(nik)) {
    showStatus('nikStatus', 'NIK harus 16 digit angka!', 'error');
    return;
  }
  showLoading();
  try {
    const res = await fetch(`${SCRIPT_URL}?action=checkNIK&nik=${nik}`);
    const o = await res.json();
    if (o.success) {
      if (o.found) { fillForm(o.data); showStatus('nikStatus','Data ditemukan!','success'); }
      else { clearForm(); document.getElementById('nikDisplay').value = nik; showStatus('nikStatus','NIK belum terdaftar','info'); }
      document.getElementById('registrationForm').style.display = 'block';
    } else { showStatus('nikStatus','Error: '+o.message,'error'); }
  } catch (e) { showStatus('nikStatus','Error koneksi: '+e.message,'error'); }
  hideLoading();
}
function fillForm(d) {
  document.getElementById('nikDisplay').value = d.nik;
  document.getElementById('nama').value       = d.nama;
  document.getElementById('instansi').value   = d.instansi;
  document.getElementById('email').value      = d.email;
  document.getElementById('noTelp').value     = d.noTelp;
  document.getElementById('profesi').value    = d.profesi;
}
function clearForm() {
  ['nama','instansi','email','noTelp','profesi'].forEach(id=>document.getElementById(id).value='');
}

// 4. SUBMIT ----------
document.getElementById('registrationForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const d = {
    nik: document.getElementById('nikDisplay').value,
    nama: document.getElementById('nama').value,
    instansi: document.getElementById('instansi').value,
    email: document.getElementById('email').value,
    noTelp: document.getElementById('noTelp').value,
    profesi: document.getElementById('profesi').value
  };
  if (!Object.values(d).every(v=>v.trim())) { showStatus('submitStatus','Isian belum lengkap!','error'); return; }
  showLoading();
  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({action:'register', data:d})
    });
    const o = await res.json();
    if (o.success) {
      showStatus('submitStatus','Data berhasil disimpan!','success');
      document.getElementById('registrationForm').reset();
      document.getElementById('registrationForm').style.display = 'none';
      document.getElementById('nikInput').value='';
      clearStatus('nikStatus');
    } else { showStatus('submitStatus','Error: '+o.message,'error'); }
  } catch (e) { showStatus('submitStatus','Error koneksi: '+e.message,'error'); }
  hideLoading();
});
