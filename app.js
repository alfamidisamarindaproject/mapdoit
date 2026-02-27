// URL Web App dari Google Apps Script
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxo3HLbiIm9L5oxghrqQ7lkp-v2sf0-luLawQNDGqTLtAOqMWdFk_huG8ZTvO-xRPnu/exec';

document.addEventListener('DOMContentLoaded', () => {
    const btnSubmit = document.getElementById('btn-submit');
    const fileInput = document.getElementById('file-input');
    const imgPreview = document.getElementById('img-preview');
    const instruction = document.getElementById('instruction');
    const fileInfo = document.getElementById('file-info');
    const mandatoryInputs = document.querySelectorAll('.mandatory');

    let base64Image = "";

    // 1. Fungsi Validasi Real-time
    // Mengecek apakah semua input teks sudah terisi dan foto sudah diupload
    function validateForm() {
        let allFilled = true;
        mandatoryInputs.forEach(input => {
            if (input.value.trim() === "") allFilled = false;
        });

        // Tombol Aktif jika (Input Identitas Lengkap) DAN (Foto sudah ada)
        btnSubmit.disabled = !(allFilled && base64Image !== "");
    }

    // Pasang listener pada setiap input mandatory (Nama, Toko, Rak)
    mandatoryInputs.forEach(input => {
        input.addEventListener('input', validateForm);
    });

    // 2. Handler Ambil Gambar & Konversi ke Base64
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Validasi ukuran file (opsional, contoh: max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert("Ukuran foto terlalu besar! Maksimal 5MB.");
                this.value = "";
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                base64Image = event.target.result; // Data gambar dalam format teks base64
                imgPreview.src = base64Image;
                imgPreview.style.display = 'block';
                instruction.style.display = 'none';
                fileInfo.textContent = "Foto siap: " + file.name;
                validateForm(); // Cek validasi kembali setelah foto masuk
            };
            reader.readAsDataURL(file);
        }
    });

    // 3. Fungsi Kirim Data saat Tombol diklik
    btnSubmit.addEventListener('click', async () => {
        // Berikan visual loading pada tombol
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sedang Mengirim...`;

        // Susun data yang akan dikirim (Payload)
        const payload = {
            nama: document.getElementById('nama').value,
            toko: document.getElementById('toko').value,
            rak: document.getElementById('rak').value,
            checklist: {
                planogram: document.getElementById('check-planogram').checked,
                kebersihan: document.getElementById('check-kebersihan').checked,
                labelPrice: document.getElementById('check-label').checked,
                cekExp: document.getElementById('check-exp').checked
            },
            foto: base64Image
        };

        try {
            // Kirim data ke Google Apps Script menggunakan fetch
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Penting agar tidak terblokir kebijakan CORS Google
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            // Berikan notifikasi sukses
            alert("SUKSES! Data Laporan Anda berhasil terkirim ke Google Sheets.");
            
            // Refresh halaman agar form bersih kembali
            location.reload();

        } catch (error) {
            console.error('Terjadi kesalahan:', error);
            alert("Gagal mengirim data. Silakan cek koneksi internet Anda atau hubungi admin.");
            
            // Kembalikan tombol ke kondisi normal jika gagal
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = "KIRIM DATA ONLINE";
        }
    });
});
