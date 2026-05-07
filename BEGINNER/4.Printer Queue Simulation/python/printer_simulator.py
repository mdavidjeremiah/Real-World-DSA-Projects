import time
import random
from threading import Thread, Event
from printer_queue import PrinterQueueSystem

class PrinterSimulator:
    """Interactive printer queue simulator"""
    
    def __init__(self):
        self.system = PrinterQueueSystem()
        self.running = False
        self.simulation_thread = None
        self.stop_event = Event()
    
    def setup_printers(self):
        """Setup default printers"""
        print("\n🖨️ Setting up printers...")
        self.system.add_printer("HP LaserJet", pages_per_minute=12)
        self.system.add_printer("Canon ImageClass", pages_per_minute=15)
        self.system.add_printer("Brother HL-L2350", pages_per_minute=10)
        print("✅ 3 printers added to the system")
    
    def run_simulation(self, duration_seconds: int = 30):
        """Run automatic simulation"""
        self.running = True
        self.stop_event.clear()
        
        print(f"\n🎮 Starting simulation for {duration_seconds} seconds...")
        start_time = time.time()
        
        while self.running and (time.time() - start_time) < duration_seconds:
            # Randomly submit jobs
            if random.random() < 0.3:  # 30% chance per second
                documents = ["Report.pdf", "Invoice.doc", "Presentation.pptx", "Photo.jpg", "Contract.pdf"]
                doc = random.choice(documents)
                pages = random.randint(1, 50)
                users = ["Alice", "Bob", "Charlie", "Diana", "Eve"]
                user = random.choice(users)
                
                self.system.submit_job(doc, pages, user)
            
            # Process printers
            completed = self.system.process_printers()
            
            # Show status every 5 seconds
            if int(time.time() - start_time) % 5 == 0:
                self.display_status()
            
            time.sleep(1)
        
        self.running = False
        print("\n✅ Simulation completed!")
        self.display_final_report()
    
    def interactive_mode(self):
        """Interactive command-line mode"""
        self.setup_printers()
        
        while True:
            self.display_status()
            
            print("\n" + "=" * 70)
            print("Commands:")
            print("  [1] Submit new job")
            print("  [2] Process printers (simulate 1 second)")
            print("  [3] Cancel a job")
            print("  [4] View detailed statistics")
            print("  [5] Run automatic simulation")
            print("  [6] Export report to JSON")
            print("  [7] Clear completed jobs")
            print("  [0] Exit")
            print("=" * 70)
            
            choice = input("\nEnter your choice (0-7): ").strip()
            
            if choice == '1':
                self.submit_job_interactive()
            elif choice == '2':
                self.process_printers_interactive()
            elif choice == '3':
                self.cancel_job_interactive()
            elif choice == '4':
                self.show_detailed_stats()
            elif choice == '5':
                duration = input("Simulation duration (seconds) [30]: ").strip()
                duration = int(duration) if duration else 30
                self.run_simulation(duration)
                input("\nPress Enter to continue...")
            elif choice == '6':
                filename = input("Filename [printer_report.json]: ").strip()
                filename = filename if filename else "printer_report.json"
                self.system.export_report(filename)
                input("\nPress Enter to continue...")
            elif choice == '7':
                self.system.completed_jobs = []
                print("✅ Completed jobs cleared")
                input("\nPress Enter to continue...")
            elif choice == '0':
                print("\n👋 Goodbye!")
                break
            else:
                print("❌ Invalid choice!")
                input("\nPress Enter to continue...")
    
    def submit_job_interactive(self):
        """Interactive job submission"""
        print("\n📄 Submit New Print Job")
        doc_name = input("Document name: ").strip()
        if not doc_name:
            print("❌ Document name required!")
            return
        
        try:
            pages = int(input("Number of pages: "))
        except ValueError:
            print("❌ Invalid page count!")
            return
        
        user = input("User name [Anonymous]: ").strip()
        user = user if user else "Anonymous"
        
        self.system.submit_job(doc_name, pages, user)
        input("\nPress Enter to continue...")
    
    def process_printers_interactive(self):
        """Process printers for 1 second"""
        completed = self.system.process_printers()
        if completed:
            print(f"\n✅ Completed {len(completed)} job(s)")
            for job in completed:
                print(f"   - {job}")
        else:
            print("\n⏳ No jobs completed this second")
        input("\nPress Enter to continue...")
    
    def cancel_job_interactive(self):
        """Cancel a job interactively"""
        try:
            job_id = int(input("\nEnter job ID to cancel: "))
        except ValueError:
            print("❌ Invalid job ID!")
            input("\nPress Enter to continue...")
            return
        
        self.system.cancel_job(job_id)
        input("\nPress Enter to continue...")
    
    def display_status(self):
        """Display current status"""
        print("\n" + "=" * 70)
        print("📊 PRINTER QUEUE STATUS")
        print("=" * 70)
        
        queue_status = self.system.get_queue_status()
        print(f"\n📋 Print Queue: {queue_status['queue_size']} job(s) waiting")
        
        if queue_status['waiting_jobs']:
            print("\nWaiting Jobs:")
            for i, job in enumerate(queue_status['waiting_jobs'][:5], 1):
                print(f"  {i}. {job}")
            if len(queue_status['waiting_jobs']) > 5:
                print(f"  ... and {len(queue_status['waiting_jobs']) - 5} more")
        
        print("\n🖨️ Printers:")
        for printer in self.system.get_printer_status():
            status = "🔴 BUSY" if printer['is_busy'] else "🟢 IDLE"
            print(f"  {printer['name']}: {status}")
            if printer['current_job']:
                print(f"     Currently printing: {printer['current_job']}")
            print(f"     Jobs printed: {printer['jobs_printed']} | Pages: {printer['pages_printed']}")
        
        print(f"\n📈 Summary: {queue_status['jobs_completed']} jobs completed, {queue_status['total_jobs_submitted']} total submitted")
    
    def show_detailed_stats(self):
        """Display detailed statistics"""
        stats = self.system.get_statistics()
        
        print("\n" + "=" * 70)
        print("📈 DETAILED STATISTICS")
        print("=" * 70)
        
        # General statistics
        print("\n📊 General Statistics:")
        print(f"  Total Jobs Submitted: {stats['statistics']['total_submitted']}")
        print(f"  Total Jobs Completed: {stats['statistics']['total_completed']}")
        print(f"  Total Jobs Failed: {stats['statistics']['total_failed']}")
        print(f"  Success Rate: {stats['statistics']['success_rate']:.1f}%")
        
        # Timing statistics
        print(f"\n⏱️ Timing Statistics:")
        print(f"  Average Wait Time: {stats['statistics']['average_wait_time_seconds']:.2f} seconds")
        print(f"  Average Processing Time: {stats['statistics']['average_processing_time_seconds']:.2f} seconds")
        print(f"  Total Pages Printed: {stats['statistics']['total_pages_printed']}")
        
        # Printer statistics
        print(f"\n🖨️ Printer Statistics:")
        for printer in stats['printers']:
            print(f"  {printer['name']}:")
            print(f"    Jobs Printed: {printer['jobs_printed']}")
            print(f"    Pages Printed: {printer['pages_printed']}")
        
        # Recent completed jobs
        if self.system.completed_jobs:
            print(f"\n✅ Recent Completed Jobs (last 5):")
            for job in self.system.completed_jobs[-5:]:
                wait_time = job.get_wait_time()
                process_time = job.get_processing_time()
                print(f"  Job #{job.job_id}: '{job.document_name}' - Wait: {wait_time:.1f}s, Process: {process_time:.1f}s" if wait_time and process_time else f"  Job #{job.job_id}: '{job.document_name}'")
        
        input("\nPress Enter to continue...")
    
    def display_final_report(self):
        """Display final simulation report"""
        stats = self.system.get_statistics()
        
        print("\n" + "=" * 70)
        print("📊 FINAL SIMULATION REPORT")
        print("=" * 70)
        
        print(f"\n📈 Performance Summary:")
        print(f"  • Jobs Processed: {stats['statistics']['total_completed']}/{stats['statistics']['total_submitted']}")
        print(f"  • Success Rate: {stats['statistics']['success_rate']:.1f}%")
        print(f"  • Total Pages Printed: {stats['statistics']['total_pages_printed']}")
        print(f"  • Average Wait Time: {stats['statistics']['average_wait_time_seconds']:.2f} seconds")
        print(f"  • Average Processing Time: {stats['statistics']['average_processing_time_seconds']:.2f} seconds")
        
        print(f"\n🖨️ Printer Usage:")
        for printer in stats['printers']:
            print(f"  • {printer['name']}: {printer['jobs_printed']} jobs, {printer['pages_printed']} pages")
        
        # Export report automatically
        self.system.export_report("simulation_report.json")