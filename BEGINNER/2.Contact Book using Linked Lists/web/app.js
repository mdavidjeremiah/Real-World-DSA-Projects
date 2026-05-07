// Node class for Linked List
class Node {
    constructor(name, phone, email) {
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.next = null;
    }
}

// Linked List class for Contact Management
class ContactList {
    constructor() {
        this.head = null;
        this.size = 0;
    }
    
    // Add contact to the end
    addContact(name, phone, email) {
        const newNode = new Node(name, phone, email);
        
        if (!this.head) {
            this.head = newNode;
        } else {
            let current = this.head;
            while (current.next) {
                current = current.next;
            }
            current.next = newNode;
        }
        
        this.size++;
        return true;
    }
    
    // Add contact at specific position (0-based index)
    addContactAt(index, name, phone, email) {
        if (index < 0 || index > this.size) {
            return false;
        }
        
        const newNode = new Node(name, phone, email);
        
        if (index === 0) {
            newNode.next = this.head;
            this.head = newNode;
        } else {
            let current = this.head;
            let prev = null;
            let count = 0;
            
            while (count < index) {
                prev = current;
                current = current.next;
                count++;
            }
            
            prev.next = newNode;
            newNode.next = current;
        }
        
        this.size++;
        return true;
    }
    
    // Delete contact by name (first occurrence)
    deleteContact(name) {
        if (!this.head) return false;
        
        if (this.head.name.toLowerCase() === name.toLowerCase()) {
            this.head = this.head.next;
            this.size--;
            return true;
        }
        
        let current = this.head;
        let prev = null;
        
        while (current && current.name.toLowerCase() !== name.toLowerCase()) {
            prev = current;
            current = current.next;
        }
        
        if (current) {
            prev.next = current.next;
            this.size--;
            return true;
        }
        
        return false;
    }
    
    // Delete contact by index
    deleteContactAt(index) {
        if (index < 0 || index >= this.size) return false;
        
        if (index === 0) {
            this.head = this.head.next;
        } else {
            let current = this.head;
            let prev = null;
            let count = 0;
            
            while (count < index) {
                prev = current;
                current = current.next;
                count++;
            }
            
            prev.next = current.next;
        }
        
        this.size--;
        return true;
    }
    
    // Search contacts (by name or phone)
    searchContacts(query) {
        if (!query) return this.getAllContacts();
        
        const results = [];
        let current = this.head;
        query = query.toLowerCase();
        
        while (current) {
            if (current.name.toLowerCase().includes(query) || 
                current.phone.includes(query)) {
                results.push({
                    name: current.name,
                    phone: current.phone,
                    email: current.email
                });
            }
            current = current.next;
        }
        
        return results;
    }
    
    // Get all contacts as array
    getAllContacts() {
        const contacts = [];
        let current = this.head;
        
        while (current) {
            contacts.push({
                name: current.name,
                phone: current.phone,
                email: current.email
            });
            current = current.next;
        }
        
        return contacts;
    }
    
    // Reverse the linked list
    reverse() {
        let prev = null;
        let current = this.head;
        let next = null;
        
        while (current) {
            next = current.next;
            current.next = prev;
            prev = current;
            current = next;
        }
        
        this.head = prev;
        return true;
    }
    
    // Get size of list
    getSize() {
        return this.size;
    }
    
    // Clear all contacts
    clear() {
        this.head = null;
        this.size = 0;
    }
    
    // Get contact at specific index
    getContactAt(index) {
        if (index < 0 || index >= this.size) return null;
        
        let current = this.head;
        let count = 0;
        
        while (count < index) {
            current = current.next;
            count++;
        }
        
        return {
            name: current.name,
            phone: current.phone,
            email: current.email
        };
    }
}

// Initialize contact list
let contactList = new ContactList();

// Load sample data
function loadSampleData() {
    contactList.addContact("Litmus Gatie", "+256702866529", "litmus@gmail.com");
    contactList.addContact("David Gatie", "+256703566446", "gatie@gmail.com");
    contactList.addContact("Jonah Niler", "+256751146428", "jonahniler67@gmail.com");
    contactList.addContact("Litmus Tech Solutions", "+256757984892", "litmustechsolutions@gmail.com");

    updateDisplay();
    showMessage("Sample contacts loaded!", "info");
}

// Add new contact
function addContact() {
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    
    if (!name || !phone || !email) {
        showMessage("Please fill all fields!", "error");
        return;
    }
    
    // Basic phone validation
    const phoneRegex = /^[\d+\-\s()]+$/;
    if (!phoneRegex.test(phone)) {
        showMessage("Please enter a valid phone number!", "error");
        return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage("Please enter a valid email address!", "error");
        return;
    }
    
    if (contactList.addContact(name, phone, email)) {
        document.getElementById('name').value = '';
        document.getElementById('phone').value = '';
        document.getElementById('email').value = '';
        updateDisplay();
        showMessage(`Contact "${name}" added successfully!`, "success");
        updateLastOperation(`Added: ${name}`);
    } else {
        showMessage("Failed to add contact!", "error");
    }
}

// Search contacts
function searchContacts() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) {
        displayAllContacts();
        return;
    }
    
    const results = contactList.searchContacts(query);
    displayContacts(results);
    
    if (results.length === 0) {
        showMessage(`No contacts found matching "${query}"`, "warning");
    } else {
        showMessage(`Found ${results.length} contact(s) matching "${query}"`, "success");
    }
    updateLastOperation(`Searched: ${query}`);
}

// Clear search
function clearSearch() {
    document.getElementById('searchInput').value = '';
    displayAllContacts();
    showMessage("Search cleared", "info");
}

// Display all contacts
function displayAllContacts() {
    const allContacts = contactList.getAllContacts();
    displayContacts(allContacts);
    updateLastOperation("Displayed all contacts");
}

// Display contacts in grid
function displayContacts(contacts) {
    const container = document.getElementById('contactsList');
    
    if (contacts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"></div>
                <p>No contacts found</p>
                <small>Add your first contact using the form above</small>
            </div>
        `;
        updateVisualization([]);
        return;
    }
    
    container.innerHTML = contacts.map((contact, index) => `
        <div class="contact-card">
            <div class="contact-name">${escapeHtml(contact.name)}</div>
            <div class="contact-phone">
                ${escapeHtml(contact.phone)}
            </div>
            <div class="contact-email">
                ${escapeHtml(contact.email)}
            </div>
            <div class="contact-actions">
                <button onclick="editContact(${index})">Edit</button>
                <button onclick="deleteContactByName('${escapeHtml(contact.name)}')">Delete</button>
            </div>
        </div>
    `).join('');
    
    updateVisualization(contacts);
    updateStatistics();
}

// Update linked list visualization
function updateVisualization(contacts) {
    const vizContainer = document.getElementById('linkedListVisualization');
    
    if (contacts.length === 0) {
        vizContainer.innerHTML = `
            <div class="empty-state" style="padding: 30px;">
                <div class="empty-state-icon"></div>
                <p>Empty Linked List</p>
                <small>Head → null</small>
            </div>
        `;
        return;
    }
    
    let vizHtml = '';
    contacts.forEach((contact, index) => {
        vizHtml += `
            <div class="list-node">
                <div class="node-box">
                    <div class="node-name">${escapeHtml(contact.name)}</div>
                    <div class="node-phone">${escapeHtml(contact.phone)}</div>
                </div>
                ${index < contacts.length - 1 ? '<div class="node-arrow">→</div>' : '<div class="node-arrow">→ null</div>'}
            </div>
        `;
    });
    
    vizContainer.innerHTML = `
        <div style="font-size: 0.8em; color: #7f8c8d; margin-bottom: 10px;">Head</div>
        ${vizHtml}
    `;
}

// Delete contact by name
function deleteContactByName(name) {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
        if (contactList.deleteContact(name)) {
            updateDisplay();
            showMessage(`Contact "${name}" deleted successfully!`, "success");
            updateLastOperation(`Deleted: ${name}`);
        } else {
            showMessage("Contact not found!", "error");
        }
    }
}

// Edit contact (simple implementation)
function editContact(index) {
    const contact = contactList.getContactAt(index);
    if (!contact) return;
    
    const newName = prompt("Enter new name:", contact.name);
    if (newName && newName.trim()) {
        const newPhone = prompt("Enter new phone:", contact.phone);
        const newEmail = prompt("Enter new email:", contact.email);
        
        if (newPhone && newEmail) {
            // Delete old and add updated
            contactList.deleteContact(contact.name);
            contactList.addContact(newName.trim(), newPhone.trim(), newEmail.trim());
            updateDisplay();
            showMessage(`Contact updated successfully!`, "success");
            updateLastOperation(`Edited: ${contact.name} → ${newName}`);
        }
    }
}

// Reverse the linked list
function reverseList() {
    if (contactList.getSize() === 0) {
        showMessage("No contacts to reverse!", "warning");
        return;
    }
    
    contactList.reverse();
    updateDisplay();
    showMessage("Linked list reversed successfully!", "success");
    updateLastOperation("Reversed list");
}

// Export to JSON
function exportToJSON() {
    const contacts = contactList.getAllContacts();
    const data = {
        contacts: contacts,
        size: contactList.getSize(),
        exportDate: new Date().toISOString()
    };
    
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts_${new Date().toISOString().slice(0,19)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showMessage("Contacts exported to JSON!", "success");
    updateLastOperation("Exported to JSON");
}

// Import from JSON
function importFromJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = event => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.contacts && Array.isArray(data.contacts)) {
                    contactList.clear();
                    data.contacts.forEach(contact => {
                        if (contact.name && contact.phone && contact.email) {
                            contactList.addContact(contact.name, contact.phone, contact.email);
                        }
                    });
                    
                    updateDisplay();
                    showMessage(`Imported ${contactList.getSize()} contacts successfully!`, "success");
                    updateLastOperation("Imported from JSON");
                } else {
                    showMessage("Invalid JSON format!", "error");
                }
            } catch (err) {
                showMessage("Error parsing JSON file!", "error");
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Clear all contacts
function clearAllContacts() {
    if (contactList.getSize() === 0) {
        showMessage("No contacts to clear!", "warning");
        return;
    }
    
    if (confirm(`Are you sure you want to delete ALL ${contactList.getSize()} contacts? This cannot be undone!`)) {
        contactList.clear();
        updateDisplay();
        showMessage("All contacts cleared!", "success");
        updateLastOperation("Cleared all");
    }
}

// Update statistics
function updateStatistics() {
    const size = contactList.getSize();
    document.getElementById('totalContacts').innerText = size;
    document.getElementById('listSize').innerText = size;
}

// Update last operation
function updateLastOperation(operation) {
    document.getElementById('lastOperation').innerText = operation;
    setTimeout(() => {
        if (document.getElementById('lastOperation').innerText === operation) {
            document.getElementById('lastOperation').innerText = "Ready";
        }
    }, 3000);
}

// Update entire display
function updateDisplay() {
    displayAllContacts();
    updateStatistics();
}

// Helper function to escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Helper function to show messages
function showMessage(msg, type) {
    const msgDiv = document.getElementById('message');
    msgDiv.innerHTML = msg;
    msgDiv.className = `message ${type}`;
    
    setTimeout(() => {
        msgDiv.innerHTML = '';
        msgDiv.className = 'message';
    }, 3000);
}

// Initialize with sample data
loadSampleData();

// Export functions for HTML onclick events
window.addContact = addContact;
window.searchContacts = searchContacts;
window.clearSearch = clearSearch;
window.displayAllContacts = displayAllContacts;
window.reverseList = reverseList;
window.exportToJSON = exportToJSON;
window.importFromJSON = importFromJSON;
window.clearAllContacts = clearAllContacts;
window.deleteContactByName = deleteContactByName;
window.editContact = editContact;