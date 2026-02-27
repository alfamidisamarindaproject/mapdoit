// GANTI DENGAN URL WEB APP HASIL DEPLOY GOOGLE APPS SCRIPT ANDA
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxo3HLbiIm9L5oxghrqQ7lkp-v2sf0-luLawQNDGqTLtAOqMWdFk_huG8ZTvO-xRPnu/exec";

document.addEventListener('DOMContentLoaded', () => {
    const btnSubmit = document.getElementById('btn-submit');
    const fileInput = document.getElementById('file-input');
    const imgPreview = document.getElementById('img-preview');
    const instruction = document.getElementById('instruction');
    const fileInfo = document.getElementById('file-info');
    const mandatoryInputs = document.querySelectorAll('.mandatory');

    let base64Image = "";

    // 1. Fungsi Validasi Real-time
    function validateForm() {
        let allFilled = true;
        mandatoryInputs.forEach(input => {
            if (input.value.trim() === "") allFilled = false;
        });

        // Tombol aktif jika Nama, Toko, Rak terisi DAN Foto sudah terpilih
        btnSubmit.disabled = !(allFilled && base64Image !== "");
    }

    // Pantau setiap perubahan pada input teks
    mandatoryInputs.forEach(input => {
        input.addEventListener('input', validateForm);
    });

    // 2. Fungsi Menangkap File & Konversi ke Base64
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Validasi ukuran (Opsional: maks 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert("File terlalu besar, maksimal 5MB");
                this.value = "";
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                base64Image = event.target.result;
                imgPreview.src = base64Image;
                imgPreview.style.display = 'block';
                instruction.style.display = 'none';
                fileInfo.textContent = "Foto berhasil dipilih: " + file.name;
                validateForm();
            };
            reader.readAsDataURL(file);
        }
    });

    // 3. Fungsi Kirim Data
    btnSubmit.addEventListener('click', async () => {
        // Efek loading pada tombol
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Sedang Mengirim...`;

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
            // Mengirim ke Google Apps Script
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Mode no-cors penting untuk pengiriman ke Google Script
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // Karena mode no-cors, kita anggap sukses jika tidak masuk ke catch
            alert("SUKSES! Data berhasil disimpan ke Sheet 'Data'.");
            location.reload(); // Refresh halaman setelah sukses

        } catch (error) {
            console.error('Error:', error);
            alert("Gagal mengirim data. Pastikan koneksi internet stabil.");
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = "KIRIM DATA ONLINE";
        }
    });
});
