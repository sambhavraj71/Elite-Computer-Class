firebase.auth().onAuthStateChanged(user => {
    if (!user) {
        window.location.href = 'index.html';
    } else {
        loadBanners();
    }
});

function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

function adminLogout() {
    firebase.auth().signOut().then(() => {
        window.location.href = 'index.html';
    });
}

function previewBanner() {
    const url = document.getElementById('bannerUrl').value.trim();
    const preview = document.getElementById('previewImg');
    if (url) {
        preview.src = url;
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }
}

function loadBanners() {
    db.collection('bannerImages')
        .orderBy('order', 'asc')
        .get()
        .then(snapshot => {
            const grid = document.getElementById('bannersGrid');
            grid.innerHTML = '';
            
            if (snapshot.empty) {
                grid.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">No banners added yet. Add your first banner above!</p>';
                return;
            }

            snapshot.forEach(doc => {
                const banner = doc.data();
                const card = createBannerCard(doc.id, banner);
                grid.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error loading banners:', error);
            alert('Failed to load banners');
        });
}

function createBannerCard(id, banner) {
    const card = document.createElement('div');
    card.className = 'banner-card';
    card.innerHTML = `
        <img src="${banner.imageUrl}" class="banner-img" alt="Banner ${banner.order}">
        <div class="banner-info">
            <span class="banner-order">Order: ${banner.order}</span>
            <div class="banner-actions">
                <button class="btn-delete" onclick="deleteBanner('${id}')">🗑️ Delete</button>
            </div>
        </div>
    `;
    return card;
}

function addBanner() {
    const url = document.getElementById('bannerUrl').value.trim();
    const order = parseInt(document.getElementById('bannerOrder').value);

    if (!url) {
        alert('Please enter image URL');
        return;
    }

    if (!order || order < 1) {
        alert('Please enter valid order number (1 or greater)');
        return;
    }

    db.collection('bannerImages')
        .where('order', '==', order)
        .get()
        .then(snapshot => {
            if (!snapshot.empty) {
                if (!confirm(`Order ${order} already exists. Replace it?`)) {
                    return;
                }
                snapshot.forEach(doc => doc.ref.delete());
            }

            return db.collection('bannerImages').add({
                imageUrl: url,
                order: order
            });
        })
        .then(() => {
            alert('Banner added successfully!');
            document.getElementById('bannerUrl').value = '';
            document.getElementById('bannerOrder').value = '';
            document.getElementById('previewImg').style.display = 'none';
            loadBanners();
        })
        .catch(error => {
            console.error('Error adding banner:', error);
            alert('Failed to add banner');
        });
}

function deleteBanner(id) {
    if (!confirm('Delete this banner?')) return;

    db.collection('bannerImages')
        .doc(id)
        .delete()
        .then(() => {
            alert('Banner deleted successfully!');
            loadBanners();
        })
        .catch(error => {
            console.error('Error deleting banner:', error);
            alert('Failed to delete banner');
        });
}
