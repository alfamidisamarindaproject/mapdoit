// GANTI DENGAN URL WEB APP EXEC ANDA
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyRQdAPT8XmknyMYcOkiD16yRA3wOaCfZvl3ihP5gj6lAfl-8aR8w3wQ_Dh88M5clnP/exec"; 

document.addEventListener('DOMContentLoaded', () => {
    const btnSubmit = document.getElementById('btn-submit');
    const fileInput = document.getElementById('file-input');
    const preview = document.getElementById('preview');
    const instruction = document.getElementById('instruction');
    let base64Image = "";

    // 1. Kompresi Gambar Canggih
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Swal.fire({ 
            title: 'Memproses Bukti...', 
            text: 'Menyiapkan foto agar ringan dikirim',
            allowOutsideClick: false, 
            didOpen: () => Swal.showLoading() 
        });

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 900; 
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Kualitas 0.7 (70%) sangat aman untuk Google Drive
                base64Image = canvas.toDataURL('image/jpeg', 0.7);
                preview.src = base64Image;
                preview.style.display = 'block';
                instruction.style.display = 'none';
                
                Swal.close();
                validate();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    // 2. Validasi Form Real-time
    const validate = () => {
        const nama = document.getElementById('nama').value.trim();
        const toko = document.getElementById('toko').value.trim();
        const rak = document.getElementById('rak').value.trim();
        btnSubmit.disabled = !(nama && toko && rak && base64Image);
    };

    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', validate);
    });

    // 3. Pengiriman Menggunakan Fetch URLSearchParams (Lebih Stabil)
    btnSubmit.addEventListener('click', async () => {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Mengunggah Data...`;

        const checks = [];
        if(document.getElementById('check-plano').checked) checks.push("Planogram");
        if(document.getElementById('check-bersih').checked) checks.push("Kebersihan");
        if(document.getElementById('check-label').checked) checks.push("Label Price");

        const formData = new URLSearchParams();
        formData.append('nama', document.getElementById('nama').value);
        formData.append('toko', document.getElementById('toko').value);
        formData.append('rak', document.getElementById('rak').value);
        formData.append('checklist', checks.join(", ") || "Tidak ada tugas dipilih");
        formData.append('foto', base64Image);

        try {
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Solusi untuk CORS di Google Apps Script
                body: formData
            });

            Swal.fire({
                icon: 'success',
                title: 'Berhasil Terkirim!',
                text: 'Laporan Anda sudah masuk ke Google Sheet.',
                confirmButtonColor: '#0d6efd',
                timer: 4000
            }).then(() => location.reload());

        } catch (err) {
            Swal.fire({ 
                icon: 'error', 
                title: 'Gagal Kirim', 
                text: 'Cek koneksi internet Anda atau coba lagi nanti.' 
            });
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = "KIRIM LAPORAN SEKARANG";
        }
    });
});
