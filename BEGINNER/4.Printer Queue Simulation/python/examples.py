from printer_queue import PrinterQueueSystem
import time

def demo_basic_queue():
    """Demonstrate basic queue operations"""
    print("=" * 70)
    print("DEMO 1: Basic Queue Operations")
    print("=" * 70)
    
    system = PrinterQueueSystem()
    system.add_printer("Test Printer", pages_per_minute=12)
    
    # Submit jobs
    system.submit_job("Doc1.pdf", 5, "User1")
    system.submit_job("Doc2.pdf", 10, "User2")
    system.submit_job("Doc3.pdf", 3, "User3")
    
    print(f"\nQueue size: {system.queue.size()}")
    print(f"Queue content: {system.queue}")
    
    # Process jobs
    print("\nProcessing jobs...")
    for i in range(20):
        completed = system.process_printers()
        if completed:
            for job in completed:
                print(f"✅ Completed: {job}")
        time.sleep(1)
    
    print(f"\nFinal queue size: {system.queue.size()}")

def demo_multiple_printers():
    """Demonstrate multiple printer management"""
    print("\n" + "=" * 70)
    print("DEMO 2: Multiple Printers")
    print("=" * 70)
    
    system = PrinterQueueSystem()
    
    # Add multiple printers
    system.add_printer("Fast Printer", pages_per_minute=20)
    system.add_printer("Standard Printer", pages_per_minute=12)
    system.add_printer("Economy Printer", pages_per_minute=8)
    
    # Submit many jobs
    jobs = [
        ("Large Report.pdf", 100, "Manager"),
        ("Small Invoice.doc", 2, "Clerk"),
        ("Presentation.pptx", 25, "Executive"),
        ("Photo.jpg", 1, "Designer"),
        ("Contract.pdf", 50, "Lawyer"),
        ("Spreadsheet.xlsx", 15, "Analyst")
    ]
    
    for doc, pages, user in jobs:
        system.submit_job(doc, pages, user)
    
    print("\nProcessing with multiple printers...")
    for i in range(30):
        completed = system.process_printers()
        if completed:
            for job in completed:
                print(f"✅ {job}")
        
        if i % 5 == 0:
            status = system.get_queue_status()
            print(f"\nSecond {i}: {status['queue_size']} jobs waiting")
        
        time.sleep(1)
    
    # Show statistics
    stats = system.get_statistics()
    print("\n" + "=" * 70)
    print("FINAL STATISTICS:")
    for printer in stats['printers']:
        print(f"  {printer['name']}: {printer['jobs_printed']} jobs, {printer['pages_printed']} pages")

def demo_cancel_jobs():
    """Demonstrate job cancellation"""
    print("\n" + "=" * 70)
    print("DEMO 3: Job Cancellation")
    print("=" * 70)
    
    system = PrinterQueueSystem()
    system.add_printer("Test Printer", pages_per_minute=12)
    
    # Submit jobs
    for i in range(5):
        system.submit_job(f"Document_{i+1}.pdf", 5, f"User{i+1}")
    
    print(f"\nInitial queue: {system.queue}")
    
    # Cancel job #3
    print("\nCancelling job #3...")
    system.cancel_job(3)
    
    print(f"Queue after cancellation: {system.queue}")
    
    # Process remaining
    print("\nProcessing remaining jobs...")
    for i in range(15):
        completed = system.process_printers()
        time.sleep(1)
    
    stats = system.get_statistics()
    print(f"\nFinal: {stats['statistics']['total_completed']} completed, {stats['statistics']['total_failed']} failed")

def demo_queue_metrics():
    """Demonstrate queue metrics and statistics"""
    print("\n" + "=" * 70)
    print("DEMO 4: Queue Metrics and Statistics")
    print("=" * 70)
    
    system = PrinterQueueSystem()
    system.add_printer("Metric Printer", pages_per_minute=12)
    
    # Submit varied jobs
    import random
    print("Submitting 20 random jobs...")
    for i in range(20):
        pages = random.randint(1, 30)
        system.submit_job(f"Job_{i+1}.pdf", pages, f"User{i+1}")
    
    print("\nProcessing and collecting metrics...")
    for i in range(60):
        completed = system.process_printers()
        time.sleep(1)
    
    # Export report
    system.export_report("queue_metrics.json")
    
    stats = system.get_statistics()
    print(f"\n📊 Queue Metrics:")
    print(f"  • Peak Queue Size: {stats['queue_status']['queue_size']}")
    print(f"  • Average Wait Time: {stats['statistics']['average_wait_time_seconds']:.2f}s")
    print(f"  • Throughput: {stats['statistics']['total_completed']} jobs in 60 seconds")
    print(f"  • Printer Utilization: {stats['printers'][0]['jobs_printed'] * stats['printers'][0]['pages_printed'] / (60 * 12) * 100:.1f}%")

if __name__ == "__main__":
    demo_basic_queue()
    demo_multiple_printers()
    demo_cancel_jobs()
    demo_queue_metrics()