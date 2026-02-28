/**
 * MAP DO IT - Ultimate Pro Script (Hyper-Speed Edition)
 */

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyJ9EuePt_VkY-U61ZFBYioNeI7lShAlYlJc9fWIZ5-lEViRYpjofO_DZmmaRF3HDZ3/exec"; 

document.addEventListener('DOMContentLoaded', () => {
    const btnSubmit = document.getElementById('btn-submit');
    const fileInput = document.getElementById('file-input');
    const preview = document.getElementById('preview');
    const instruction = document.getElementById('instruction');
    const progressBar = document.getElementById('fill-progress');
    const cameraBox = document.querySelector('.camera-box');
    const photoStatus = document.getElementById('photo-status');
    const tokoInput = document.getElementById('toko');
    
    // Inisialisasi Dropdown Custom
    const tokoDropdown = document.getElementById('toko-dropdown');
    
    let base64Image = "";
    let cachedTokoData = []; 

    // --- LOGIKA SEARCH DATABASE TOKO (CUSTOM SCROLLABLE DROPDOWN) ---
    async function fetchTokoDatabase() {
        try {
            const response = await fetch(`${SCRIPT_URL}?action=getToko`);
            if (!response.ok) throw new Error('Network response was not ok');
            cachedTokoData = await response.json();
            console.log("Database Toko Terunduh ke Cache");
        } catch (err) {
            console.error("Gagal memuat database toko:", err);
        }
    }

    fetchTokoDatabase();

    // Trigger List saat mengetik
    tokoInput.addEventListener('input', () => {
        const val = tokoInput.value.trim().toUpperCase();
        tokoDropdown.innerHTML = "";
        
        if (val.length === 0) {
            tokoDropdown.style.display = 'none';
            return;
        }

        // Filter data berdasarkan ketikan
        const filtered = cachedTokoData.filter(item => 
            item.toUpperCase().includes(val)
        );

        if (filtered.length > 0) {
            filtered.forEach(item => {
                const div = document.createElement('div');
                div.className = 'dropdown-item-toko';
                div.textContent = item;
                
                // Event saat item dipilih
                div.onclick = () => {
                    tokoInput.value = item;
                    tokoDropdown.style.display = 'none';
                    updateProgress(); // Validasi ulang setelah pilih
                };
                tokoDropdown.appendChild(div);
            });
            tokoDropdown.style.display = 'block';
        } else {
            tokoDropdown.style.display = 'none';
        }
    });

    // Sembunyikan dropdown jika klik di luar area
    document.addEventListener('click', (e) => {
        if (!tokoInput.contains(e.target) && !tokoDropdown.contains(e.target)) {
            tokoDropdown.style.display = 'none';
        }
    });

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
        
        const isAllSet = inputs.every(id => document.getElementById(id).value.trim() !== "") && base64Image;
        btnSubmit.disabled = !isAllSet;
    };

    inputs.forEach(id => {
        const el = document.getElementById(id);
        el.addEventListener('input', () => {
            el.value = el.value.toUpperCase();
            updateProgress();
        });
    });

    // 2. High Speed Image Compression with Timer
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const startTime = performance.now();

        Swal.fire({
            title: 'MEMPROSES FOTO',
            text: 'Optimasi kecepatan tinggi...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 900; 
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * (MAX_WIDTH / img.width);
                
                const ctx = canvas.getContext('2d', { alpha: false });
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'low'; 
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                base64Image = canvas.toDataURL('image/jpeg', 0.7);
                
                preview.src = base64Image;
                preview.style.display = 'block';
                instruction.style.display = 'none';
                
                const endTime = performance.now();
                const duration = Math.round(endTime - startTime);
                
                photoStatus.innerHTML = `PHOTO READY (${duration}ms)`;
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
        btnSubmit.innerHTML = `<div class="spinner-border spinner-border-sm me-2"></div> MENGIRIM...`;

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
                text: 'Data telah dikirim ke AC dan AM.',
                confirmButtonColor: '#000',
                confirmButtonText: 'OKE'
            }).then(() => location.reload());

        } catch (err) {
            Swal.fire({ icon: 'error', title: 'GAGAL', text: 'Cek koneksi atau coba lagi.' });
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = `<span>KIRIM REPORT</span> <i class="ph ph-arrow-right-bold"></i>`;
        }
    });
});
