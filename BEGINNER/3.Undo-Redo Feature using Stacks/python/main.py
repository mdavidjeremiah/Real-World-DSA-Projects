import os
from undo_redo_manager import UndoRedoManager

class TextEditor:
    """Simple text editor with undo/redo functionality"""
    
    def __init__(self):
        self.manager = UndoRedoManager()
        self.content = ""
        self.running = True
    
    def clear_screen(self):
        os.system('cls' if os.name == 'nt' else 'clear')
    
    def display_editor(self):
        """Display current content and menu"""
        self.clear_screen()
        print("=" * 70)
        print("📝 TEXT EDITOR WITH UNDO/REDO (Stack Implementation)")
        print("=" * 70)
        print("\nCurrent Content:")
        print("-" * 70)
        if self.content:
            print(self.content)
        else:
            print("[Empty document]")
        print("-" * 70)
        
        # Display statistics
        stats = self.manager.get_stats()
        print(f"\n📊 Stats: Undo Size: {stats['undo_size']} | Redo Size: {stats['redo_size']}")
        print(f"📝 Characters: {len(self.content)} | Words: {len(self.content.split())}")
        
        print("\n" + "=" * 70)
        print("Commands:")
        print("  [1] Edit text")
        print("  [2] Undo (Ctrl+Z)")
        print("  [3] Redo (Ctrl+Y)")
        print("  [4] Show history")
        print("  [5] Clear all")
        print("  [6] Export history to file")
        print("  [7] Import history from file")
        print("  [0] Exit")
        print("=" * 70)
    
    def edit_text(self):
        """Edit text content"""
        print("\n✏️ Edit Mode")
        print("Enter your text (type 'SAVE' on a new line to finish):")
        print("-" * 50)
        
        lines = []
        while True:
            line = input()
            if line.strip() == 'SAVE':
                break
            lines.append(line)
        
        new_content = '\n'.join(lines)
        if new_content:
            self.manager.save_state(self.content)
            self.content = new_content
            print("\n✅ Content updated!")
        else:
            print("\n⚠️ No content entered!")
        
        input("\nPress Enter to continue...")
    
    def undo(self):
        """Undo last action"""
        success, content, message = self.manager.undo()
        if success:
            self.content = content
            print(f"\n✅ {message}")
        else:
            print(f"\n⚠️ {message}")
        input("\nPress Enter to continue...")
    
    def redo(self):
        """Redo last undone action"""
        success, content, message = self.manager.redo()
        if success:
            self.content = content
            print(f"\n✅ {message}")
        else:
            print(f"\n⚠️ {message}")
        input("\nPress Enter to continue...")
    
    def show_history(self):
        """Display action history"""
        history = self.manager.get_history()
        
        print("\n" + "=" * 70)
        print("📜 ACTION HISTORY")
        print("=" * 70)
        
        if not history:
            print("No history available")
        else:
            for i, action in enumerate(history, 1):
                print(f"\n{i}. Time: {action.get_formatted_time()}")
                print(f"   Content: {action.content[:100]}{'...' if len(action.content) > 100 else ''}")
                print(f"   Length: {len(action.content)} characters")
        
        input("\nPress Enter to continue...")
    
    def clear_all(self):
        """Clear all content and history"""
        confirm = input("\n⚠️ Clear all content and history? (y/n): ")
        if confirm.lower() == 'y':
            self.manager.clear_history()
            self.content = ""
            print("✅ All content and history cleared!")
        else:
            print("❌ Operation cancelled")
        input("\nPress Enter to continue...")
    
    def export_history(self):
        """Export history to file"""
        filename = input("\nEnter filename (default: undo_history.json): ").strip()
        if not filename:
            filename = "undo_history.json"
        
        if self.manager.export_history(filename):
            print(f"✅ History exported to {filename}")
        else:
            print("❌ Failed to export history")
        input("\nPress Enter to continue...")
    
    def import_history(self):
        """Import history from file"""
        filename = input("\nEnter filename (default: undo_history.json): ").strip()
        if not filename:
            filename = "undo_history.json"
        
        if self.manager.import_history(filename):
            if not self.manager.undo_stack.is_empty():
                self.content = self.manager.undo_stack.peek().content
            print(f"✅ History imported from {filename}")
        else:
            print("❌ Failed to import history")
        input("\nPress Enter to continue...")
    
    def run(self):
        """Main application loop"""
        while self.running:
            self.display_editor()
            choice = input("\nEnter your choice (0-7): ").strip()
            
            if choice == '1':
                self.edit_text()
            elif choice == '2':
                self.undo()
            elif choice == '3':
                self.redo()
            elif choice == '4':
                self.show_history()
            elif choice == '5':
                self.clear_all()
            elif choice == '6':
                self.export_history()
            elif choice == '7':
                self.import_history()
            elif choice == '0':
                confirm = input("\nSave before exiting? (y/n): ")
                if confirm.lower() == 'y':
                    self.export_history()
                print("\n👋 Goodbye!")
                self.running = False
            else:
                print("\n❌ Invalid choice! Please enter 0-7")
                input("\nPress Enter to continue...")

def main():
    editor = TextEditor()
    editor.run()

if __name__ == "__main__":
    main()