// 1. CONFIG (tanpa spasi di akhir!)
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwARtAqCMzRtowOiKbkcQNb7QIjZBuNxjnTCFnyoeK6Vy_C98iO_MhgK5o727GZchm0/exec';

// 2. UI HELPER -------------------------------------------------
function showLoading() {
  document.getElementById('loadingOverlay').style.display = 'flex';
}
function hideLoading() {
  document.getElementById('loadingOverlay').style.display = 'none';
}
function showStatus(elId, msg, type) {
  const el = document.getElementById(elId);
  el.textContent = msg;
  el.className = `status-message ${type}`;
  el.style.display = 'block';
}
function clearStatus(elId) {
  const el = document.getElementById(elId);
  el.textContent = '';
  el.style.display = 'none';
}

// 3. CEK NIK ---------------------------------------------------
async function checkNIK() {
  const nik = document.getElementById('nikInput').value.trim();

  if (!nik) return showStatus('nikStatus', 'NIK tidak boleh kosong!', 'error');
  if (nik.length !== 16) return showStatus('nikStatus', 'NIK harus 16 digit!', 'error');
  if (!/^\d+$/.test(nik)) return showStatus('nikStatus', 'NIK hanya boleh angka!', 'error');

  showLoading();

  try {
    const endpoint = `${SCRIPT_URL}?action=checkNIK&nik=${nik}`;
    console.log('Fetching:', endpoint);          // untuk debug
    const res = await fetch(endpoint);
    const data = await res.json();

    if (data.success) {
      if (data.found) {
        showStatus('nikStatus', 'Data ditemukan! Form terisi otomatis.', 'success');
        fillForm(data.data);
        document.getElementById('submitBtn').textContent = 'Submit Registrasi Ulang';
      } else {
        showStatus('nikStatus', 'NIK belum terdaftar. Silakan isi data lengkap.', 'info');
        clearForm();
        document.getElementById('nikDisplay').value = nik;
        document.getElementById('submitBtn').textContent = 'Daftar Baru';
      }
      document.getElementById('registrationForm').style.display = 'block';
    } else {
      showStatus('nikStatus', 'Error: ' + data.message, 'error');
    }
  } catch (err) {
    console.error(err);
    showStatus('nikStatus', 'Error koneksi: ' + err.message, 'error');
  }
  hideLoading();
}

// 4. ISI / BERSIHKAN FORM -------------------------------------
function fillForm(d) {
  document.getElementById('nikDisplay').value = d.nik;
  document.getElementById('nama').value = d.nama;
  document.getElementById('instansi').value = d.instansi;
  document.getElementById('email').value = d.email;
  document.getElementById('noTelp').value = d.noTelp;
  document.getElementById('profesi').value = d.profesi;
}
function clearForm() {
  document.getElementById('nama').value = '';
  document.getElementById('instansi').value = '';
  document.getElementById('email').value = '';
  document.getElementById('noTelp').value = '';
  document.getElementById('profesi').value = '';
}

// 5. SUBMIT FORM ----------------------------------------------
document.getElementById('registrationForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    nik: document.getElementById('nikDisplay').value,
    nama: document.getElementById('nama').value,
    instansi: document.getElementById('instansi').value,
    email: document.getElementById('email').value,
    noTelp: document.getElementById('noTelp').value,
    profesi: document.getElementById('profesi').value,
  };

  if (!Object.values(formData).every(v => v.trim())) {
    return showStatus('submitStatus', 'Semua field harus diisi!', 'error');
  }

  showLoading();
  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', data: formData })
    });
    const result = await res.json();

    if (result.success) {
      showStatus('submitStatus', 'Registrasi berhasil! Terima kasih.', 'success');
      document.getElementById('registrationForm').reset();
      document.getElementById('registrationForm').style.display = 'none';
      document.getElementById('nikInput').value = '';
      clearStatus('nikStatus');
    } else {
      showStatus('submitStatus', 'Error: ' + result.message, 'error');
    }
  } catch (err) {
    console.error(err);
    showStatus('submitStatus', 'Error koneksi: ' + err.message, 'error');
  }
  hideLoading();
});

// 6. OPSI AUTO-CHECK BILA 16 DIGIT ----------------------------
document.getElementById('nikInput').addEventListener('input', (e) => {
  if (e.target.value.length === 16) {
    // uncomment baris di bawah untuk auto-check
    // checkNIK();
  }
});

