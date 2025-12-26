document.addEventListener('DOMContentLoaded', () => {
    const photoInput = document.getElementById('photo-input');
    const noteInput = document.getElementById('note-input');
    const uploadBtn = document.getElementById('upload-btn');
    const statusMessage = document.getElementById('status-message');
    const gallerySection = document.getElementById('gallery-section');
    const gallery = document.getElementById('gallery');

    // Get today's date in YYYY-MM-DD format
    const getTodayDate = () => new Date().toISOString().split('T')[0];

    // Check if uploaded today
    const checkIfUploadedToday = () => {
        const today = getTodayDate();
        return localStorage.getItem(today) !== null;
    };

    // Load gallery
const loadGallery = () => {
    gallery.innerHTML = '';
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const entry = JSON.parse(localStorage.getItem(key));
            const item = document.createElement('div');
            item.classList.add('gallery-item');

            const img = document.createElement('img');
            img.src = entry.photo;
            item.appendChild(img);

            const dateP = document.createElement('p');
            dateP.textContent = `Date: ${key}`;
            item.appendChild(dateP);

            const noteP = document.createElement('p');
            noteP.textContent = entry.note || 'No note';
            item.appendChild(noteP);

            // Add delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.style.backgroundColor = '#d32f2f';
            deleteBtn.style.marginTop = '5px';
            deleteBtn.onclick = () => {
                if (confirm(`Delete photo from ${key}?`)) {
                    localStorage.removeItem(key);
                    loadGallery(); // refresh gallery
                    // If deleting today's photo, show upload prompt again
                    if (key === getTodayDate()) {
                        statusMessage.textContent = 'Upload today\'s gratitude photo to continue.';
                        gallerySection.style.display = 'none';
                    }
                }
            };
            item.appendChild(deleteBtn);

            gallery.appendChild(item);
        }
    }
};
    // Handle upload
    uploadBtn.addEventListener('click', () => {
        const today = getTodayDate();
        if (checkIfUploadedToday()) {
            statusMessage.textContent = 'You already uploaded today!';
            return;
        }
        const file = photoInput.files[0];
        if (!file) {
            statusMessage.textContent = 'Please select a photo!';
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Resize to max 800px width for storage efficiency
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const maxWidth = 800;
                const scale = maxWidth / img.width;
                canvas.width = maxWidth;
                canvas.height = img.height * scale;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const resizedBase64 = canvas.toDataURL('image/jpeg', 0.8);  // Compress to JPEG 80%
                const entry = {
                    photo: resizedBase64,
                    note: noteInput.value
                };
                localStorage.setItem(today, JSON.stringify(entry));
                statusMessage.textContent = 'Uploaded! Great job.';
                photoInput.value = '';
                noteInput.value = '';
                gallerySection.style.display = 'block';
                loadGallery();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    // Initial load
    if (checkIfUploadedToday()) {
        statusMessage.textContent = 'Today\'s photo is done! View your gallery.';
        gallerySection.style.display = 'block';
        loadGallery();
    } else {
        statusMessage.textContent = 'Upload today\'s gratitude photo to continue.';
    }

    // Request notification permission
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }

    // Simple reminder: Check every hour if not uploaded by 8 PM
    setInterval(() => {
        const now = new Date();
        const today = getTodayDate();
        if (now.getHours() >= 20 && !checkIfUploadedToday() && Notification.permission === 'granted') {
            new Notification('Gratitude Reminder', {
                body: 'Hey! Upload your daily positive photo before the day ends.'
            });
        }
    }, 3600000);  // Check hourly
});
