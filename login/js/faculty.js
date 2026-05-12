// Load Faculties
function loadFaculties() {
    db.collection('faculties').get()
        .then(snapshot => {
            const tbody = document.getElementById('facultiesTableBody');
            tbody.innerHTML = '';

            snapshot.forEach(doc => {
                const faculty = doc.data();
                const row = `
                    <tr>
                        <td>${faculty.name || 'N/A'}</td>
                        <td>${faculty.email || 'N/A'}</td>
                        <td>${faculty.phone || 'N/A'}</td>
                        <td><span style="color: ${faculty.role === 'admin' ? '#4CAF50' : '#2196F3'}">${faculty.role === 'admin' ? 'Admin' : 'Faculty'}</span></td>
                        <td>
                            <button class="btn-edit" onclick="editFaculty('${doc.id}')">Edit</button>
                            <button class="btn-delete" onclick="deleteFaculty('${doc.id}')">Delete</button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        })
        .catch(error => {
            console.error('Error loading faculties:', error);
        });
}

// Show Add Faculty Modal
function showAddFacultyModal() {
    document.getElementById('addFacultyModal').style.display = 'block';
}

// Add Faculty
function addFaculty() {
    const name = document.getElementById('facultyName').value.trim();
    const email = document.getElementById('facultyEmail').value.trim();
    const password = document.getElementById('facultyPassword').value;
    const phone = document.getElementById('facultyPhone').value.trim();
    const role = document.getElementById('facultyRole').value;

    if (!name || !email || !password || !phone || !role) {
        alert('Please fill all fields');
        return;
    }

    // Create Firebase Auth user
    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            const userId = userCredential.user.uid;
            
            // Add to faculties collection
            return db.collection('faculties').doc(userId).set({
                name: name,
                email: email,
                phone: phone,
                role: role,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            alert('Faculty added successfully!');
            closeModal('addFacultyModal');
            document.getElementById('addFacultyForm').reset();
            loadFaculties();
            
            // Re-login as admin
            return auth.signInWithEmailAndPassword(
                document.getElementById('adminEmail').value,
                document.getElementById('adminPassword').value
            );
        })
        .catch(error => {
            alert('Error adding faculty: ' + error.message);
        });
}

// Edit Faculty
function editFaculty(facultyId) {
    currentFacultyId = facultyId;
    
    db.collection('faculties').doc(facultyId).get()
        .then(doc => {
            if (doc.exists) {
                const faculty = doc.data();
                document.getElementById('editFacultyName').value = faculty.name || '';
                document.getElementById('editFacultyEmail').value = faculty.email || '';
                document.getElementById('editFacultyPhone').value = faculty.phone || '';
                document.getElementById('editFacultyRole').value = faculty.role || 'faculty';
                
                document.getElementById('editFacultyModal').style.display = 'block';
            }
        });
}

// Save Faculty
function saveFaculty() {
    if (!currentFacultyId) return;

    const updates = {
        phone: document.getElementById('editFacultyPhone').value,
        role: document.getElementById('editFacultyRole').value
    };

    db.collection('faculties').doc(currentFacultyId).update(updates)
        .then(() => {
            alert('Faculty updated successfully!');
            closeModal('editFacultyModal');
            loadFaculties();
        })
        .catch(error => {
            alert('Error updating faculty: ' + error.message);
        });
}

// Delete Faculty
function deleteFaculty(facultyId) {
    if (!confirm('Are you sure you want to delete this faculty?')) return;

    db.collection('faculties').doc(facultyId).delete()
        .then(() => {
            alert('Faculty deleted successfully!');
            loadFaculties();
        })
        .catch(error => {
            alert('Error deleting faculty: ' + error.message);
        });
}
