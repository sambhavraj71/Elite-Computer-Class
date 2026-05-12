const IMGBB_KEY = '9eabe4c080b1e55b9a1165e2f1a8aa9e';

const GALLERY_CATEGORIES = {
    director: "Director's Corner",
    job: 'Job 2025',
    award: 'Award Ceremony',
    certification: 'Certification',
    social: 'Social Media',
    students: 'Students Corner',
    batch: 'New Batch 2025'
};

let gallerySelectedFiles = [];
let galleryCurrentCat = 'director';

// ---- Firestore helpers ----
function galleryAddToFirestore(category, url, caption) {
    return db.collection('galleryImages').add({
        category: category,
        url: url,
        caption: caption || GALLERY_CATEGORIES[category],
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

function galleryDeleteFromFirestore(docId) {
    return db.collection('galleryImages').doc(docId).delete();
}

function galleryFetchByCategory(category) {
    return db.collection('galleryImages')
        .where('category', '==', category)
        .get();
}

function galleryFetchAll() {
    return db.collection('galleryImages').get();
}

// ---- Init ----
function initGallerySection() {
    renderGalleryStats();
    renderGalleryCatTabs();
    renderGalleryManageGrid();
    setupGalleryDropZone();
}

// ---- Stats ----
async function renderGalleryStats() {
    const container = document.getElementById('galleryStatsRow');
    if (!container) return;
    container.innerHTML = '<span style="color:#999;font-size:13px;">Loading...</span>';
    try {
        const snap = await galleryFetchAll();
        const counts = {};
        Object.keys(GALLERY_CATEGORIES).forEach(k => counts[k] = 0);
        snap.forEach(doc => {
            const cat = doc.data().category;
            if (counts[cat] !== undefined) counts[cat]++;
        });
        const total = snap.size;
        let html = `<div class="gallery-stat-card" style="border-color:#667eea"><div class="gallery-stat-num" style="color:#667eea">${total}</div><div class="gallery-stat-lbl">Total</div></div>`;
        Object.entries(GALLERY_CATEGORIES).forEach(([key, label]) => {
            html += `<div class="gallery-stat-card"><div class="gallery-stat-num">${counts[key]}</div><div class="gallery-stat-lbl">${label}</div></div>`;
        });
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = '<span style="color:red;font-size:13px;">Error loading stats</span>';
    }
}

// ---- Tab Switch ----
function switchGalleryTab(tab) {
    document.getElementById('gTab-file').classList.toggle('active', tab === 'file');
    document.getElementById('gTab-url').classList.toggle('active', tab === 'url');
    document.getElementById('gTabContent-file').style.display = tab === 'file' ? 'block' : 'none';
    document.getElementById('gTabContent-url').style.display = tab === 'url' ? 'block' : 'none';
}

// ---- Drop Zone ----
function setupGalleryDropZone() {
    const dz = document.getElementById('galleryDropZone');
    const fi = document.getElementById('galleryFileInput');
    if (!dz || !fi) return;
    fi.onchange = () => handleGalleryFiles(Array.from(fi.files));
    dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('dz-hover'); });
    dz.addEventListener('dragleave', () => dz.classList.remove('dz-hover'));
    dz.addEventListener('drop', e => {
        e.preventDefault(); dz.classList.remove('dz-hover');
        handleGalleryFiles(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')));
    });
}

function handleGalleryFiles(files) {
    gallerySelectedFiles = [...gallerySelectedFiles, ...files];
    renderGalleryPreviews();
    document.getElementById('galleryUploadBtn').disabled = gallerySelectedFiles.length === 0;
}

function renderGalleryPreviews() {
    const grid = document.getElementById('galleryPreviewGrid');
    grid.innerHTML = '';
    gallerySelectedFiles.forEach((file, i) => {
        const reader = new FileReader();
        reader.onload = e => {
            const div = document.createElement('div');
            div.className = 'g-preview-item';
            div.id = `gprev-${i}`;
            div.innerHTML = `<img src="${e.target.result}" alt="preview">
                <button class="g-remove-btn" onclick="removeGalleryFile(${i})">✕</button>
                <div class="g-status" id="gstatus-${i}">Ready</div>`;
            grid.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
}

function removeGalleryFile(i) {
    gallerySelectedFiles.splice(i, 1);
    renderGalleryPreviews();
    document.getElementById('galleryUploadBtn').disabled = gallerySelectedFiles.length === 0;
}

// ---- ImgBB Upload ----
async function imgbbUpload(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const base64 = e.target.result.split(',')[1];
                const formData = new FormData();
                formData.append('key', IMGBB_KEY);
                formData.append('image', base64);

                const res = await fetch('https://api.imgbb.com/1/upload', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                if (data.success) {
                    resolve(data.data.url);
                } else {
                    reject(new Error(data.error?.message || 'Upload failed'));
                }
            } catch (err) {
                reject(err);
            }
        };
        reader.readAsDataURL(file);
    });
}

// ---- Upload Files ----
async function uploadGalleryFiles() {
    if (gallerySelectedFiles.length === 0) return;
    const category = document.getElementById('galleryUploadCategory').value;
    const caption = document.getElementById('galleryCaption').value.trim();
    const btn = document.getElementById('galleryUploadBtn');
    btn.disabled = true;
    btn.textContent = 'Uploading...';

    const progressWrap = document.getElementById('galleryProgressWrap');
    const progressFill = document.getElementById('galleryProgressFill');
    progressWrap.style.display = 'block';

    let done = 0, failed = 0;
    for (let i = 0; i < gallerySelectedFiles.length; i++) {
        const statusEl = document.getElementById(`gstatus-${i}`);
        if (statusEl) statusEl.textContent = 'Uploading...';
        try {
            const url = await imgbbUpload(gallerySelectedFiles[i]);
            await galleryAddToFirestore(category, url, caption || GALLERY_CATEGORIES[category]);
            if (statusEl) { statusEl.textContent = '✓ Done'; statusEl.style.background = 'rgba(16,185,129,0.85)'; }
            done++;
        } catch (err) {
            console.error('Upload error:', err);
            if (statusEl) { statusEl.textContent = '✗ Failed'; statusEl.style.background = 'rgba(239,68,68,0.85)'; }
            failed++;
        }
        progressFill.style.width = ((i + 1) / gallerySelectedFiles.length * 100) + '%';
    }

    if (done > 0) showGalleryToast(`${done} image(s) uploaded successfully!`, 'success');
    if (failed > 0) showGalleryToast(`${failed} image(s) failed`, 'error');

    gallerySelectedFiles = [];
    document.getElementById('galleryPreviewGrid').innerHTML = '';
    document.getElementById('galleryCaption').value = '';
    document.getElementById('galleryFileInput').value = '';
    btn.disabled = false;
    btn.textContent = '⬆ Upload to ImgBB';
    setTimeout(() => { progressWrap.style.display = 'none'; progressFill.style.width = '0%'; }, 1500);
    renderGalleryStats();
    renderGalleryManageGrid();
}

// ---- URL Add ----
function galleryPreviewUrl() {
    const val = document.getElementById('galleryUrlInput').value.trim();
    const wrap = document.getElementById('galleryUrlPreviewWrap');
    const img = document.getElementById('galleryUrlPreview');
    if (val.startsWith('http')) { img.src = val; wrap.style.display = 'block'; }
    else wrap.style.display = 'none';
}

async function addGalleryFromUrl() {
    const url = document.getElementById('galleryUrlInput').value.trim();
    const category = document.getElementById('galleryUploadCategory').value;
    const caption = document.getElementById('galleryCaption').value.trim();
    if (!url.startsWith('http')) { showGalleryToast('Valid URL enter karo', 'error'); return; }
    try {
        await galleryAddToFirestore(category, url, caption || GALLERY_CATEGORIES[category]);
        document.getElementById('galleryUrlInput').value = '';
        document.getElementById('galleryUrlPreviewWrap').style.display = 'none';
        document.getElementById('galleryCaption').value = '';
        showGalleryToast('Image added!', 'success');
        renderGalleryStats();
        renderGalleryManageGrid();
    } catch (e) {
        showGalleryToast('Error: ' + e.message, 'error');
    }
}

// ---- Manage Grid ----
function renderGalleryCatTabs() {
    const tabs = document.getElementById('galleryCatTabs');
    if (!tabs) return;
    tabs.innerHTML = '';
    Object.entries(GALLERY_CATEGORIES).forEach(([key, label]) => {
        const btn = document.createElement('button');
        btn.className = 'tab-btn' + (key === galleryCurrentCat ? ' active' : '');
        btn.textContent = label;
        btn.style.cssText = 'padding:8px 16px;font-size:13px;margin:3px;';
        btn.onclick = () => { galleryCurrentCat = key; renderGalleryCatTabs(); renderGalleryManageGrid(); };
        tabs.appendChild(btn);
    });
}

async function renderGalleryManageGrid() {
    const grid = document.getElementById('galleryManageGrid');
    if (!grid) return;
    grid.innerHTML = '<p style="text-align:center;color:#999;padding:20px;grid-column:1/-1">Loading...</p>';
    try {
        const snap = await galleryFetchByCategory(galleryCurrentCat);
        if (snap.empty) {
            grid.innerHTML = '<p style="text-align:center;color:#999;padding:30px;grid-column:1/-1">Is category me koi image nahi hai</p>';
            return;
        }
        grid.innerHTML = '';
        snap.forEach(doc => {
            const img = doc.data();
            const div = document.createElement('div');
            div.className = 'g-manage-item';
            div.innerHTML = `<img src="${img.url}" alt="${img.caption}" loading="lazy">
                <div class="g-manage-overlay">
                    <button class="btn-delete" style="font-size:12px;padding:6px 12px;" onclick="confirmGalleryDelete('${doc.id}')">🗑 Delete</button>
                </div>
                <div class="g-manage-caption">${img.caption}</div>`;
            grid.appendChild(div);
        });
    } catch (e) {
        grid.innerHTML = `<p style="text-align:center;color:red;padding:20px;grid-column:1/-1">Error: ${e.message}</p>`;
    }
}

async function confirmGalleryDelete(docId) {
    if (!confirm('Is image ko delete karna chahte ho?')) return;
    try {
        await galleryDeleteFromFirestore(docId);
        showGalleryToast('Image deleted', 'success');
        renderGalleryStats();
        renderGalleryManageGrid();
    } catch (e) {
        showGalleryToast('Delete failed: ' + e.message, 'error');
    }
}

// ---- Toast ----
function showGalleryToast(msg, type) {
    let t = document.getElementById('galleryToast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'galleryToast';
        t.style.cssText = 'position:fixed;bottom:20px;right:20px;padding:12px 20px;border-radius:10px;color:white;font-weight:600;z-index:9999;transition:all 0.3s;transform:translateY(80px);opacity:0;max-width:300px;';
        document.body.appendChild(t);
    }
    t.style.background = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#667eea';
    t.textContent = msg;
    t.style.transform = 'translateY(0)';
    t.style.opacity = '1';
    setTimeout(() => { t.style.transform = 'translateY(80px)'; t.style.opacity = '0'; }, 3500);
}
