from undo_redo_manager import UndoRedoManager

def demo_basic_undo_redo():
    """Demonstrate basic undo/redo functionality"""
    print("=" * 60)
    print("DEMO: Basic Undo/Redo")
    print("=" * 60)
    
    manager = UndoRedoManager()
    
    # Simulate typing
    texts = ["Hello", "Hello World", "Hello World!", "Hello World!!"]
    
    for text in texts:
        print(f"📝 Typing: {text}")
        manager.save_state(text)
    
    print(f"\nUndo size: {manager.undo_stack.size()}")
    print(f"Redo size: {manager.redo_stack.size()}")
    
    # Undo operations
    for i in range(3):
        success, content, msg = manager.undo()
        if success:
            print(f"\n↩️ Undo {i+1}: {msg}")
            print(f"   Current: {content}")
    
    # Redo operations
    for i in range(2):
        success, content, msg = manager.redo()
        if success:
            print(f"\n↪️ Redo {i+1}: {msg}")
            print(f"   Current: {content}")
    
    print("\n" + "=" * 60)

def demo_history_management():
    """Demonstrate history management"""
    print("\n" + "=" * 60)
    print("DEMO: History Management")
    print("=" * 60)
    
    manager = UndoRedoManager(max_history=3)
    
    # Add more than max_history items
    for i in range(5):
        text = f"Version {i+1}"
        print(f"📝 Adding: {text}")
        manager.save_state(text)
        print(f"   Undo size: {manager.undo_stack.size()}")
    
    print("\n📜 History (oldest to newest):")
    history = manager.get_history()
    for i, action in enumerate(history, 1):
        print(f"{i}. {action.content} - {action.get_formatted_time()}")
    
    print("\n" + "=" * 60)

def demo_export_import():
    """Demonstrate export/import functionality"""
    print("\n" + "=" * 60)
    print("DEMO: Export/Import History")
    print("=" * 60)
    
    manager = UndoRedoManager()
    
    # Add some actions
    actions = ["Initial state", "Added feature A", "Added feature B", "Fixed bug"]
    for action in actions:
        manager.save_state(action)
    
    # Export
    print("💾 Exporting history...")
    manager.export_history("demo_history.json")
    
    # Create new manager and import
    new_manager = UndoRedoManager()
    print("📂 Importing history...")
    new_manager.import_history("demo_history.json")
    
    print(f"\nImported {new_manager.undo_stack.size()} actions")
    history = new_manager.get_history()
    for i, action in enumerate(history, 1):
        print(f"{i}. {action.content}")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    demo_basic_undo_redo()
    demo_history_management()
    demo_export_import()