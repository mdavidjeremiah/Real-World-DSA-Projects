// Stack class implementation
class Stack {
    constructor() {
        this.items = [];
    }
    
    push(element) {
        this.items.push(element);
    }
    
    pop() {
        if (this.isEmpty()) return null;
        return this.items.pop();
    }
    
    peek() {
        if (this.isEmpty()) return null;
        return this.items[this.items.length - 1];
    }
    
    isEmpty() {
        return this.items.length === 0;
    }
    
    size() {
        return this.items.length;
    }
    
    clear() {
        this.items = [];
    }
    
    getAll() {
        return [...this.items];
    }
}

// Action class to store state
class Action {
    constructor(content, timestamp) {
        this.content = content;
        this.timestamp = timestamp || new Date();
        this.id = Date.now() + Math.random();
    }
    
    getFormattedTime() {
        return this.timestamp.toLocaleTimeString();
    }
}

// UndoRedoManager class
class UndoRedoManager {
    constructor() {
        this.undoStack = new Stack();
        this.redoStack = new Stack();
        this.currentContent = "";
        this.maxHistory = 50; // Limit history size
    }
    
    // Save current state before making changes
    saveState(content) {
        // Don't save if content is same as last saved
        if (!this.undoStack.isEmpty()) {
            const lastState = this.undoStack.peek();
            if (lastState.content === content) {
                return;
            }
        }
        
        const action = new Action(content);
        this.undoStack.push(action);
        
        // Limit history size
        if (this.undoStack.size() > this.maxHistory) {
            const oldStates = [];
            while (this.undoStack.size() > this.maxHistory) {
                oldStates.push(this.undoStack.pop());
            }
            // Rebuild stack without oldest items
            while (oldStates.length) {
                this.undoStack.push(oldStates.pop());
            }
        }
        
        // Clear redo stack when new action is performed
        this.redoStack.clear();
        this.currentContent = content;
    }
    
    // Undo last action
    undo() {
        if (this.undoStack.isEmpty()) {
            return { success: false, content: null, message: "Nothing to undo!" };
        }
        
        const currentAction = this.undoStack.pop();
        this.redoStack.push(currentAction);
        
        let previousContent = "";
        if (!this.undoStack.isEmpty()) {
            previousContent = this.undoStack.peek().content;
        } else {
            previousContent = "";
        }
        
        this.currentContent = previousContent;
        
        return { 
            success: true, 
            content: previousContent,
            message: `Undo: ${currentAction.content.substring(0, 50)}...`
        };
    }
    
    // Redo last undone action
    redo() {
        if (this.redoStack.isEmpty()) {
            return { success: false, content: null, message: "Nothing to redo!" };
        }
        
        const action = this.redoStack.pop();
        this.undoStack.push(action);
        this.currentContent = action.content;
        
        return { 
            success: true, 
            content: action.content,
            message: `Redo: ${action.content.substring(0, 50)}...`
        };
    }
    
    // Get full history
    getHistory() {
        return this.undoStack.getAll().reverse();
    }
    
    // Clear all history
    clearHistory() {
        this.undoStack.clear();
        this.redoStack.clear();
        this.currentContent = "";
    }
    
    // Get stack sizes
    getStackSizes() {
        return {
            undoSize: this.undoStack.size(),
            redoSize: this.redoStack.size(),
            undoTop: this.undoStack.peek()?.content.substring(0, 30) || "None",
            redoTop: this.redoStack.peek()?.content.substring(0, 30) || "None"
        };
    }
}

// Initialize manager
const manager = new UndoRedoManager();
let isUpdating = false; // Prevent recursive updates

// DOM Elements
const editor = document.getElementById('editor');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const charCount = document.getElementById('charCount');
const wordCount = document.getElementById('wordCount');
const lineCount = document.getElementById('lineCount');

// Handle input from editor
function handleInput() {
    if (isUpdating) return;
    
    const content = editor.value;
    manager.saveState(content);
    updateStats(content);
    updateStackVisualization();
    updateButtonStates();
}

// Update statistics
function updateStats(content) {
    charCount.innerText = content.length;
    
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    wordCount.innerText = words;
    
    const lines = content ? content.split('\n').length : 0;
    lineCount.innerText = lines;
}

// Undo operation
function undo() {
    const result = manager.undo();
    if (result.success) {
        isUpdating = true;
        editor.value = result.content;
        updateStats(result.content);
        updateStackVisualization();
        updateButtonStates();
        showMessage(result.message, "success");
        isUpdating = false;
    } else {
        showMessage(result.message, "warning");
    }
}

// Redo operation
function redo() {
    const result = manager.redo();
    if (result.success) {
        isUpdating = true;
        editor.value = result.content;
        updateStats(result.content);
        updateStackVisualization();
        updateButtonStates();
        showMessage(result.message, "success");
        isUpdating = false;
    } else {
        showMessage(result.message, "warning");
    }
}

// Clear all content and history
function clearAll() {
    if (confirm("⚠️ Clear all content and history? This cannot be undone!")) {
        manager.clearHistory();
        editor.value = "";
        updateStats("");
        updateStackVisualization();
        updateButtonStates();
        showMessage("All content and history cleared!", "info");
    }
}

// Update stack visualization
function updateStackVisualization() {
    // Update undo stack visualization
    const undoStackDiv = document.getElementById('undoStack');
    const undoItems = manager.undoStack.getAll();
    
    if (undoItems.length === 0) {
        undoStackDiv.innerHTML = '<div class="empty-stack">Empty - No actions yet</div>';
    } else {
        undoStackDiv.innerHTML = undoItems.slice().reverse().map(action => `
            <div class="stack-item">
                <strong>${action.getFormattedTime()}</strong><br>
                ${escapeHtml(action.content.substring(0, 50))}${action.content.length > 50 ? '...' : ''}
            </div>
        `).join('');
    }
    
    // Update redo stack visualization
    const redoStackDiv = document.getElementById('redoStack');
    const redoItems = manager.redoStack.getAll();
    
    if (redoItems.length === 0) {
        redoStackDiv.innerHTML = '<div class="empty-stack">Empty - Nothing to redo</div>';
    } else {
        redoStackDiv.innerHTML = redoItems.slice().reverse().map(action => `
            <div class="stack-item">
                <strong>${action.getFormattedTime()}</strong><br>
                ${escapeHtml(action.content.substring(0, 50))}${action.content.length > 50 ? '...' : ''}
            </div>
        `).join('');
    }
    
    // Update stats
    const sizes = manager.getStackSizes();
    document.getElementById('undoSize').innerText = sizes.undoSize;
    document.getElementById('redoSize').innerText = sizes.redoSize;
    document.getElementById('undoTop').innerText = sizes.undoTop;
    document.getElementById('redoTop').innerText = sizes.redoTop;
}

// Update button states
function updateButtonStates() {
    undoBtn.disabled = manager.undoStack.isEmpty();
    redoBtn.disabled = manager.redoStack.isEmpty();
    
    undoBtn.style.opacity = manager.undoStack.isEmpty() ? "0.5" : "1";
    redoBtn.style.opacity = manager.redoStack.isEmpty() ? "0.5" : "1";
}

// Show history panel
function showHistory() {
    const history = manager.getHistory();
    const panel = document.getElementById('historyPanel');
    const historyList = document.getElementById('historyList');
    
    if (history.length === 0) {
        historyList.innerHTML = '<div class="empty-stack">No history available</div>';
    } else {
        historyList.innerHTML = history.map(action => `
            <div class="history-item">
                <strong>${action.getFormattedTime()}</strong><br>
                ${escapeHtml(action.content.substring(0, 100))}${action.content.length > 100 ? '...' : ''}
                <br><small>Length: ${action.content.length} chars</small>
            </div>
        `).join('');
    }
    
    panel.style.display = 'block';
}

// Close history panel
function closeHistory() {
    document.getElementById('historyPanel').style.display = 'none';
}

// Show message
function showMessage(msg, type) {
    const msgDiv = document.getElementById('message');
    msgDiv.innerHTML = msg;
    msgDiv.className = `message ${type}`;
    
    setTimeout(() => {
        msgDiv.innerHTML = '';
        msgDiv.className = 'message';
    }, 3000);
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

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Z') {
        e.preventDefault();
        redo();
    }
});

// Initialize with empty state
updateStackVisualization();
updateButtonStates();
showMessage("Ready! Try typing and using Undo/Redo (Ctrl+Z / Ctrl+Y)", "info");

// Export for HTML onclick
window.undo = undo;
window.redo = redo;
window.clearAll = clearAll;
window.showHistory = showHistory;
window.closeHistory = closeHistory;
window.handleInput = handleInput;