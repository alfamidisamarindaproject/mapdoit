/**
 * MAP DO IT - Ultimate Pro Script
 */

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyRQdAPT8XmknyMYcOkiD16yRA3wOaCfZvl3ihP5gj6lAfl-8aR8w3wQ_Dh88M5clnP/exec"; // Masukkan URL /exec Anda

document.addEventListener('DOMContentLoaded', () => {
    const btnSubmit = document.getElementById('btn-submit');
    const fileInput = document.getElementById('file-input');
    const preview = document.getElementById('preview');
    const instruction = document.getElementById('instruction');
    const progressBar = document.getElementById('fill-progress');
    const cameraBox = document.querySelector('.camera-box');
    const photoStatus = document.getElementById('photo-status');
    
    let base64Image = "";

    // 1. Auto Uppercase & Validation Logic
    const inputs = ['nama', 'toko', 'rak'];
    
    const updateProgress = () => {
        let filledCount = 0;
        inputs.forEach(id => {
            if(document.getElementById(id).value.trim() !== "") filledCount++;
        });
        if(base64Image) filledCount++;
        
        const percentage = (filledCount / 4) * 100;
        progressBar.style.width = percentage + "%";
        
        // Final Button Validation
        const isAllSet = inputs.every(id => document.getElementById(id).value.trim() !== "") && base64Image;
        btnSubmit.disabled = !isAllSet;
    };

    inputs.forEach(id => {
        const el = document.getElementById(id);
        el.addEventListener('input', () => {
            // PAKSA SEMUA HURUF BESAR
            el.value = el.value.toUpperCase();
            updateProgress();
        });
    });

    // 2. High Quality Image Compression
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Swal.fire({
            title: 'MEMPROSES FOTO',
            text: 'Mengoptimalkan kualitas...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200; // Kualitas HD
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * (MAX_WIDTH / img.width);
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                base64Image = canvas.toDataURL('image/jpeg', 0.85);
                preview.src = base64Image;
                preview.style.display = 'block';
                instruction.style.display = 'none';
                photoStatus.style.display = 'block';
                cameraBox.classList.add('active');
                
                Swal.close();
                updateProgress();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    // 3. Robust Submission Logic
    btnSubmit.addEventListener('click', async () => {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<div class="spinner-border spinner-border-sm me-2"></div> SYNCING...`;

        const checks = [];
        if(document.getElementById('check-plano').checked) checks.push("PLANOGRAM OK");
        if(document.getElementById('check-label').checked) checks.push("LABEL PRICE OK");
        if(document.getElementById('check-exp').checked) checks.push("EXP CHECKED OK");
        if(document.getElementById('check-bersih').checked) checks.push("CLEANING OK");

        const formData = new URLSearchParams();
        formData.append('nama', document.getElementById('nama').value);
        formData.append('toko', document.getElementById('toko').value);
        formData.append('rak', document.getElementById('rak').value);
        formData.append('checklist', checks.join(" | ") || "NO TASK SELECTED");
        formData.append('foto', base64Image);

        try {
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: formData
            });

            Swal.fire({
                icon: 'success',
                title: 'LAPORAN TERKIRIM',
                text: 'Data telah disinkronkan ke sistem.',
                confirmButtonColor: '#000',
                confirmButtonText: 'OKE'
            }).then(() => location.reload());

        } catch (err) {
            Swal.fire({ icon: 'error', title: 'GAGAL', text: 'Cek koneksi atau coba lagi.' });
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = `<span>COMPLETE REPORT</span> <i class="ph ph-arrow-right-bold"></i>`;
        }
    });
});
