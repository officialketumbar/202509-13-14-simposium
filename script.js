// Konfigurasi Google Apps Script
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyCJvqm0NdUr72fYUdwX_EyJlk-n-11f1ns7qTkIj5EErgwKhxYUzAG0A4FZXK6HNXl/exec'; // Ganti dengan URL Google Apps Script Anda

// Fungsi untuk menampilkan loading
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

// Fungsi untuk menampilkan status
function showStatus(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `status-message ${type}`;
    element.style.display = 'block';
}

// Fungsi untuk membersihkan status
function clearStatus(elementId) {
    const element = document.getElementById(elementId);
    element.textContent = '';
    element.style.display = 'none';
}

// Fungsi untuk memeriksa NIK
async function checkNIK() {
    const nik = document.getElementById('nikInput').value.trim();
    
    // Validasi NIK
    if (!nik) {
        showStatus('nikStatus', 'NIK tidak boleh kosong!', 'error');
        return;
    }
    
    if (nik.length !== 16) {
        showStatus('nikStatus', 'NIK harus 16 digit!', 'error');
        return;
    }
    
    if (!/^\d+$/.test(nik)) {
        showStatus('nikStatus', 'NIK hanya boleh berisi angka!', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${'https://script.google.com/macros/s/AKfycbyCJvqm0NdUr72fYUdwX_EyJlk-n-11f1ns7qTkIj5EErgwKhxYUzAG0A4FZXK6HNXl/exec'}?action=checkNIK&nik=${nik}`);
        const data = await response.json();
        
        if (data.success) {
            if (data.found) {
                // Data ditemukan, isi form otomatis
                showStatus('nikStatus', 'Data ditemukan! Form akan terisi otomatis.', 'success');
                fillForm(data.data);
                document.getElementById('registrationForm').style.display = 'block';
                document.getElementById('submitBtn').textContent = 'Submit Registrasi Ulang';
            } else {
                // Data tidak ditemukan, form kosong
                showStatus('nikStatus', 'NIK belum terdaftar. Silakan isi data lengkap.', 'info');
                clearForm();
                document.getElementById('nikDisplay').value = nik;
                document.getElementById('registrationForm').style.display = 'block';
                document.getElementById('submitBtn').textContent = 'Daftar Baru';
            }
        } else {
            showStatus('nikStatus', 'Error: ' + data.message, 'error');
        }
    } catch (error) {
        showStatus('nikStatus', 'Error koneksi: ' + error.message, 'error');
    }
    
    hideLoading();
}

// Fungsi untuk mengisi form dengan data
function fillForm(data) {
    document.getElementById('nikDisplay').value = data.nik;
    document.getElementById('nama').value = data.nama;
    document.getElementById('instansi').value = data.instansi;
    document.getElementById('email').value = data.email;
    document.getElementById('noTelp').value = data.noTelp;
    document.getElementById('profesi').value = data.profesi;
}

// Fungsi untuk membersihkan form
function clearForm() {
    document.getElementById('nama').value = '';
    document.getElementById('instansi').value = '';
    document.getElementById('email').value = '';
    document.getElementById('noTelp').value = '';
    document.getElementById('profesi').value = '';
}

// Handle form submission
document.getElementById('registrationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        nik: document.getElementById('nikDisplay').value,
        nama: document.getElementById('nama').value,
        instansi: document.getElementById('instansi').value,
        email: document.getElementById('email').value,
        noTelp: document.getElementById('noTelp').value,
        profesi: document.getElementById('profesi').value
    };
    
    // Validasi form
    if (!Object.values(formData).every(val => val.trim())) {
        showStatus('submitStatus', 'Semua field harus diisi!', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbyCJvqm0NdUr72fYUdwX_EyJlk-n-11f1ns7qTkIj5EErgwKhxYUzAG0A4FZXK6HNXl/exec', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'register',
                data: formData
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showStatus('submitStatus', 'Registrasi berhasil! Terima kasih.', 'success');
            document.getElementById('registrationForm').reset();
            document.getElementById('registrationForm').style.display = 'none';
            document.getElementById('nikInput').value = '';
            clearStatus('nikStatus');
        } else {
            showStatus('submitStatus', 'Error: ' + result.message, 'error');
        }
    } catch (error) {
        showStatus('submitStatus', 'Error koneksi: ' + error.message, 'error');
    }
    
    hideLoading();
});

// Event listener untuk input NIK (opsional: auto-check saat 16 digit terisi)
document.getElementById('nikInput').addEventListener('input', function(e) {
    if (e.target.value.length === 16) {
        // Optional: auto-check setelah 16 digit
        // checkNIK();
    }

});
