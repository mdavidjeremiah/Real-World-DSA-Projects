from printer_simulator import PrinterSimulator

def main():
    print("=" * 70)
    print("🖨️ PRINTER QUEUE SIMULATION SYSTEM")
    print("Using Queue Data Structure (FIFO)")
    print("=" * 70)
    
    simulator = PrinterSimulator()
    
    print("\nChoose mode:")
    print("  [1] Interactive Mode - Manual control")
    print("  [2] Automatic Simulation - Random jobs")
    print("  [3] Quick Demo")
    
    choice = input("\nEnter your choice (1-3): ").strip()
    
    if choice == '1':
        simulator.interactive_mode()
    elif choice == '2':
        duration = input("Simulation duration in seconds [30]: ").strip()
        duration = int(duration) if duration else 30
        simulator.run_simulation(duration)
    elif choice == '3':
        quick_demo()
    else:
        print("Invalid choice! Running interactive mode...")
        simulator.interactive_mode()

def quick_demo():
    """Quick demonstration of queue functionality"""
    from printer_queue import PrinterQueueSystem
    
    print("\n" + "=" * 70)
    print("QUICK DEMO: Printer Queue Simulation")
    print("=" * 70)
    
    system = PrinterQueueSystem()
    system.add_printer("Demo Printer", pages_per_minute=12)
    
    # Submit jobs
    print("\n📝 Submitting jobs...")
    system.submit_job("Report.pdf", 10, "Alice")
    system.submit_job("Invoice.doc", 3, "Bob")
    system.submit_job("Presentation.pptx", 15, "Charlie")
    system.submit_job("Photo.jpg", 2, "Diana")
    
    # Process
    print("\n🔄 Processing jobs...")
    import time
    
    for i in range(20):  # Simulate 20 seconds
        completed = system.process_printers()
        if completed:
            for job in completed:
                print(f"✅ Completed: {job}")
        
        if i % 5 == 0:
            queue_status = system.get_queue_status()
            print(f"\n⏰ Second {i}: {queue_status['queue_size']} jobs in queue")
        
        time.sleep(1)
    
    # Final report
    stats = system.get_statistics()
    print("\n" + "=" * 70)
    print("FINAL STATISTICS:")
    print(f"  • Jobs Completed: {stats['statistics']['total_completed']}")
    print(f"  • Jobs Failed: {stats['statistics']['total_failed']}")
    print(f"  • Average Wait Time: {stats['statistics']['average_wait_time_seconds']:.2f} seconds")
    print("=" * 70)

if __name__ == "__main__":
    main()