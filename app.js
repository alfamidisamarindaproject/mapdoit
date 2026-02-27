// URL Web App Anda
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxo3HLbiIm9L5oxghrqQ7lkp-v2sf0-luLawQNDGqTLtAOqMWdFk_huG8ZTvO-xRPnu/exec';

document.addEventListener('DOMContentLoaded', () => {
    const btnSubmit = document.getElementById('btn-submit');
    const fileInput = document.getElementById('file-input');
    const imgPreview = document.getElementById('img-preview');
    const mandatoryInputs = document.querySelectorAll('.mandatory');

    let base64Image = "";

    function validateForm() {
        let allFilled = true;
        mandatoryInputs.forEach(input => {
            if (input.value.trim() === "") allFilled = false;
        });
        btnSubmit.disabled = !(allFilled && base64Image !== "");
    }

    mandatoryInputs.forEach(input => {
        input.addEventListener('input', validateForm);
    });

    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                base64Image = event.target.result;
                imgPreview.src = base64Image;
                imgPreview.style.display = 'block';
                document.getElementById('instruction').style.display = 'none';
                validateForm();
            };
            reader.readAsDataURL(file);
        }
    });

    btnSubmit.addEventListener('click', async () => {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Mengirim...`;

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
            // Menggunakan teknik POST dengan mode 'no-cors' agar kompatibel dengan Google Apps Script
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // Karena no-cors tidak memberi respon, kita asumsikan sukses jika tidak masuk ke catch
            alert("BERHASIL! Laporan telah dikirim. Silakan cek Google Sheet.");
            location.reload();

        } catch (error) {
            console.error('Error:', error);
            alert("GAGAL mengirim data. Pastikan Apps Script sudah di-Deploy sebagai 'Anyone'.");
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = "KIRIM DATA ONLINE";
        }
    });
});
