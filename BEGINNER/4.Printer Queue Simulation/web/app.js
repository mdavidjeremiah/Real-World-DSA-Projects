// Print Job Class
class PrintJob {
    constructor(id, documentName, pages, userName) {
        this.id = id;
        this.documentName = documentName;
        this.pages = pages;
        this.userName = userName;
        this.submitTime = new Date();
        this.startTime = null;
        this.endTime = null;
        this.status = 'waiting';
        this.progress = 0;
    }

    getEstimatedTime() {
        return this.pages * 1; // 1 second per page for simulation
    }

    getWaitTime() {
        if (this.startTime) {
            return (this.startTime - this.submitTime) / 1000;
        }
        return null;
    }

    getProcessingTime() {
        if (this.endTime && this.startTime) {
            return (this.endTime - this.startTime) / 1000;
        }
        return null;
    }
}

// Printer Class
class Printer {
    constructor(id, name, speed) {
        this.id = id;
        this.name = name;
        this.speed = speed; // pages per second
        this.currentJob = null;
        this.isBusy = false;
        this.jobStartTime = null;
        this.jobsPrinted = 0;
        this.pagesPrinted = 0;
        this.progress = 0;
    }

    assignJob(job) {
        if (this.isBusy) return false;
        
        this.currentJob = job;
        this.isBusy = true;
        this.jobStartTime = new Date();
        job.startTime = this.jobStartTime;
        job.status = 'printing';
        this.progress = 0;
        return true;
    }

    process(currentTime) {
        if (!this.isBusy || !this.currentJob) return null;
        
        const elapsed = (currentTime - this.jobStartTime) / 1000;
        const totalTime = this.currentJob.getEstimatedTime();
        this.progress = Math.min(100, (elapsed / totalTime) * 100);
        
        if (elapsed >= totalTime) {
            // Job completed
            this.currentJob.endTime = new Date();
            this.currentJob.status = 'completed';
            const completedJob = this.currentJob;
            this.jobsPrinted++;
            this.pagesPrinted += completedJob.pages;
            this.currentJob = null;
            this.isBusy = false;
            this.progress = 0;
            return completedJob;
        }
        
        return null;
    }
}

// Queue Implementation
class Queue {
    constructor() {
        this.items = [];
    }

    enqueue(item) {
        this.items.push(item);
    }

    dequeue() {
        if (this.isEmpty()) return null;
        return this.items.shift();
    }

    peek() {
        if (this.isEmpty()) return null;
        return this.items[0];
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

// Main Printer Queue System
class PrinterQueueSystem {
    constructor() {
        this.queue = new Queue();
        this.printers = [];
        this.completedJobs = [];
        this.nextJobId = 1;
        this.totalJobs = 0;
        this.simulationInterval = null;
        this.isSimulating = false;
    }

    addPrinter(name, speed) {
        const printer = new Printer(this.printers.length + 1, name, speed);
        this.printers.push(printer);
        return printer;
    }

    submitJob(documentName, pages, userName) {
        if (!documentName || pages < 1 || pages > 500) {
            return { success: false, message: "Invalid job details!" };
        }

        const job = new PrintJob(this.nextJobId++, documentName, pages, userName);
        this.queue.enqueue(job);
        this.totalJobs++;
        
        return { success: true, job: job };
    }

    processPrinters() {
        const now = new Date();
        const completed = [];
        
        // Process each printer
        for (const printer of this.printers) {
            const completedJob = printer.process(now);
            if (completedJob) {
                completed.push(completedJob);
                this.completedJobs.unshift(completedJob);
            }
        }
        
        // Assign waiting jobs to idle printers
        for (const printer of this.printers) {
            if (!printer.isBusy && !this.queue.isEmpty()) {
                const nextJob = this.queue.dequeue();
                printer.assignJob(nextJob);
            }
        }
        
        return completed;
    }

    getStatistics() {
        const queueSize = this.queue.size();
        const completedCount = this.completedJobs.length;
        const totalPages = this.printers.reduce((sum, p) => sum + p.pagesPrinted, 0);
        
        // Calculate average wait time
        const completedWithWait = this.completedJobs.filter(j => j.getWaitTime());
        const avgWait = completedWithWait.length > 0
            ? completedWithWait.reduce((sum, j) => sum + j.getWaitTime(), 0) / completedWithWait.length
            : 0;
        
        // Calculate success rate
        const successRate = this.totalJobs > 0 ? (completedCount / this.totalJobs) * 100 : 0;
        
        return {
            totalJobs: this.totalJobs,
            completedJobs: completedCount,
            queueSize: queueSize,
            totalPages: totalPages,
            avgWaitTime: avgWait,
            successRate: successRate
        };
    }

    clearQueue() {
        this.queue.clear();
    }

    reset() {
        this.clearQueue();
        this.completedJobs = [];
        this.printers.forEach(printer => {
            printer.currentJob = null;
            printer.isBusy = false;
            printer.jobsPrinted = 0;
            printer.pagesPrinted = 0;
            printer.progress = 0;
        });
        this.totalJobs = 0;
        this.nextJobId = 1;
    }
}

// Initialize System
const system = new PrinterQueueSystem();

// Add printers
system.addPrinter("HP LaserJet Pro", 1); // 1 page per second
system.addPrinter("Canon ImageClass", 1.2); // 1.2 pages per second
system.addPrinter("Brother HL-L2350", 0.8); // 0.8 pages per second

// DOM Elements
let simulationInterval = null;

// Update UI
function updateUI() {
    updateStatistics();
    updatePrinters();
    updateQueueVisualization();
    updateHistory();
}

function updateStatistics() {
    const stats = system.getStatistics();
    document.getElementById('totalJobs').innerText = stats.totalJobs;
    document.getElementById('completedJobs').innerText = stats.completedJobs;
    document.getElementById('queueSize').innerText = stats.queueSize;
    document.getElementById('totalPages').innerText = stats.totalPages;
    document.getElementById('avgWaitTime').innerText = `${stats.avgWaitTime.toFixed(1)}s`;
    document.getElementById('successRate').innerText = `${stats.successRate.toFixed(1)}%`;
}

function updatePrinters() {
    const grid = document.getElementById('printersGrid');
    
    grid.innerHTML = system.printers.map(printer => `
        <div class="printer-card ${printer.isBusy ? 'busy' : ''}">
            <div class="printer-header">
                <div class="printer-name">🖨️ ${printer.name}</div>
                <div class="printer-status ${printer.isBusy ? 'status-busy' : 'status-idle'}">
                    ${printer.isBusy ? '🔴 BUSY' : '🟢 IDLE'}
                </div>
            </div>
            <div class="printer-stats">
                <p>📄 Jobs Printed: ${printer.jobsPrinted}</p>
                <p>📑 Pages Printed: ${printer.pagesPrinted}</p>
                <p>⚡ Speed: ${printer.speed} pages/sec</p>
            </div>
            ${printer.isBusy && printer.currentJob ? `
                <div class="current-job">
                    <strong>Current Job:</strong><br>
                    📄 ${escapeHtml(printer.currentJob.documentName)}<br>
                    👤 ${escapeHtml(printer.currentJob.userName)}<br>
                    📑 ${printer.currentJob.pages} pages
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${printer.progress}%"></div>
                    </div>
                    <small>${printer.progress.toFixed(0)}% complete</small>
                </div>
            ` : ''}
        </div>
    `).join('');
}

function updateQueueVisualization() {
    const container = document.getElementById('queueVisualization');
    const jobs = system.queue.getAll();
    
    if (jobs.length === 0) {
        container.innerHTML = '<div class="empty-queue">📭 No jobs in queue - Add some print jobs!</div>';
        return;
    }
    
    container.innerHTML = jobs.map(job => `
        <div class="queue-job">
            <div class="job-name">📄 ${escapeHtml(job.documentName)}</div>
            <div class="job-details">
                👤 ${escapeHtml(job.userName)}<br>
                📑 ${job.pages} pages | ⏱️ ~${job.getEstimatedTime()}s
            </div>
            <small style="font-size: 0.7em; opacity: 0.8;">
                Submitted: ${job.submitTime.toLocaleTimeString()}
            </small>
        </div>
    `).join('');
}

function updateHistory() {
    const container = document.getElementById('historyList');
    const recentJobs = system.completedJobs.slice(0, 10);
    
    if (recentJobs.length === 0) {
        container.innerHTML = '<div class="empty-history">No jobs completed yet</div>';
        return;
    }
    
    container.innerHTML = recentJobs.map(job => {
        const waitTime = job.getWaitTime();
        const processTime = job.getProcessingTime();
        return `
            <div class="history-item">
                <div class="history-item-header">
                    <span>✅ Job #${job.id}: ${escapeHtml(job.documentName)}</span>
                    <span>${job.endTime.toLocaleTimeString()}</span>
                </div>
                <div class="history-item-details">
                    👤 ${escapeHtml(job.userName)} | 📑 ${job.pages} pages<br>
                    ⏱️ Wait: ${waitTime ? waitTime.toFixed(1) : 'N/A'}s | 
                    Print: ${processTime ? processTime.toFixed(1) : 'N/A'}s
                </div>
            </div>
        `;
    }).join('');
}

function showMessage(msg, type) {
    const msgDiv = document.getElementById('message');
    msgDiv.innerHTML = msg;
    msgDiv.className = `message ${type}`;
    
    setTimeout(() => {
        msgDiv.innerHTML = '';
        msgDiv.className = 'message';
    }, 3000);
}

function submitJob() {
    const docName = document.getElementById('docName').value.trim();
    const pages = parseInt(document.getElementById('pages').value);
    const userName = document.getElementById('userName').value.trim() || 'Anonymous';
    
    if (!docName) {
        showMessage('Please enter a document name!', 'error');
        return;
    }
    
    if (isNaN(pages) || pages < 1 || pages > 500) {
        showMessage('Pages must be between 1 and 500!', 'error');
        return;
    }
    
    const result = system.submitJob(docName, pages, userName);
    
    if (result.success) {
        document.getElementById('docName').value = '';
        document.getElementById('pages').value = '5';
        document.getElementById('userName').value = '';
        showMessage(`✅ Job #${result.job.id} submitted successfully!`, 'success');
        updateUI();
        
        // Auto-start simulation if not running
        if (!system.isSimulating && system.queue.size() > 0) {
            startSimulation();
        }
    } else {
        showMessage(result.message, 'error');
    }
}

function processOneSecond() {
    const completed = system.processPrinters();
    if (completed.length > 0) {
        completed.forEach(job => {
            showMessage(`✅ Job #${job.id} completed: ${job.documentName}`, 'success');
        });
    }
    updateUI();
}

function startSimulation() {
    if (simulationInterval) return;
    
    system.isSimulating = true;
    const speedSlider = document.getElementById('speed');
    const speedValue = document.getElementById('speedValue');
    
    const runSimulation = () => {
        if (!system.isSimulating) return;
        processOneSecond();
    };
    
    // Update speed display
    const updateSpeed = () => {
        const speed = parseFloat(speedSlider.value);
        speedValue.innerText = `${speed}x`;
        
        if (simulationInterval) {
            clearInterval(simulationInterval);
            const intervalTime = 1000 / speed;
            simulationInterval = setInterval(runSimulation, intervalTime);
        }
    };
    
    speedSlider.oninput = updateSpeed;
    updateSpeed();
    
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
    document.getElementById('stepBtn').disabled = true;
    
    showMessage('▶️ Simulation started!', 'info');
}

function stopSimulation() {
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
    }
    
    system.isSimulating = false;
    
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    document.getElementById('stepBtn').disabled = false;
    
    showMessage('⏸️ Simulation stopped', 'info');
}

function clearQueue() {
    if (system.queue.size() === 0) {
        showMessage('Queue is already empty!', 'warning');
        return;
    }
    
    if (confirm(`⚠️ Clear ${system.queue.size()} waiting jobs?`)) {
        system.clearQueue();
        updateUI();
        showMessage('🗑️ Queue cleared!', 'success');
    }
}

function resetSystem() {
    if (confirm('⚠️ Reset entire system? This will delete all jobs and history!')) {
        stopSimulation();
        system.reset();
        updateUI();
        showMessage('🔄 System reset successfully!', 'info');
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Initialize UI
updateUI();

// Add some sample jobs for demonstration
setTimeout(() => {
    if (system.totalJobs === 0) {
        system.submitJob("Annual Report.pdf", 15, "John");
        system.submitJob("Invoice #1234.doc", 3, "Sarah");
        system.submitJob("Presentation.pptx", 8, "Mike");
        updateUI();
        showMessage("💡 Sample jobs added! Click 'Start Simulation' to begin.", "info");
    }
}, 500);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        startSimulation();
    } else if (e.ctrlKey && e.key === 'x') {
        e.preventDefault();
        stopSimulation();
    } else if (e.key === ' ' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        if (system.isSimulating) {
            stopSimulation();
        } else {
            startSimulation();
        }
    }
});