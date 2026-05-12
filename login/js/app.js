let currentUserId = null;
let currentFacultyId = null;
let allStudents = [];
let currentUserRole = null;

// Admin Login
function adminLogin() {
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const errorEl = document.getElementById('loginError');

    if (!email || !password) {
        errorEl.textContent = 'Please fill all fields';
        return;
    }

    errorEl.textContent = 'Logging in...';
    errorEl.style.color = '#2196F3';

    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            console.log('Login successful, user:', userCredential.user.uid);
            // Don't check faculties here, let onAuthStateChanged handle it
            errorEl.textContent = '';
        })
        .catch(error => {
            console.error('Login error:', error);
            errorEl.textContent = error.message;
            errorEl.style.color = 'red';
        });
}

// Admin Logout
function adminLogout() {
    auth.signOut().then(() => {
        document.getElementById('loginContainer').style.display = 'flex';
        document.getElementById('dashboard').style.display = 'none';
    });
}

// Check Auth State
auth.onAuthStateChanged(user => {
    if (user) {
        // Don't check role if already on student profile page
        if (window.location.pathname.includes('student-profile.html')) {
            return;
        }
        checkUserRole(user.uid);
    } else {
        document.getElementById('loginContainer').style.display = 'flex';
        document.getElementById('dashboard').style.display = 'none';
    }
});

// Check User Role
function checkUserRole(userId) {
    console.log('Checking user role for:', userId);
    
    // First check if user is a student
    db.collection('users').doc(userId).get()
        .then(userDoc => {
            console.log('User doc exists:', userDoc.exists);
            if (userDoc.exists) {
                console.log('Student found, redirecting to profile...');
                // Student login - redirect to profile page
                setTimeout(() => {
                    window.location.href = 'student-profile.html';
                }, 100);
                return Promise.reject('student_redirect');
            } else {
                console.log('Not a student, checking faculties...');
                // Check if user is faculty/admin
                return db.collection('faculties').doc(userId).get();
            }
        })
        .then(doc => {
            console.log('Faculty doc exists:', doc && doc.exists);
            if (doc && doc.exists) {
                currentUserRole = doc.data().role;
                console.log('Faculty/Admin role:', currentUserRole);
                document.getElementById('loginContainer').style.display = 'none';
                document.getElementById('dashboard').style.display = 'flex';
                loadStudents();
                
                if (currentUserRole === 'faculty') {
                    const facultyMenu = document.querySelector('[onclick="showSection(\'faculties\')"]');
                    if (facultyMenu) facultyMenu.style.display = 'none';
                }
            } else {
                console.log('No account found');
                document.getElementById('loginContainer').style.display = 'flex';
                document.getElementById('dashboard').style.display = 'none';
                alert('Account not found. Please contact admin.');
                auth.signOut();
            }
        })
        .catch(error => {
            if (error === 'student_redirect') {
                console.log('Student redirect initiated');
                return;
            }
            console.error('Error:', error);
            document.getElementById('loginContainer').style.display = 'flex';
            document.getElementById('dashboard').style.display = 'none';
            alert('Error checking user role. Please try again.');
            auth.signOut();
        });
}

// Load Students
function loadStudents() {
    db.collection('users').get()
        .then(snapshot => {
            allStudents = [];
            snapshot.forEach(doc => {
                allStudents.push({ id: doc.id, ...doc.data() });
            });
            displayStudents(allStudents);
        })
        .catch(error => {
            console.error('Error loading students:', error);
        });
}

// Display Students
function displayStudents(students) {
    const tbody = document.getElementById('studentsTableBody');
    tbody.innerHTML = '';

    students.forEach(student => {
        const actions = currentUserRole === 'admin' 
            ? `<button class="btn-edit" onclick="editStudent('${student.id}')">Edit</button>
               <button class="btn-delete" onclick="deleteStudent('${student.id}')">Delete</button>`
            : 'View Only';

        const row = `
            <tr>
                <td>${student.fullName || 'N/A'}</td>
                <td>${student.email || 'N/A'}</td>
                <td>${student.phone || 'N/A'}</td>
                <td>${student.registrationNumber || 'N/A'}</td>
                <td>${student.course || 'Not Assigned'}</td>
                <td>${student.batchTime || 'Not Set'}</td>
                <td>₹${student.totalFees || 0}</td>
                <td style="color: ${student.pendingFees > 0 ? 'red' : 'green'}">₹${student.pendingFees || 0}</td>
                <td>${actions}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// Search Students
function searchStudents() {
    const searchTerm = document.getElementById('searchStudent').value.toLowerCase();
    const filtered = allStudents.filter(student => 
        (student.fullName && student.fullName.toLowerCase().includes(searchTerm)) ||
        (student.email && student.email.toLowerCase().includes(searchTerm)) ||
        (student.registrationNumber && student.registrationNumber.toLowerCase().includes(searchTerm)) ||
        (student.phone && student.phone.includes(searchTerm))
    );
    displayStudents(filtered);
}

// Edit Student
function editStudent(studentId) {
    currentUserId = studentId;
    const student = allStudents.find(s => s.id === studentId);
    
    if (student) {
        document.getElementById('editName').value = student.fullName || '';
        document.getElementById('editEmail').value = student.email || '';
        document.getElementById('editPhone').value = student.phone || '';
        document.getElementById('editRegNo').value = student.registrationNumber || '';
        document.getElementById('editCourse').value = student.course || '';
        document.getElementById('editBatchTime').value = student.batchTime || '';
        document.getElementById('editTotalFees').value = student.totalFees || 0;
        document.getElementById('editPendingFees').value = student.pendingFees || 0;
        document.getElementById('editDuration').value = student.duration || '';
        document.getElementById('editYear').value = student.year || '';
        
        document.getElementById('editModal').style.display = 'block';
    }
}

// Save Student
function saveStudent() {
    if (!currentUserId) return;

    const updates = {
        course: document.getElementById('editCourse').value,
        batchTime: document.getElementById('editBatchTime').value,
        totalFees: parseInt(document.getElementById('editTotalFees').value) || 0,
        pendingFees: parseInt(document.getElementById('editPendingFees').value) || 0,
        duration: document.getElementById('editDuration').value,
        year: document.getElementById('editYear').value
    };

    db.collection('users').doc(currentUserId).update(updates)
        .then(() => {
            alert('Student updated successfully!');
            closeModal('editModal');
            loadStudents();
        })
        .catch(error => {
            alert('Error updating student: ' + error.message);
        });
}

// Delete Student
function deleteStudent(studentId) {
    if (!confirm('Are you sure you want to delete this student?')) return;

    db.collection('users').doc(studentId).delete()
        .then(() => {
            alert('Student deleted successfully!');
            loadStudents();
        })
        .catch(error => {
            alert('Error deleting student: ' + error.message);
        });
}

// Close Modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    currentUserId = null;
    currentFacultyId = null;
}

// Show Section
function showSection(section) {
    document.getElementById('studentsSection').style.display = 'none';
    document.getElementById('facultiesSection').style.display = 'none';
    document.getElementById('gallerySection').style.display = 'none';
    
    if (section === 'students') {
        document.getElementById('studentsSection').style.display = 'block';
        loadStudents();
    } else if (section === 'faculties') {
        document.getElementById('facultiesSection').style.display = 'block';
        loadFaculties();
    } else if (section === 'gallery') {
        document.getElementById('gallerySection').style.display = 'block';
        initGallerySection();
    }
}

// Toggle Mobile Menu
function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// Close Mobile Menu
function closeMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
}

// Close modal on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}
