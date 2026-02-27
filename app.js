// PENTING: Ganti URL ini dengan URL Web App dari Google Apps Script Anda
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxo3HLbiIm9L5oxghrqQ7lkp-v2sf0-luLawQNDGqTLtAOqMWdFk_huG8ZTvO-xRPnu/exec';

document.addEventListener('DOMContentLoaded', () => {
    const btnSubmit = document.getElementById('btn-submit');
    const fileInput = document.getElementById('file-input');
    const imgPreview = document.getElementById('img-preview');
    const instruction = document.getElementById('instruction');
    const fileInfo = document.getElementById('file-info');
    const mandatoryInputs = document.querySelectorAll('.mandatory');

    let base64Image = "";

    // 1. Fungsi Validasi (Tombol aktif jika Nama, Toko, Rak, dan Foto terisi)
    function validate() {
        let isFilled = true;
        mandatoryInputs.forEach(input => {
            if (input.value.trim() === "") isFilled = false;
        });

        btnSubmit.disabled = !(isFilled && base64Image !== "");
    }

    // Pantau input teks
    mandatoryInputs.forEach(input => {
        input.addEventListener('input', validate);
    });

    // 2. Fungsi Proses Gambar
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Validasi ukuran file (maks 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert("Ukuran foto terlalu besar! Maksimal 5MB.");
                this.value = "";
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                base64Image = event.target.result;
                imgPreview.src = base64Image;
                imgPreview.style.display = 'block';
                instruction.style.display = 'none';
                fileInfo.textContent = "Foto siap diupload: " + file.name;
                validate();
            };
            reader.readAsDataURL(file);
        }
    });

    // 3. Fungsi Kirim Data ke Google
    btnSubmit.addEventListener('click', async () => {
        // Ubah tampilan tombol saat loading
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Mengirim Data...`;

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
            foto: base64Image,
            waktu: new Date().toLocaleString('id-ID')
        };

        try {
            // Kirim data menggunakan Fetch API
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Menghindari masalah CORS di Apps Script
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // Karena mode 'no-cors', kita tidak bisa baca body response, 
            // jadi kita asumsikan sukses jika tidak masuk ke catch.
            alert("BERHASIL! Data dan Foto sudah terkirim ke Area Coordinator.");
            location.reload();

        } catch (error) {
            console.error('Error:', error);
            alert("Gagal mengirim data. Periksa koneksi internet Anda.");
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = "KIRIM DATA ONLINE";
        }
    });
});
