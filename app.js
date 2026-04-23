// GANTI SCRIPT URL JIKA ADA DEPLOYMENT BARU
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx8IEMuMNjrT7BXSALU9JmpW2MClPQzLEChu5lAwM9FaCyV-N5QAVEaW0_UPTqvnAAmoA/exec";

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
      // Tambahkan mode cors untuk GET
      const response = await fetch(`${SCRIPT_URL}?action=getToko`, { method: 'GET' });
      if (!response.ok) throw new Error('CORS atau Network Error');
      const data = await response.json();
      
      // Deteksi jika dari backend membalas error string (bukan array)
      if (data.length > 0 && data[0].toString().includes("Error")) {
          console.error("Backend Error:", data[0]);
          return;
      }
      
      cachedTokoData = data;
      console.log("Database Toko Terunduh, Jumlah:", cachedTokoData.length);
    } catch (err) {
      console.error("Gagal memuat database toko. Pastikan Web App ter-deploy dengan akses 'Anyone'.", err);
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

    const filtered = cachedTokoData.filter(item => item.toUpperCase().includes(val));

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
      const el = document.getElementById(id);
      if (el && el.value.trim() !== "") filledCount++;
    });
    if (base64Image) filledCount++;
    
    progressBar.style.width = ((filledCount / 4) * 100) + "%";
    
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
      text: 'Optimasi gambar...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; // Dikecilkan sedikit agar pengiriman via POST lebih stabil
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * (MAX_WIDTH / img.width);
        
        const ctx = canvas.getContext('2d', { alpha: false });
        ctx.imageSmoothingQuality = 'low'; 
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        base64Image = canvas.toDataURL('image/jpeg', 0.6); // Kompresi ke 60% agar Base64 tidak terlalu berat
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

  // --- 5. KIRIM DATA KE GOOGLE SCRIPT ---
  btnSubmit.addEventListener('click', async () => {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<div class="spinner-border spinner-border-sm me-2"></div> MENGIRIM...`;

    const checks = [];
    if (document.getElementById('check-plano')?.checked) checks.push("PLANOGRAM OK");
    if (document.getElementById('check-label')?.checked) checks.push("LABEL PRICE OK");
    if (document.getElementById('check-exp')?.checked) checks.push("EXP CHECKED OK");
    if (document.getElementById('check-bersih')?.checked) checks.push("CLEANING OK");

    // Menggunakan objek FormData biasa (Lebih aman untuk Base64)
    const formData = new FormData();
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
        text: 'Data telah dikirim ke Sheet.',
        confirmButtonColor: '#000',
        confirmButtonText: 'OKE'
      }).then(() => location.reload());

    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'GAGAL', text: 'Cek koneksi internet Anda.' });
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = `<span>KIRIM REPORT</span>`;
    }
  });
});
