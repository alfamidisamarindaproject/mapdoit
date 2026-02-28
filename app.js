// GANTI DENGAN URL WEB APP GOOGLE ANDA
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxo3HLbiIm9L5oxghrqQ7lkp-v2sf0-luLawQNDGqTLtAOqMWdFk_huG8ZTvO-xRPnu/exec";

document.addEventListener('DOMContentLoaded', () => {
    const btnSubmit = document.getElementById('btn-submit');
    const btnText = document.getElementById('btn-text');
    const loader = document.getElementById('loader');
    const fileInput = document.getElementById('file-input');
    const imgPreview = document.getElementById('img-preview');
    const instruction = document.getElementById('instruction');
    const mandatoryInputs = document.querySelectorAll('.mandatory');
    
    let base64Image = "";

    // 1. Logika Kompresi Foto (Resize ke 800px)
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Tampilkan loading sebentar saat proses kompresi di HP
        Swal.fire({
            title: 'Memproses Foto...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; 
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                base64Image = canvas.toDataURL('image/jpeg', 0.7);
                
                imgPreview.src = base64Image;
                imgPreview.style.display = 'block';
                instruction.style.display = 'none';
                
                Swal.close();
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

    // 2. Logika Kirim Data dengan SweetAlert2
    btnSubmit.addEventListener('click', async () => {
        // Tampilan Loading
        btnSubmit.disabled = true;
        loader.style.display = "inline-block";
        btnText.innerText = "Mengirim...";

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
            // Kirim data ke Google
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // NOTIFIKASI BERHASIL (TENGAH LAYAR)
            Swal.fire({
                icon: 'success',
                title: 'Laporan Terkirim!',
                text: 'Data berhasil disimpan ke Google Sheets.',
                confirmButtonColor: '#007bff',
                timer: 3000
            }).then(() => {
                window.location.reload();
            });

        } catch (error) {
            console.error('Error:', error);
            
            // NOTIFIKASI GAGAL (TENGAH LAYAR)
            Swal.fire({
                icon: 'error',
                title: 'Gagal Mengirim',
                text: 'Pastikan koneksi internet stabil dan coba lagi.',
                confirmButtonColor: '#d33'
            });

            btnSubmit.disabled = false;
            loader.style.display = "none";
            btnText.innerText = "KIRIM LAPORAN SEKARANG";
        }
    });
});