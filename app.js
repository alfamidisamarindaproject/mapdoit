const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyCy4Qv-0rpiXGcXH0l7oQ8G8ITm9DryWAo8lHZvMHcL_b9zsiIwYeBktzojEqEmkx3/exec";

document.addEventListener('DOMContentLoaded', () => {
  const btnSubmit = document.getElementById('btn-submit');
  const fileInput = document.getElementById('file-input');
  const preview = document.getElementById('preview');
  const instruction = document.getElementById('instruction');
  const progressBar = document.getElementById('fill-progress');
  const cameraBox = document.querySelector('.camera-box');
  const photoStatus = document.getElementById('photo-status');
  const tokoInput = document.getElementById('toko');
  const tokoDropdown = document.getElementById('toko-dropdown');

  let base64Image = "";
  let cachedTokoData = [];

  // --- 1. LOGIKA DATABASE TOKO ---
  async function fetchTokoDatabase() {
    try {
      const response = await fetch(`${SCRIPT_URL}?action=getToko`);
      if (!response.ok) throw new Error('Network error saat fetch');
      cachedTokoData = await response.json();
      console.log("Database Toko Terunduh:", cachedTokoData.length, "toko");
    } catch (err) {
      console.error("Gagal memuat database toko. Pastikan Web App diset ke 'Anyone'. Error:", err);
    }
  }
  
  fetchTokoDatabase();

  // --- 2. LOGIKA DROPDOWN ---
  tokoInput.addEventListener('input', () => {
    tokoInput.value = tokoInput.value.toUpperCase();
    const val = tokoInput.value.trim();
    tokoDropdown.innerHTML = "";
    
    if (val.length === 0) {
      tokoDropdown.style.display = 'none';
      updateProgress();
      return;
    }

    const filtered = cachedTokoData.filter(item => 
      item && item.toUpperCase().includes(val)
    );

    if (filtered.length > 0) {
      filtered.forEach(item => {
        const div = document.createElement('div');
        div.className = 'dropdown-item-toko';
        div.textContent = item;
        
        div.addEventListener('click', () => {
          tokoInput.value = item;
          tokoDropdown.style.display = 'none';
          updateProgress(); 
        });
        tokoDropdown.appendChild(div);
      });
      tokoDropdown.style.display = 'block';
    } else {
      tokoDropdown.style.display = 'none';
    }
    updateProgress();
  });

  document.addEventListener('click', (e) => {
    if (!tokoInput.contains(e.target) && !tokoDropdown.contains(e.target)) {
      tokoDropdown.style.display = 'none';
    }
  });

  // --- 3. VALIDASI PROGRESS ---
  const inputs = ['nama', 'toko', 'rak'];
  
  const updateProgress = () => {
    let filledCount = 0;
    inputs.forEach(id => {
      if (document.getElementById(id) && document.getElementById(id).value.trim() !== "") filledCount++;
    });
    if (base64Image) filledCount++;
    
    const percentage = (filledCount / 4) * 100;
    progressBar.style.width = percentage + "%";
    
    const isAllSet = inputs.every(id => document.getElementById(id) && document.getElementById(id).value.trim() !== "") && base64Image;
    btnSubmit.disabled = !isAllSet;
  };

  ['nama', 'rak'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        el.value = el.value.toUpperCase();
        updateProgress();
      });
    }
  });

  // --- 4. LOGIKA KAMERA ---
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

  // --- 5. LOGIKA KIRIM DATA (DIPERBAIKI) ---
  btnSubmit.addEventListener('click', async () => {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<div class="spinner-border spinner-border-sm me-2"></div> MENGIRIM...`;

    const checks = [];
    if (document.getElementById('check-plano')?.checked) checks.push("PLANOGRAM OK");
    if (document.getElementById('check-label')?.checked) checks.push("LABEL PRICE OK");
    if (document.getElementById('check-exp')?.checked) checks.push("EXP CHECKED OK");
    if (document.getElementById('check-bersih')?.checked) checks.push("CLEANING OK");

    // Bungkus data sebagai object JSON
    const payload = {
      nama: document.getElementById('nama').value,
      toko: document.getElementById('toko').value,
      rak: document.getElementById('rak').value,
      checklist: checks.join(" | ") || "NO TASK SELECTED",
      foto: base64Image
    };

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Penting untuk menghindari CORS preflight block
        headers: {
          'Content-Type': 'text/plain', // Harus text/plain agar tidak diblokir no-cors
        },
        body: JSON.stringify(payload)
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
      btnSubmit.innerHTML = `<span>KIRIM REPORT</span>`;
    }
  });
});
