let currentIconType = 'emoji';
let editIconType = 'emoji';

// Check authentication
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'index.html';
    } else {
        loadSections();
    }
});

// Toggle mobile menu
function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// Logout
function adminLogout() {
    firebase.auth().signOut().then(() => {
        window.location.href = 'index.html';
    });
}

// Load all sections
function loadSections() {
    const container = document.getElementById('sectionsContainer');
    container.innerHTML = '<p style="text-align: center; color: #666;">Loading sections...</p>';

    firebase.firestore().collection('pdfCategories')
        .get()
        .then((snapshot) => {
            const sectionsMap = new Map();
            
            snapshot.forEach((doc) => {
                const data = doc.data();
                const sectionName = data.type || 'Unnamed';
                
                if (!sectionsMap.has(sectionName)) {
                    sectionsMap.set(sectionName, {
                        name: sectionName,
                        icon: data.sectionIcon || '📄',
                        count: 0,
                        section: data.section || 'free'
                    });
                }
                sectionsMap.get(sectionName).count++;
            });

            if (sectionsMap.size === 0) {
                container.innerHTML = '<p style="text-align: center; color: #666;">No sections found. Add your first section!</p>';
                return;
            }

            container.innerHTML = '';
            const sectionsArray = Array.from(sectionsMap.values());
            sectionsArray.forEach((section, index) => {
                const card = createSectionCard(section, index);
                container.appendChild(card);
            });
        })
        .catch((error) => {
            console.error('Error loading sections:', error);
            container.innerHTML = '<p style="text-align: center; color: #f56565;">Error loading sections</p>';
        });
}

// Store sections data globally
let sectionsData = [];

// Create section card
function createSectionCard(section, index) {
    // Store section data
    sectionsData[index] = section;
    
    const card = document.createElement('div');
    card.className = 'section-card';
    
    const iconDiv = document.createElement('div');
    iconDiv.className = 'section-icon';
    
    if (section.icon.startsWith('http://') || section.icon.startsWith('https://') || section.icon.startsWith('data:image/')) {
        const img = document.createElement('img');
        img.src = section.icon;
        img.alt = section.name;
        img.onerror = function() { this.parentElement.innerHTML = '❌'; };
        iconDiv.appendChild(img);
    } else {
        iconDiv.textContent = section.icon;
    }
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'section-info';
    infoDiv.innerHTML = `
        <div class="section-name">${section.name}</div>
        <div class="section-count">${section.count} PDF(s) • ${section.section === 'free' ? 'Free' : 'Paid'}</div>
    `;
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'section-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'btn-edit';
    editBtn.textContent = 'Edit';
    editBtn.setAttribute('data-index', index);
    editBtn.onclick = function() {
        const idx = parseInt(this.getAttribute('data-index'));
        const sectionData = sectionsData[idx];
        showEditSectionModal(sectionData.name, sectionData.icon);
    };
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = function() {
        deleteSection(section.name);
    };
    
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);
    
    card.appendChild(iconDiv);
    card.appendChild(infoDiv);
    card.appendChild(actionsDiv);
    
    return card;
}

// Show add section modal
function showAddSectionModal() {
    document.getElementById('addSectionModal').style.display = 'block';
    document.getElementById('sectionName').value = '';
    document.getElementById('emojiIcon').value = '';
    document.getElementById('urlIcon').value = '';
    document.getElementById('base64Icon').value = '';
    document.getElementById('iconPreview').innerHTML = '?';
    selectIconType('emoji');
}

// Show edit section modal
function showEditSectionModal(name, icon) {
    document.getElementById('editSectionModal').style.display = 'block';
    document.getElementById('editSectionOldName').value = name;
    document.getElementById('editSectionName').value = name;
    
    // Clear all inputs first
    document.getElementById('editEmojiIcon').value = '';
    document.getElementById('editUrlIcon').value = '';
    document.getElementById('editBase64Icon').value = '';
    
    // Detect icon type and set values
    if (icon.startsWith('http://') || icon.startsWith('https://')) {
        editIconType = 'url';
        selectEditIconType('url');
        document.getElementById('editUrlIcon').value = icon;
        document.getElementById('editIconPreview').innerHTML = `<img src="${icon}" alt="Icon" onerror="this.parentElement.innerHTML='❌'">`;
    } else if (icon.startsWith('data:image/')) {
        editIconType = 'base64';
        selectEditIconType('base64');
        document.getElementById('editBase64Icon').value = icon;
        document.getElementById('editIconPreview').innerHTML = `<img src="${icon}" alt="Icon" onerror="this.parentElement.innerHTML='❌'">`;
    } else {
        editIconType = 'emoji';
        selectEditIconType('emoji');
        document.getElementById('editEmojiIcon').value = icon;
        document.getElementById('editIconPreview').textContent = icon;
    }
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Select icon type
function selectIconType(type) {
    currentIconType = type;
    
    // Update buttons
    document.querySelectorAll('#addSectionModal .icon-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Find and activate the clicked button
    const buttons = document.querySelectorAll('#addSectionModal .icon-type-btn');
    if (type === 'emoji') {
        buttons[0].classList.add('active');
    } else if (type === 'url') {
        buttons[1].classList.add('active');
    } else if (type === 'base64') {
        buttons[2].classList.add('active');
    }
    
    // Show/hide inputs
    document.getElementById('emojiInput').classList.remove('active');
    document.getElementById('urlInput').classList.remove('active');
    document.getElementById('base64Input').classList.remove('active');
    
    if (type === 'emoji') {
        document.getElementById('emojiInput').classList.add('active');
    } else if (type === 'url') {
        document.getElementById('urlInput').classList.add('active');
    } else if (type === 'base64') {
        document.getElementById('base64Input').classList.add('active');
    }
}

// Select edit icon type
function selectEditIconType(type) {
    editIconType = type;
    
    // Update buttons
    document.querySelectorAll('#editSectionModal .icon-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Find and activate the clicked button
    const buttons = document.querySelectorAll('#editSectionModal .icon-type-btn');
    if (type === 'emoji') {
        buttons[0].classList.add('active');
    } else if (type === 'url') {
        buttons[1].classList.add('active');
    } else if (type === 'base64') {
        buttons[2].classList.add('active');
    }
    
    // Show/hide inputs
    document.getElementById('editEmojiInput').classList.remove('active');
    document.getElementById('editUrlInput').classList.remove('active');
    document.getElementById('editBase64Input').classList.remove('active');
    
    if (type === 'emoji') {
        document.getElementById('editEmojiInput').classList.add('active');
    } else if (type === 'url') {
        document.getElementById('editUrlInput').classList.add('active');
    } else if (type === 'base64') {
        document.getElementById('editBase64Input').classList.add('active');
    }
}

// Preview icon
function previewIcon() {
    const preview = document.getElementById('iconPreview');
    let iconValue = '';
    
    if (currentIconType === 'emoji') {
        iconValue = document.getElementById('emojiIcon').value.trim();
        preview.textContent = iconValue || '?';
    } else if (currentIconType === 'url') {
        iconValue = document.getElementById('urlIcon').value.trim();
        if (iconValue) {
            preview.innerHTML = `<img src="${iconValue}" alt="Icon">`;
        } else {
            preview.innerHTML = '?';
        }
    } else if (currentIconType === 'base64') {
        iconValue = document.getElementById('base64Icon').value.trim();
        if (iconValue) {
            preview.innerHTML = `<img src="${iconValue}" alt="Icon">`;
        } else {
            preview.innerHTML = '?';
        }
    }
}

// Preview edit icon
function previewEditIcon() {
    const preview = document.getElementById('editIconPreview');
    let iconValue = '';
    
    if (editIconType === 'emoji') {
        iconValue = document.getElementById('editEmojiIcon').value.trim();
        preview.textContent = iconValue || '?';
    } else if (editIconType === 'url') {
        iconValue = document.getElementById('editUrlIcon').value.trim();
        if (iconValue) {
            preview.innerHTML = `<img src="${iconValue}" alt="Icon">`;
        } else {
            preview.innerHTML = '?';
        }
    } else if (editIconType === 'base64') {
        iconValue = document.getElementById('editBase64Icon').value.trim();
        if (iconValue) {
            preview.innerHTML = `<img src="${iconValue}" alt="Icon">`;
        } else {
            preview.innerHTML = '?';
        }
    }
}

// Add new section
function addSection() {
    const name = document.getElementById('sectionName').value.trim();
    let icon = '';
    
    if (currentIconType === 'emoji') {
        icon = document.getElementById('emojiIcon').value.trim();
    } else if (currentIconType === 'url') {
        icon = document.getElementById('urlIcon').value.trim();
    } else if (currentIconType === 'base64') {
        icon = document.getElementById('base64Icon').value.trim();
    }
    
    if (!name) {
        alert('Please enter section name');
        return;
    }
    
    if (!icon) {
        alert('Please provide an icon');
        return;
    }
    
    // Check if section already exists
    firebase.firestore().collection('pdfCategories')
        .where('type', '==', name)
        .limit(1)
        .get()
        .then((snapshot) => {
            if (!snapshot.empty) {
                alert('Section with this name already exists!');
                return;
            }
            
            alert('Section created! Now you can add PDFs to this section from PDF Notes page.');
            closeModal('addSectionModal');
            loadSections();
        })
        .catch((error) => {
            console.error('Error checking section:', error);
            alert('Error creating section');
        });
}

// Save section changes
function saveSection() {
    const oldName = document.getElementById('editSectionOldName').value;
    const newName = document.getElementById('editSectionName').value.trim();
    let newIcon = '';
    
    if (editIconType === 'emoji') {
        newIcon = document.getElementById('editEmojiIcon').value.trim();
    } else if (editIconType === 'url') {
        newIcon = document.getElementById('editUrlIcon').value.trim();
    } else if (editIconType === 'base64') {
        newIcon = document.getElementById('editBase64Icon').value.trim();
    }
    
    if (!newName) {
        alert('Please enter section name');
        return;
    }
    
    if (!newIcon) {
        alert('Please provide an icon');
        return;
    }
    
    if (!confirm(`Update all PDFs in "${oldName}" section?`)) {
        return;
    }
    
    // Update all PDFs with this section type
    firebase.firestore().collection('pdfCategories')
        .where('type', '==', oldName)
        .get()
        .then((snapshot) => {
            const batch = firebase.firestore().batch();
            
            snapshot.forEach((doc) => {
                batch.update(doc.ref, {
                    type: newName,
                    sectionIcon: newIcon
                });
            });
            
            return batch.commit();
        })
        .then(() => {
            alert('Section updated successfully!');
            closeModal('editSectionModal');
            loadSections();
        })
        .catch((error) => {
            console.error('Error updating section:', error);
            alert('Error updating section');
        });
}

// Delete section
function deleteSection(name) {
    if (!confirm(`Delete "${name}" section and all its PDFs? This cannot be undone!`)) {
        return;
    }
    
    firebase.firestore().collection('pdfCategories')
        .where('type', '==', name)
        .get()
        .then((snapshot) => {
            const batch = firebase.firestore().batch();
            
            snapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });
            
            return batch.commit();
        })
        .then(() => {
            alert('Section and all PDFs deleted successfully!');
            loadSections();
        })
        .catch((error) => {
            console.error('Error deleting section:', error);
            alert('Error deleting section');
        });
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}
