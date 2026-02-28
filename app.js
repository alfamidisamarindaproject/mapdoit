// GANTI DENGAN URL WEB APP TERBARU DARI GOOGLE APPS SCRIPT
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxo3HLbiIm9L5oxghrqQ7lkp-v2sf0-luLawQNDGqTLtAOqMWdFk_huG8ZTvO-xRPnu/exec";

document.addEventListener('DOMContentLoaded', () => {
    const btnSubmit = document.getElementById('btn-submit');
    const btnText = document.getElementById('btn-text');
    const fileInput = document.getElementById('file-input');
    const imgPreview = document.getElementById('img-preview');
    const instruction = document.getElementById('instruction');
    const mandatoryInputs = document.querySelectorAll('.mandatory');
    
    let base64Image = "";

    // --- FUNGSI KOMPRESI GAMBAR ---
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; // Ukuran lebar maksimal agar file ringan
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Ubah ke JPEG kualitas 0.7 (70%) agar file sangat kecil (~150kb)
                base64Image = canvas.toDataURL('image/jpeg', 0.7);
                
                imgPreview.src = base64Image;
                imgPreview.style.display = 'block';
                instruction.style.display = 'none';
                validateForm();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

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

    // --- PROSES KIRIM DATA ---
    btnSubmit.addEventListener('click', async () => {
        btnSubmit.disabled = true;
        btnText.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Mengirim...`;

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
            // Mode 'no-cors' digunakan untuk menghindari kendala keamanan browser saat ke domain Google
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            alert("LAPORAN BERHASIL TERKIRIM!");
            window.location.reload();

        } catch (error) {
            console.error('Error:', error);
            alert("Gagal mengirim data. Cek koneksi internet.");
            btnSubmit.disabled = false;
            btnText.innerHTML = "KIRIM DATA ONLINE";
        }
    });
});
