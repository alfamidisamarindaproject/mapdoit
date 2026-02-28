/**
 * MAP DO IT - Integrated Hybrid Logic
 * Features: Auto-Uppercase, Hyper-Speed Compression, Visual Timer
 */

// GANTI DENGAN URL WEB APP (EXEC) ANDA DARI GOOGLE APPS SCRIPT
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyRQdAPT8XmknyMYcOkiD16yRA3wOaCfZvl3ihP5gj6lAfl-8aR8w3wQ_Dh88M5clnP/exec"; 

document.addEventListener('DOMContentLoaded', () => {
    const btnSubmit = document.getElementById('btn-submit');
    const fileInput = document.getElementById('file-input');
    const preview = document.getElementById('preview');
    const instruction = document.getElementById('instruction');
    const progressBar = document.getElementById('fill-progress');
    const speedTag = document.getElementById('speed-tag');
    const msLabel = document.getElementById('ms');
    const cameraBox = document.querySelector('.camera-box');
    
    let base64Image = "";

    // 1. Auto Uppercase & Progress Tracker
    const inputs = ['nama', 'toko', 'rak'];
    const updateUI = () => {
        let count = 0;
        inputs.forEach(id => {
            if(document.getElementById(id).value.trim() !== "") count++;
        });
        if(base64Image) count++;
        
        progressBar.style.width = (count / 4 * 100) + "%";
        btnSubmit.disabled = !(inputs.every(id => document.getElementById(id).value.trim() !== "") && base64Image);
    };

    // Terapkan paksa Huruf Besar pada setiap input data diri
    inputs.forEach(id => {
        const el = document.getElementById(id);
        el.addEventListener('input', () => {
            el.value = el.value.toUpperCase(); 
            updateUI();
        });
    });

    // 2. Hyper-Speed Image Processing Logic
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const t0 = performance.now(); // Mulai Timer Kecepatan
        
        Swal.fire({
            title: 'PROCESSING...',
            text: 'Optimizing high-speed render',
            showConfirmButton: false,
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const TARGET_W = 900; // Lebar optimal untuk kecepatan & kualitas
                canvas.width = TARGET_W;
                canvas.height = img.height * (TARGET_W / img.width);

                // Gunakan mode tanpa transparansi untuk speed maksimal
                const ctx = canvas.getContext('2d', { alpha: false });
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'low'; // Render cepat
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Kompresi JPEG tingkat 0.7 (Sangat ringan untuk GSheet)
                base64Image = canvas.toDataURL('image/jpeg', 0.7);
                
                preview.src = base64Image;
                preview.style.display = 'block';
                instruction.style.display = 'none';
                cameraBox.classList.add('active');

                const t1 = performance.now(); // Selesai Timer
                msLabel.innerText = Math.round(t1 - t0);
                speedTag.style.display = 'block';
                
                Swal.close();
                updateUI();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    // 3. Submission to Google Sheets
    btnSubmit.addEventListener('click', async () => {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> SYNCING...`;

        const checks = [];
        if(document.getElementById('check-plano').checked) checks.push("PLANOGRAM OK");
        if(document.getElementById('check-label').checked) checks.push("LABEL PRICE OK");
        if(document.getElementById('check-exp').checked) checks.push("EXP CHECKED OK");
        if(document.getElementById('check-bersih').checked) checks.push("CLEANING OK");

        const formData = new URLSearchParams();
        formData.append('nama', document.getElementById('nama').value);
        formData.append('toko', document.getElementById('toko').value);
        formData.append('rak', document.getElementById('rak').value);
        formData.append('checklist', checks.join(" | ") || "NONE");
        formData.append('foto', base64Image);

        try {
            await fetch(SCRIPT_URL, { 
                method: 'POST', 
                mode: 'no-cors', 
                body: formData 
            });
            
            Swal.fire({
                icon: 'success',
                title: 'SUCCESS',
                text: 'Report synchronized successfully',
                confirmButtonColor: '#000'
            }).then(() => location.reload());

        } catch (err) {
            Swal.fire({ 
                icon: 'error', 
                title: 'FAILED', 
                text: 'Network connection issue. Please try again.' 
            });
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = `<span>COMPLETE REPORT</span> <i class="ph ph-arrow-right-bold"></i>`;
        }
    });
});
