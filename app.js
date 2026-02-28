/**
 * MAP DO IT - Ultimate Hyper-Speed Edition
 */

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyRQdAPT8XmknyMYcOkiD16yRA3wOaCfZvl3ihP5gj6lAfl-8aR8w3wQ_Dh88M5clnP/exec"; // Ganti dengan URL exec Anda

document.addEventListener('DOMContentLoaded', () => {
    const btnSubmit = document.getElementById('btn-submit');
    const fileInput = document.getElementById('file-input');
    const preview = document.getElementById('preview');
    const instruction = document.getElementById('instruction');
    const progressBar = document.getElementById('fill-progress');
    const compressTag = document.getElementById('compress-tag');
    const msLabel = document.getElementById('ms');
    const cameraBox = document.querySelector('.camera-box');
    
    let base64Image = "";

    // 1. Full Auto-Uppercase & Progress Logic
    const inputs = ['nama', 'toko', 'rak'];
    
    const updateStatus = () => {
        let filled = 0;
        inputs.forEach(id => { if(document.getElementById(id).value.trim() !== "") filled++; });
        if(base64Image) filled++;
        progressBar.style.width = (filled / 4 * 100) + "%";
        btnSubmit.disabled = !(inputs.every(id => document.getElementById(id).value.trim() !== "") && base64Image);
    };

    inputs.forEach(id => {
        const el = document.getElementById(id);
        el.addEventListener('input', () => {
            el.value = el.value.toUpperCase(); // Paksa Huruf Besar Otomatis
            updateStatus();
        });
    });

    // 2. Hyper-Speed Compression Logic
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const t0 = performance.now(); // Start Timer

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const TARGET_W = 900; // Optimal speed/quality ratio
                canvas.width = TARGET_W;
                canvas.height = img.height * (TARGET_W / img.width);

                // Turbo Draw (Alpha false mematikan transparansi untuk speed)
                const ctx = canvas.getContext('2d', { alpha: false });
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'low'; // Low/Medium untuk speed maksimal
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                base64Image = canvas.toDataURL('image/jpeg', 0.7);
                
                preview.src = base64Image;
                preview.style.display = 'block';
                instruction.style.display = 'none';
                cameraBox.classList.add('active');

                const t1 = performance.now(); // End Timer
                msLabel.innerText = Math.round(t1 - t0);
                compressTag.style.display = 'block';
                
                updateStatus();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    // 3. Submission Logic
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
            await fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: formData });
            Swal.fire({ icon: 'success', title: 'SAVED', confirmButtonColor: '#000' }).then(() => location.reload());
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'FAILED', text: 'Check connection.' });
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = `<span>COMPLETE REPORT</span> <i class="ph ph-arrow-right-bold"></i>`;
        }
    });
});
