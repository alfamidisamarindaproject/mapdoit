/**
 * MAP DO IT PRO - Samarinda System
 * Optimized for UX and Performance
 */

// GANTI DENGAN URL WEB APP EXEC ANDA
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyRQdAPT8XmknyMYcOkiD16yRA3wOaCfZvl3ihP5gj6lAfl-8aR8w3wQ_Dh88M5clnP/exec"; 

document.addEventListener('DOMContentLoaded', () => {
    const btnSubmit = document.getElementById('btn-submit');
    const fileInput = document.getElementById('file-input');
    const preview = document.getElementById('preview');
    const instruction = document.getElementById('instruction');
    const uploaderBox = document.querySelector('.photo-uploader');
    let base64Image = "";

    // 1. Image Processing & Compression
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Visual Feedback
        Swal.fire({
            title: 'Memproses Foto...',
            html: 'Meningkatkan kualitas gambar...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1000; // Optimal untuk GSheet
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;

                const ctx = canvas.getContext('2d');
                // Sharpening effect (optional)
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                base64Image = canvas.toDataURL('image/jpeg', 0.8);
                preview.src = base64Image;
                preview.style.display = 'block';
                instruction.style.display = 'none';
                uploaderBox.classList.add('active');
                
                // Haptic Feedback (Vibrate)
                if (window.navigator.vibrate) window.navigator.vibrate(50);
                
                Swal.close();
                validate();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    // 2. Real-time Auto Validation
    const validate = () => {
        const nama = document.getElementById('nama').value.trim();
        const toko = document.getElementById('toko').value.trim();
        const rak = document.getElementById('rak').value.trim();
        
        const isReady = nama && toko && rak && base64Image;
        btnSubmit.disabled = !isReady;
    };

    // Listeners for all inputs
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            if(input.id === 'toko') input.value = input.value.toUpperCase();
            validate();
        });
    });

    // 3. Submitting to Google Sheets
    btnSubmit.addEventListener('click', async () => {
        // Haptic Feedback
        if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100]);
        
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> DATA SEDANG DIKIRIM...`;

        // Map checklist labels
        const checklist = [];
        if(document.getElementById('check-plano').checked) checklist.push("Planogram OK");
        if(document.getElementById('check-label').checked) checklist.push("Label Price OK");
        if(document.getElementById('check-exp').checked) checklist.push("Cek Expired OK");
        if(document.getElementById('check-bersih').checked) checklist.push("Kebersihan OK");

        const formData = new URLSearchParams();
        formData.append('nama', document.getElementById('nama').value);
        formData.append('toko', document.getElementById('toko').value);
        formData.append('rak', document.getElementById('rak').value);
        formData.append('checklist', checklist.join(" | ") || "Tidak ada tugas dipilih");
        formData.append('foto', base64Image);

        try {
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: formData
            });

            Swal.fire({
                icon: 'success',
                title: 'TERKIRIM!',
                text: 'Laporan MAP DO IT telah berhasil disimpan.',
                confirmButtonColor: '#007aff',
                customClass: {
                    popup: 'border-radius-20'
                }
            }).then(() => location.reload());

        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'PENGIRIMAN GAGAL',
                text: 'Pastikan sinyal stabil dan coba lagi.'
            });
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = "KIRIM LAPORAN SEKARANG";
        }
    });
});
