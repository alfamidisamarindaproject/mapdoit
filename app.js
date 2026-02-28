const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxo3HLbiIm9L5oxghrqQ7lkp-v2sf0-luLawQNDGqTLtAOqMWdFk_huG8ZTvO-xRPnu/exec";

document.addEventListener('DOMContentLoaded', () => {
    const btnSubmit = document.getElementById('btn-submit');
    const fileInput = document.getElementById('file-input');
    const imgPreview = document.getElementById('img-preview');
    const mandatoryInputs = document.querySelectorAll('.mandatory');
    let base64Image = "";

    // --- LOGIKA KOMPRESI FOTO ---
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; // Ukuran aman agar tidak gagal kirim
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Mengubah gambar ke JPEG kualitas 70% agar ringan (sekitar 100-200kb)
                base64Image = canvas.toDataURL('image/jpeg', 0.7);
                imgPreview.src = base64Image;
                imgPreview.style.display = 'block';
                document.getElementById('instruction').style.display = 'none';
                checkForm();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    function checkForm() {
        let isComplete = true;
        mandatoryInputs.forEach(input => { if (input.value.trim() === "") isComplete = false; });
        btnSubmit.disabled = !(isComplete && base64Image !== "");
    }

    mandatoryInputs.forEach(input => input.addEventListener('input', checkForm));

    // --- LOGIKA KIRIM DATA ---
    btnSubmit.addEventListener('click', async () => {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = "Sedang Mengirim...";

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
            // Menggunakan mode no-cors karena Google Apps Script sering bermasalah dengan CORS
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify(payload)
            });

            alert("BERHASIL! Data sudah masuk ke Google Sheets.");
            location.reload();
        } catch (err) {
            alert("Terjadi kesalahan koneksi.");
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = "KIRIM DATA ONLINE";
        }
    });
});
