/**
 * BAGIAN CLIENT (app.js)
 */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxo3HLbiIm9L5oxghrqQ7lkp-v2sf0-luLawQNDGqTLtAOqMWdFk_huG8ZTvO-xRPnu/exec";

document.addEventListener('DOMContentLoaded', () => {
    const btnSubmit = document.getElementById('btn-submit');
    const fileInput = document.getElementById('file-input');
    const preview = document.getElementById('preview');
    const mandatoryInputs = document.querySelectorAll('.mandatory');
    let base64Image = "";

    // 1. Kompresi Foto agar ringan
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Swal.fire({ title: 'Memproses Foto...', didOpen: () => Swal.showLoading() });

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const scale = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scale;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                base64Image = canvas.toDataURL('image/jpeg', 0.7);
                preview.src = base64Image;
                preview.style.display = 'block';
                Swal.close();
                validate();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    const validate = () => {
        let filled = true;
        mandatoryInputs.forEach(input => { if (input.value.trim() === "") filled = false; });
        btnSubmit.disabled = !(filled && base64Image !== "");
    };

    mandatoryInputs.forEach(input => input.addEventListener('input', validate));

    // 2. Kirim Data
    btnSubmit.addEventListener('click', async () => {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = "Mengirim...";

        const payload = {
            nama: document.getElementById('nama').value,
            toko: document.getElementById('toko').value,
            rak: document.getElementById('rak').value,
            checklist: {
                planogram: document.getElementById('check-plano').checked,
                kebersihan: document.getElementById('check-bersih').checked,
                labelPrice: document.getElementById('check-label').checked,
                cekExp: document.getElementById('check-exp').checked
            },
            foto: base64Image
        };

        try {
            // Menggunakan FETCH dengan method POST
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Menghindari masalah CORS
                body: JSON.stringify(payload)
            });

            // Tampilkan Notifikasi di Tengah
            Swal.fire({
                icon: 'success',
                title: 'BERHASIL!',
                text: 'Data telah masuk ke Google Sheet.',
                confirmButtonColor: '#007bff'
            }).then(() => window.location.reload());

        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'GAGAL!',
                text: 'Terjadi kesalahan sistem.'
            });
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = "KIRIM DATA";
        }
    });
});
