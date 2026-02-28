/**
 * MAP DO IT - High End Mobile Experience
 */

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyRQdAPT8XmknyMYcOkiD16yRA3wOaCfZvl3ihP5gj6lAfl-8aR8w3wQ_Dh88M5clnP/exec";

document.addEventListener('DOMContentLoaded', () => {
    const btnSubmit = document.getElementById('btn-submit');
    const fileInput = document.getElementById('file-input');
    const preview = document.getElementById('preview');
    const instruction = document.getElementById('instruction');
    const photoTag = document.getElementById('photo-tag');
    let base64Image = "";

    // Image Compressor Logic
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Swal.fire({
            title: 'Processing Image',
            showConfirmButton: false,
            didOpen: () => Swal.showLoading()
        });

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1000;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * (MAX_WIDTH / img.width);
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                base64Image = canvas.toDataURL('image/jpeg', 0.8);
                preview.src = base64Image;
                preview.style.display = 'block';
                instruction.style.display = 'none';
                photoTag.style.display = 'block';
                
                Swal.close();
                validate();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    // Form Validation Logic
    const validate = () => {
        const nama = document.getElementById('nama').value.trim();
        const toko = document.getElementById('toko').value.trim();
        const rak = document.getElementById('rak').value.trim();
        
        btnSubmit.disabled = !(nama && toko && rak && base64Image);
    };

    document.querySelectorAll('input').forEach(i => {
        i.addEventListener('input', () => {
            if(i.id === 'toko') i.value = i.value.toUpperCase();
            validate();
        });
    });

    // Submission Logic
    btnSubmit.addEventListener('click', async () => {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<div class="loading-ring"></div> <span>SENDING DATA...</span>`;

        const checks = [];
        if(document.getElementById('check-plano').checked) checks.push("Planogram");
        if(document.getElementById('check-label').checked) checks.push("Label Price");
        if(document.getElementById('check-exp').checked) checks.push("Expired Check");
        if(document.getElementById('check-bersih').checked) checks.push("Cleaning");

        const formData = new URLSearchParams();
        formData.append('nama', document.getElementById('nama').value);
        formData.append('toko', document.getElementById('toko').value);
        formData.append('rak', document.getElementById('rak').value);
        formData.append('checklist', checks.join(", ") || "No Task Selected");
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
                text: 'Your report has been securely saved.',
                confirmButtonColor: '#000',
                confirmButtonText: 'DONE'
            }).then(() => location.reload());

        } catch (err) {
            Swal.fire({ icon: 'error', title: 'ERROR', text: 'Network connection failed.' });
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = `<span>SUBMIT REPORT</span> <i class="ph ph-arrow-right fw-bold"></i>`;
        }
    });
});
