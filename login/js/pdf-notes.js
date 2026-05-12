let currentSection = 'free';
let currentPdfId = null;

firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    loadPdfs();
    loadSections();
});

function loadSections() {
    const defaultSections = ['MCQs', 'Shortcuts', 'Checklists', 'Notes', 'Typing'];
    
    firebase.firestore().collection('pdfCategories').get().then((snapshot) => {
        const sections = new Set(defaultSections);
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.type) sections.add(data.type);
        });
        
        const select = document.getElementById('pdfSection');
        select.innerHTML = '<option value="">Select Section</option>';
        Array.from(sections).sort().forEach(section => {
            select.innerHTML += `<option value="${section}">${section}</option>`;
        });
        select.innerHTML += '<option value="custom">+ Add New Section</option>';
    });
}

function toggleCustomSection() {
    const select = document.getElementById('pdfSection');
    const customInput = document.getElementById('customSection');
    if (select.value === 'custom') {
        customInput.style.display = 'block';
        customInput.required = true;
    } else {
        customInput.style.display = 'none';
        customInput.required = false;
    }
}

function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
}

function closeMobileMenu() {
    document.getElementById('sidebar').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
}

function adminLogout() {
    firebase.auth().signOut().then(() => {
        window.location.href = 'login.html';
    });
}

function switchTab(section) {
    currentSection = section;
    document.getElementById('freeTab').classList.remove('active');
    document.getElementById('paidTab').classList.remove('active');
    document.getElementById(section + 'Tab').classList.add('active');
    loadPdfs();
}

function loadPdfs() {
    const tbody = document.getElementById('pdfTableBody');
    
    firebase.firestore().collection('pdfCategories')
        .where('section', '==', currentSection)
        .onSnapshot((snapshot) => {
        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="6" class="no-data">No PDFs found</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        snapshot.forEach((doc) => {
            const pdf = doc.data();
            const row = `
                <tr>
                    <td><input type="checkbox" class="pdf-checkbox" data-id="${doc.id}" onchange="updateDeleteButton()"></td>
                    <td>${pdf.name}</td>
                    <td><span class="badge">${pdf.type}</span></td>
                    <td><span class="badge badge-${pdf.section}">${pdf.section.toUpperCase()}</span></td>
                    <td><a href="${pdf.pdfUrl}" target="_blank" class="link">View PDF</a></td>
                    <td>
                        <button class="btn-icon" onclick="editPdf('${doc.id}', '${pdf.name.replace(/'/g, "\\'") || ''}', '${pdf.type || ''}', '${pdf.subCategory || ''}', '${pdf.iconUrl || ''}', '${pdf.pdfUrl || ''}')">✏️</button>
                        <button class="btn-icon" onclick="deletePdf('${doc.id}', '${pdf.name.replace(/'/g, "\\'")}')">🗑️</button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
        updateDeleteButton();
    });
}

function showAddModal() {
    currentPdfId = null;
    document.getElementById('modalTitle').textContent = 'Add PDF';
    document.getElementById('pdfForm').reset();
    document.getElementById('pdfModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

async function savePdf() {
    const name = document.getElementById('pdfName').value.trim();
    let section = document.getElementById('pdfSection').value;
    const subCategory = document.getElementById('subCategory').value.trim();
    const iconUrl = document.getElementById('iconUrl').value.trim();
    const pdfUrl = document.getElementById('pdfUrl').value.trim();

    if (section === 'custom') {
        section = document.getElementById('customSection').value.trim();
        if (!section) {
            alert('Please enter section name');
            return;
        }
    }

    if (!name || !section || !subCategory || !iconUrl || !pdfUrl) {
        alert('Please fill all fields');
        return;
    }

    const pdfData = {
        name: name,
        section: currentSection,
        type: section,
        subCategory: subCategory,
        iconUrl: iconUrl,
        pdfUrl: pdfUrl,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        if (currentPdfId) {
            await firebase.firestore().collection('pdfCategories').doc(currentPdfId).update(pdfData);
            alert('PDF updated successfully!');
        } else {
            await firebase.firestore().collection('pdfCategories').add(pdfData);
            alert('PDF added successfully!');
        }
        closeModal('pdfModal');
        document.getElementById('pdfForm').reset();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

window.editPdf = (id, name, type, subCategory, iconUrl, url) => {
    currentPdfId = id;
    document.getElementById('modalTitle').textContent = 'Edit PDF';
    document.getElementById('pdfName').value = name;
    document.getElementById('pdfSection').value = type;
    document.getElementById('subCategory').value = subCategory;
    document.getElementById('iconUrl').value = iconUrl;
    document.getElementById('pdfUrl').value = url;
    document.getElementById('pdfModal').style.display = 'block';
};

function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.pdf-checkbox');
    checkboxes.forEach(cb => cb.checked = selectAll.checked);
    updateDeleteButton();
}

function updateDeleteButton() {
    const checkboxes = document.querySelectorAll('.pdf-checkbox:checked');
    const deleteBtn = document.getElementById('deleteBtn');
    deleteBtn.style.display = checkboxes.length > 0 ? 'block' : 'none';
}

function deleteSelected() {
    const checkboxes = document.querySelectorAll('.pdf-checkbox:checked');
    if (checkboxes.length === 0) return;
    
    if (confirm(`Delete ${checkboxes.length} selected PDF(s)?`)) {
        const promises = [];
        checkboxes.forEach(cb => {
            promises.push(firebase.firestore().collection('pdfCategories').doc(cb.dataset.id).delete());
        });
        
        Promise.all(promises)
            .then(() => {
                alert('PDFs deleted successfully!');
                document.getElementById('selectAll').checked = false;
            })
            .catch(error => alert('Error: ' + error.message));
    }
}

window.deletePdf = async (id, name) => {
    if (confirm(`Delete "${name}"?`)) {
        try {
            await firebase.firestore().collection('pdfCategories').doc(id).delete();
            alert('PDF deleted successfully!');
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }
};
