/**
 * MAP DO IT - Ultimate Pro Script (Hyper-Speed Edition)
 * Fixed: Dropdown Toko & Rak Terintegrasi & Styling Otomatis
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
    
    // Elements for Toko & Rak
    const tokoInput = document.getElementById('toko');
    const tokoDropdown = document.getElementById('toko-dropdown');
    const rakInput = document.getElementById('rak');
    const rakDropdown = document.getElementById('rak-dropdown'); // Pastikan Anda punya <div id="rak-dropdown"></div> di HTML
    
    let base64Image = "";
    let cachedTokoData = []; 
    // Data default untuk RAK (Jika Anda punya database rak di Apps Script, bisa di-fetch seperti toko)
    let cachedRakData = ["RAK 01", "RAK 02", "RAK 03", "RAK 04", "RAK 05", "END GONDOLA", "CHILLER", "KASIR"]; 

    // --- 1. LOGIKA DATABASE TOKO ---
    async function fetchTokoDatabase() {
        try {
            // Pastikan Apps Script doGet() Anda sudah return ContentService dengan MimeType JSON
            const response = await fetch(`${SCRIPT_URL}?action=getToko`);
            if (!response.ok) throw new Error('Network response was not ok');
            cachedTokoData = await response.json();
            console.log("Database Toko Terunduh:", cachedTokoData.length, "toko");
        } catch (err) {
            console.error("Gagal memuat database toko:", err);
            // Fallback data jika gagal fetch agar dropdown tetap bisa di-test
            cachedTokoData = ["TOKO KEMANG", "TOKO SUDIRMAN", "TOKO THAMRIN", "TOKO BLOK M"];
        }
    }
    fetchTokoDatabase();

    // --- 2. FUNGSI REUSABLE UNTUK DROPDOWN (TOKO & RAK) ---
    function setupDropdown(inputEl, dropdownEl, dataArrayCallback) {
        // Styling dasar untuk container dropdown agar pasti muncul (mengatasi masalah CSS)
        dropdownEl.style.position = 'absolute';
        dropdownEl.style.zIndex = '9999';
        dropdownEl.style.backgroundColor = '#ffffff';
        dropdownEl.style.width = inputEl.offsetWidth + 'px'; // Samakan lebar dengan input
        dropdownEl.style.maxHeight = '200px';
        dropdownEl.style.overflowY = 'auto';
        dropdownEl.style.boxShadow = '0px 4px 6px rgba(0,0,0,0.1)';
        dropdownEl.style.borderRadius = '4px';
        dropdownEl.style.border = '1px solid #ccc';
        dropdownEl.style.marginTop = '2px';
        dropdownEl.style.display = 'none';

        inputEl.addEventListener('input', () => {
            // Paksa Uppercase
            inputEl.value = inputEl.value.toUpperCase();
            const val = inputEl.value.trim();
            
            dropdownEl.innerHTML = "";
            
            if (val.length === 0) {
                dropdownEl.style.display = 'none';
                updateProgress();
                return;
            }

            // Ambil data array terbaru (penting karena fetch asinkronus)
            const dataList = dataArrayCallback();

            // Filter data
            const filtered = dataList.filter(item => 
                item.toUpperCase().includes(val)
            );

            if (filtered.length > 0) {
                filtered.forEach(item => {
                    const div = document.createElement('div');
                    div.textContent = item;
                    // Styling item dropdown
                    div.style.padding = '10px';
                    div.style.borderBottom = '1px solid #f0f0f0';
                    div.style.cursor = 'pointer';
                    div.style.fontSize = '14px';
                    div.style.color = '#333';
                    
                    // Efek hover
                    div.addEventListener('mouseenter', () => div.style.backgroundColor = '#f8f9fa');
                    div.addEventListener('mouseleave', () => div.style.backgroundColor = '#ffffff');

                    div.addEventListener('click', () => {
                        inputEl.value = item;
                        dropdownEl.style.display = 'none';
                        updateProgress(); 
                    });
                    dropdownEl.appendChild(div);
                });
                dropdownEl.style.display = 'block';
            } else {
                dropdownEl.style.display = 'none';
            }
            updateProgress();
        });

        // Klik di luar untuk menutup dropdown
        document.addEventListener('click', (e) => {
            if (!inputEl.contains(e.target) && !dropdownEl.contains(e.target)) {
                dropdownEl.style.display = 'none';
            }
        });
    }

    // Terapkan fungsi dropdown ke Toko dan Rak
    setupDropdown(tokoInput, tokoDropdown, () => cachedTokoData);
    setupDropdown(rakInput, rakDropdown, () => cachedRakData);

    // --- 3. VALIDASI PROGRESS ---
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

    // Logika untuk input 'nama' (hanya perlu uppercase dan cek progress)
    const namaInput = document.getElementById('nama');
    namaInput.addEventListener('input', () => {
        namaInput.value = namaInput.value.toUpperCase();
        updateProgress();
    });

    // --- 4. LOGIKA KAMERA & KOMPRESI ---
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
                ctx.imageSmoothingQuality = 'low'; 
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                base64Image = canvas.toDataURL('image/jpeg', 0.7);
                preview.src = base64Image;
                preview.style.display = 'block';
                instruction.style.display = 'none';
                
                const duration = Math.round(performance.now() - startTime);
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

    // --- 5. LOGIKA KIRIM DATA ---
    btnSubmit.addEventListener('click', async () => {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<div class="spinner-border spinner-border-sm me-2"></div> MENGIRIM...`;

        const checks = [];
        if(document.getElementById('check-plano') && document.getElementById('check-plano').checked) checks.push("PLANOGRAM OK");
        if(document.getElementById('check-label') && document.getElementById('check-label').checked) checks.push("LABEL PRICE OK");
        if(document.getElementById('check-exp') && document.getElementById('check-exp').checked) checks.push("EXP CHECKED OK");
        if(document.getElementById('check-bersih') && document.getElementById('check-bersih').checked) checks.push("CLEANING OK");

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
