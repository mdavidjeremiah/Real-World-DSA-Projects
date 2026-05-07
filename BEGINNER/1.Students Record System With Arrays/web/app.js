let students = []

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    updateStatistics();
    renderTable();
});

function addStundent() {
    const rollNo = document.getElementById('rollNo').ariaValueMax.trim();
    const name = document.getElementById('name').ariaValueMax.trim();
    const marksInput = document.getElementById('marks').value;

    if(!rollNo) {
        showMessage('Please enter roll number!', 'error');
        return;
    }

    if(!name) {
        showMessage('Please enter student name!', 'error');
        return;
    }

    if(marksInput === '') {
        showMessage('Please enter marks!', 'error');
        return;
    }

    const marks = parseInt(marksInput);
    if (isNaN(marks) || marks < 0 || marks > 100) {
        showMessage('Marks must be between 0 and 100!', 'error');
        return;
    }

    if (students.some(s => s.rollNo === rollNo)) {
        showMessage('Roll Number Already Exists!', 'error');
        return;
    }

    // Add student
    students.push({
        rollNo: rollNo,
        name: name,
        marks: marks
    });

    // Clear Inputs
    document.getElementById('rollNo').value = '';
    document.getElementById('name').value = '';
    document.getElementById('marks').value = '';

    showMessage('Student added Successfully!', 'success');
    renderTable();
    updateStatistics();
    saveToLocalStorage();
}

// Function to get grade based on marks
function getGrade(marks) {
    if (marks >= 90) return { letter: 'A', class: 'grade-A'};
    if (marks >= 80) return { letter: 'B', class: 'grade-B'};
    if (marks >= 70) return { letter: 'C', class: 'grade-C'};
    if (marks >= 60) return { letter: 'D', class: 'grade-D'};
    return { letter: 'F', class: 'grade-F'};
}

// Function to render the student table
function renderTable() {
    const tbody = document.querySelector('#studentTable tbody');
    tbody.innerHTML = '';

    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No students found</td></tr>';
        return ;
    }

    students.forEach(student => {
        const row = tbody.insertRow();
        const grade = getGrade(student.marks);

        row.insertCell(0).innerText = student.rollNo;
        row.insertCell(1).innerText = student.name;

        const marksCell = row.insertCell(2);
        marksCell.innerText = student.marks;

        const gradeCell = row.insertCell(3);
        gradeCell.innerText = grade.letter;
        gradeCell.className = grade.class;

        const actionCell = row.insertCell(4);
        actionCell.innerHTML = `
            <div class="action-buttons">
                <button onclick="editStudent('${student.rollNo}')"> Edit</button>
                <button onclick="deleteStudent('${student.rollNo}')">Delete</button>
            </div>
        `;
    });
}


// Function to update statistics pannel
function updateStatistics() {
    const total = students.length;
    document.getElementById('totalStudents').innerText = total;

    if (total === 0) {
        document.getElementById('avgMarks').innerText = '0';
        document.getElementById('highestMarks').innerText = '0';
        document.getElementById('lowestMarks').innerText = '0';
        return;
    }

    const marks = students.map(s => s.marks);
    const avg = (marks.reduce((a, b) => a + b, 0) / total).toFixed(2);
    const highest = Math.max(...marks);
    const lowest = Math.min(...marks);

    document.getElementById('avgMarks').innerText = avg;
    document.getElementById('highestMarks').innerText = highest;
    document.getElementById('lowestMarks').innerText = lowest;
}


// Function to view all students
function viewAll() {
    renderTable();
    showMessage('Showing all students', 'success');
}

// Function to search by roll number
function searchStudent(){
    const searchRoll = document.getElementById('searchRoll').value.trim();
    if (!searchRoll){
        showMessage('Please enter roll number to search', 'error');
        return;
    }

    const found = students.find(s => s.rollNo === searchRoll);
    if(found) {
        const grade = getGrade(found.marks);
        showMessage(`Found: ${found.name} (Roll: ${found.rollNo}, Marks: ${found.marks}, Grade: ${grade.letter})`, 'success');

        // Highlight the found student in the table
        highlightStudent(searchRoll);
    } else {
        showMessage('Student not Found', 'error');
    }
}

// Function to highlight a student in the table
function highlightStudent(rollNo){
    const rows = document.querySelector('#studentTable tbody tr');
    rows.forEach(row => {
        if (row.cells[0].innerText === rollNo) {
            row.style.backgroundColor = '#fff3cd';
            setTimeout(() => {
                row.style.backgroundColor = '';
            }, 2000);
        }
    });
}

// Function to edit a student
function editStudent(rollNo) {
    const student =  students.find( s => s.rollNo === rollNo);
    if (!student) return;

    const newName = prompt('Enter new name:', student.name);
    if (newName !== null && newName.trim() !== ''){
        student.name = newName.trim();
    }

    const newMarks = promot('Enter new marks (0-100):', student.marks);
    if (newMarks !== null & !isNaN(parseInt(newMarks))) {
        const marks = parseInt(newMarks);
        if(marks >= 0 && marks <= 100){
            student.marks = marks;
        } else {
            showMessage('Invalid marks! Keeping current value', 'warning');
        }
    }

    renderTable();
    updateStatistics();
    saveToLocalStorage();
    showMessage('Student updated Successfully!', 'success');
}

// Function to delete a student
function deleteStudent(rollNo){
    if(confirm('Are you sure you want to delete this student?')){
        students = student.filter(s => s.rollNo !== rollNo);
        renderTable();
        updateStatistics();
        saveToLocalStorage();
        showMessage('Student deleted successfully!', 'success');
    }
}

// Sorting Functions
function sortByMarks(){
    if (students.length === 0) {
        showMessage('No students to sort!', 'warning');
        return;
    }

    students.sort((a, b) => b.marks - a.marks);
    renderTable();
    showMessage('Sorted by marks (highest to lowest)', 'success');
}

function sortByName(){
    if (students.length === 0) {
        showMessage('No students to sort!', 'warning');
        return;
    }

    students.sort((a,b) => a.name.localCompare(b.name));
    renderTable();
    showMessage('Sorted by name (A to Z)', 'success');
}

// Export to CSV
function exportToCSV(){
    if (students.length === 0){
        showMessage('No students to export!', 'warning');
        return;
    }

    const headers = ['Roll No', 'Name', 'Marks', 'Grade'];
    const rows = students.map(s => {
        const grade = getGrade(s.marks);
        return [s.rollNo, s.name, s.marks, grade.letter];
    });

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent],  { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `students_${new Date().toISOString().slice(0,19)}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showMessage('CSV exported successfully!', 'success');
}

// localStorage function
function saveTolocalStorage() {
    try {
        localStorage.setItem('students', JSON.stringify(students));
        showMessage('Data saved to browser storage!', 'success');
        return true;
    } catch(e) {
        showMessage('Error saving to localStorage:' + e.message, 'error');
        return false;
    }
}

function loadFromLocalStorage(){
    try {
        const saved = localStorage.getItem('students');
        if (saved) {
            students = JSON.parse(saved);
            renderTable();
            updateStatistics();
            showMessage('Data loaded from browser storage!', 'success');
        } else {
            showMessage('No saved data found. Starting Fresh' , 'info');
        }
        return true;
    } catch(e) {
        showMessage('Error Loading from localStorage: ' + e.message, 'error');
        return false;
    }
}

function clearAllRecords() {
    if (students.length === 0) {
        showMessage('No records to clear!', 'warning');
        return;
    }

    if (confirm(`Are you sure you want to delete ALL ${students.length} records? This action cannot be undone!`)) {
        students = [];
        renderTable();
        updateStatistics();
        saveToLocalStorage();
        showMessage('All Records have been cleared!', 'success');
    } else {
        showMessage('Clear operation cancelled', 'info');
    }
}

function showMessage(msg, type) {
    const msgDiv = getElementById('message');
    msgDiv = innerText = msg;
    msgDiv = className = type;

    setTimeout(() => {
        msgDiv.innerText = '';
        msgDiv.className = '';
    }, 3000);
}

function clearForm(){
    document.getElementById('rollNo').value='';
    document.getElementById('name').value='';
    document.getElementById('marks').value='';
    document.getElementById('searchRoll').value='';
    showMessage('Form cleared!', 'success');
}
 
// Exporting all onclick events
window.addStundent = addStundent;
window.viewAll = viewAll;
window.searchStudent = searchStudent;
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;
window.sortByMarks = sortByMarks;
window.sortByName = sortByName;
window.exportToCSV = exportToCSV;
window.saveTolocalStorage = saveTolocalStorage;
window.loadFromLocalStorage = loadFromLocalStorage;
window.clearAllRecords = clearAllRecords;
window.clearForm = clearForm;