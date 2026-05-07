from datetime import datetime, timedelta
from typing import Optional, List, Dict
import json
import time

class PrintJob:
    """Represents a single print job"""
    
    def __init__(self, job_id: int, document_name: str, pages: int, user: str = "Anonymous"):
        self.job_id = job_id
        self.document_name = document_name
        self.pages = pages
        self.user = user
        self.submit_time = datetime.now()
        self.start_time = None
        self.end_time = None
        self.status = "Waiting"  # Waiting, Printing, Completed, Failed
    
    def get_estimated_time(self) -> int:
        """Estimate print time in seconds (5 seconds per page)"""
        return self.pages * 5
    
    def get_wait_time(self) -> Optional[float]:
        """Get waiting time in seconds"""
        if self.start_time:
            return (self.start_time - self.submit_time).total_seconds()
        return None
    
    def get_processing_time(self) -> Optional[float]:
        """Get processing time in seconds"""
        if self.end_time and self.start_time:
            return (self.end_time - self.start_time).total_seconds()
        return None
    
    def to_dict(self) -> Dict:
        return {
            'job_id': self.job_id,
            'document_name': self.document_name,
            'pages': self.pages,
            'user': self.user,
            'submit_time': self.submit_time.isoformat(),
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'status': self.status
        }
    
    def __str__(self) -> str:
        return f"Job #{self.job_id}: '{self.document_name}' ({self.pages} pages) - {self.status}"
    
    def __repr__(self) -> str:
        return self.__str__()

class Queue:
    """Queue implementation using Python list"""
    
    def __init__(self):
        self.items = []
    
    def enqueue(self, item):
        """Add item to the rear of the queue"""
        self.items.append(item)
    
    def dequeue(self):
        """Remove and return item from the front of the queue"""
        if self.is_empty():
            return None
        return self.items.pop(0)
    
    def peek(self):
        """View the front item without removing"""
        if self.is_empty():
            return None
        return self.items[0]
    
    def is_empty(self) -> bool:
        """Check if queue is empty"""
        return len(self.items) == 0
    
    def size(self) -> int:
        """Get the number of items in queue"""
        return len(self.items)
    
    def clear(self):
        """Clear all items"""
        self.items = []
    
    def get_all(self) -> List:
        """Get all items in queue"""
        return self.items.copy()
    
    def __len__(self):
        return len(self.items)
    
    def __str__(self) -> str:
        if self.is_empty():
            return "Empty Queue"
        return " → ".join([str(item) for item in self.items])

class Printer:
    """Represents a printer that processes print jobs"""
    
    def __init__(self, printer_id: int, name: str, pages_per_minute: int = 12):
        self.printer_id = printer_id
        self.name = name
        self.pages_per_minute = pages_per_minute
        self.current_job = None
        self.is_busy = False
        self.job_start_time = None
        self.total_jobs_printed = 0
        self.total_pages_printed = 0
    
    def assign_job(self, job: PrintJob) -> bool:
        """Assign a job to the printer"""
        if self.is_busy:
            return False
        
        self.current_job = job
        self.is_busy = True
        job.start_time = datetime.now()
        job.status = "Printing"
        self.job_start_time = datetime.now()
        return True
    
    def process(self) -> Optional[PrintJob]:
        """Process the current job (simulate printing)"""
        if not self.is_busy or not self.current_job:
            return None
        
        # Simulate printing time
        processing_time = self.current_job.get_estimated_time()
        elapsed_time = (datetime.now() - self.job_start_time).total_seconds()
        
        if elapsed_time >= processing_time:
            # Job completed
            self.current_job.end_time = datetime.now()
            self.current_job.status = "Completed"
            completed_job = self.current_job
            self.total_jobs_printed += 1
            self.total_pages_printed += completed_job.pages
            self.current_job = None
            self.is_busy = False
            return completed_job
        
        return None
    
    def get_status(self) -> Dict:
        """Get printer status"""
        return {
            'printer_id': self.printer_id,
            'name': self.name,
            'is_busy': self.is_busy,
            'current_job': str(self.current_job) if self.current_job else None,
            'jobs_printed': self.total_jobs_printed,
            'pages_printed': self.total_pages_printed
        }
    
    def __str__(self) -> str:
        status = "Busy" if self.is_busy else "Idle"
        return f"Printer {self.printer_id} ({self.name}): {status}"

class PrinterQueueSystem:
    """Manages multiple printers and print queue"""
    
    def __init__(self):
        self.queue = Queue()
        self.printers = []
        self.completed_jobs = []
        self.failed_jobs = []
        self.next_job_id = 1
        self.total_jobs_submitted = 0
    
    def add_printer(self, name: str, pages_per_minute: int = 12) -> Printer:
        """Add a printer to the system"""
        printer_id = len(self.printers) + 1
        printer = Printer(printer_id, name, pages_per_minute)
        self.printers.append(printer)
        return printer
    
    def submit_job(self, document_name: str, pages: int, user: str = "Anonymous") -> Optional[PrintJob]:
        """Submit a new print job to the queue"""
        if pages <= 0:
            print("Error: Pages must be positive")
            return None
        
        if pages > 500:
            print("Warning: Large document (>500 pages) may take time")
        
        job = PrintJob(self.next_job_id, document_name, pages, user)
        self.queue.enqueue(job)
        self.next_job_id += 1
        self.total_jobs_submitted += 1
        
        print(f"✅ Job #{job.job_id} submitted: '{document_name}' ({pages} pages)")
        return job
    
    def process_printers(self) -> List[PrintJob]:
        """Process all printers and return completed jobs"""
        completed = []
        
        # Process each printer
        for printer in self.printers:
            if printer.is_busy:
                completed_job = printer.process()
                if completed_job:
                    completed.append(completed_job)
                    self.completed_jobs.append(completed_job)
        
        # Assign waiting jobs to idle printers
        for printer in self.printers:
            if not printer.is_busy and not self.queue.is_empty():
                next_job = self.queue.dequeue()
                printer.assign_job(next_job)
                print(f"🖨️ Printer {printer.printer_id} started: {next_job}")
        
        return completed
    
    def get_queue_status(self) -> Dict:
        """Get current queue status"""
        waiting_jobs = self.queue.get_all()
        return {
            'queue_size': self.queue.size(),
            'waiting_jobs': waiting_jobs,
            'total_jobs_submitted': self.total_jobs_submitted,
            'jobs_completed': len(self.completed_jobs),
            'jobs_in_queue': len(waiting_jobs)
        }
    
    def get_printer_status(self) -> List[Dict]:
        """Get status of all printers"""
        return [printer.get_status() for printer in self.printers]
    
    def cancel_job(self, job_id: int) -> bool:
        """Cancel a waiting job by ID"""
        # Check if job is in queue
        for i, job in enumerate(self.queue.items):
            if job.job_id == job_id:
                job.status = "Failed"
                self.failed_jobs.append(job)
                self.queue.items.pop(i)
                print(f"❌ Job #{job_id} cancelled")
                return True
        
        # Check if job is currently printing
        for printer in self.printers:
            if printer.current_job and printer.current_job.job_id == job_id:
                printer.current_job.status = "Failed"
                self.failed_jobs.append(printer.current_job)
                printer.current_job = None
                printer.is_busy = False
                print(f"❌ Job #{job_id} cancelled (was printing)")
                return True
        
        print(f"⚠️ Job #{job_id} not found")
        return False
    
    def get_statistics(self) -> Dict:
        """Get system statistics"""
        queue_status = self.get_queue_status()
        
        # Calculate average wait time
        avg_wait_time = 0
        completed_with_wait = [j for j in self.completed_jobs if j.get_wait_time()]
        if completed_with_wait:
            avg_wait_time = sum(j.get_wait_time() for j in completed_with_wait) / len(completed_with_wait)
        
        # Calculate average processing time
        avg_processing_time = 0
        completed_with_process = [j for j in self.completed_jobs if j.get_processing_time()]
        if completed_with_process:
            avg_processing_time = sum(j.get_processing_time() for j in completed_with_process) / len(completed_with_process)
        
        return {
            'queue_status': queue_status,
            'printers': self.get_printer_status(),
            'statistics': {
                'total_submitted': self.total_jobs_submitted,
                'total_completed': len(self.completed_jobs),
                'total_failed': len(self.failed_jobs),
                'success_rate': (len(self.completed_jobs) / self.total_jobs_submitted * 100) if self.total_jobs_submitted > 0 else 0,
                'average_wait_time_seconds': avg_wait_time,
                'average_processing_time_seconds': avg_processing_time,
                'total_pages_printed': sum(p.total_pages_printed for p in self.printers)
            }
        }
    
    def export_report(self, filename: str = "printer_report.json") -> bool:
        """Export system report to JSON"""
        try:
            stats = self.get_statistics()
            
            # Add detailed job info
            stats['completed_jobs'] = [job.to_dict() for job in self.completed_jobs]
            stats['failed_jobs'] = [job.to_dict() for job in self.failed_jobs]
            stats['waiting_jobs'] = [job.to_dict() for job in self.queue.get_all()]
            
            with open(filename, 'w') as f:
                json.dump(stats, f, indent=2, default=str)
            
            print(f"✅ Report exported to {filename}")
            return True
        except Exception as e:
            print(f"❌ Error exporting report: {e}")
            return False