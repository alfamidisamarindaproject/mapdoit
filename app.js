const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyRQdAPT8XmknyMYcOkiD16yRA3wOaCfZvl3ihP5gj6lAfl-8aR8w3wQ_Dh88M5clnP/exec";

document.addEventListener('DOMContentLoaded', () => {
    const btnSubmit = document.getElementById('btn-submit');
    const fileInput = document.getElementById('file-input');
    const preview = document.getElementById('preview');
    let base64Image = "";

    // Kompresi Foto (Wajib agar tidak lemot)
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; 
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * (MAX_WIDTH / img.width);
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                base64Image = canvas.toDataURL('image/jpeg', 0.7);
                preview.src = base64Image;
                preview.style.display = 'block';
                btnSubmit.disabled = false;
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    btnSubmit.addEventListener('click', async () => {
        btnSubmit.disabled = true;
        btnSubmit.innerText = "Mengirim...";

        // Gabungkan Checklist jadi satu string
        const checks = [];
        if(document.getElementById('check-plano').checked) checks.push("Planogram");
        if(document.getElementById('check-bersih').checked) checks.push("Bersih");
        if(document.getElementById('check-label').checked) checks.push("Label");
        if(document.getElementById('check-exp').checked) checks.push("Expired");

        // Kirim sebagai URLSearchParams (Lebih Stabil)
        const formData = new URLSearchParams();
        formData.append('nama', document.getElementById('nama').value);
        formData.append('toko', document.getElementById('toko').value);
        formData.append('rak', document.getElementById('rak').value);
        formData.append('checklist', checks.join(", "));
        formData.append('foto', base64Image);

        try {
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Solusi CORS
                body: formData
            });

            // Karena no-cors, kita anggap sukses jika tidak ada error network
            Swal.fire({
                icon: 'success',
                title: 'BERHASIL',
                text: 'Data telah dikirim ke sistem.',
                confirmButtonColor: '#007bff'
            }).then(() => location.reload());

        } catch (err) {
            Swal.fire({ icon: 'error', title: 'GAGAL', text: 'Cek koneksi internet.' });
            btnSubmit.disabled = false;
        }
    });
});
