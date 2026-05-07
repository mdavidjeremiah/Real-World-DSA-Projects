from datetime import datetime
from typing import Optional, List, Dict
import json

class Action:
    """Represents a single action/state"""
    def __init__(self, content: str, timestamp: Optional[datetime] = None):
        self.content = content
        self.timestamp = timestamp or datetime.now()
    
    def get_formatted_time(self) -> str:
        return self.timestamp.strftime("%H:%M:%S")
    
    def to_dict(self) -> Dict:
        return {
            'content': self.content,
            'timestamp': self.timestamp.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Action':
        return cls(
            content=data['content'],
            timestamp=datetime.fromisoformat(data['timestamp'])
        )

class Stack:
    """Stack implementation using Python list"""
    def __init__(self):
        self.items = []
    
    def push(self, item):
        self.items.append(item)
    
    def pop(self):
        if self.is_empty():
            return None
        return self.items.pop()
    
    def peek(self):
        if self.is_empty():
            return None
        return self.items[-1]
    
    def is_empty(self) -> bool:
        return len(self.items) == 0
    
    def size(self) -> int:
        return len(self.items)
    
    def clear(self):
        self.items = []
    
    def get_all(self) -> List:
        return self.items.copy()
    
    def __len__(self):
        return len(self.items)

class UndoRedoManager:
    """Manages undo/redo operations using two stacks"""
    
    def __init__(self, max_history: int = 50):
        self.undo_stack = Stack()
        self.redo_stack = Stack()
        self.current_content = ""
        self.max_history = max_history
    
    def save_state(self, content: str) -> bool:
        """Save current state before making changes"""
        # Don't save if content is same as last saved
        if not self.undo_stack.is_empty():
            last_state = self.undo_stack.peek()
            if last_state.content == content:
                return False
        
        action = Action(content)
        self.undo_stack.push(action)
        
        # Limit history size
        if self.undo_stack.size() > self.max_history:
            # Remove oldest items (from bottom of stack)
            old_items = []
            while self.undo_stack.size() > self.max_history:
                old_items.append(self.undo_stack.pop())
            # Rebuild without the oldest items
            while old_items:
                self.undo_stack.push(old_items.pop())
        
        # Clear redo stack when new action is performed
        self.redo_stack.clear()
        self.current_content = content
        return True
    
    def undo(self) -> tuple[bool, Optional[str], str]:
        """Undo last action"""
        if self.undo_stack.is_empty():
            return False, None, "Nothing to undo!"
        
        current_action = self.undo_stack.pop()
        self.redo_stack.push(current_action)
        
        previous_content = ""
        if not self.undo_stack.is_empty():
            previous_content = self.undo_stack.peek().content
        else:
            previous_content = ""
        
        self.current_content = previous_content
        
        return True, previous_content, f"Undo: {current_action.content[:50]}..."
    
    def redo(self) -> tuple[bool, Optional[str], str]:
        """Redo last undone action"""
        if self.redo_stack.is_empty():
            return False, None, "Nothing to redo!"
        
        action = self.redo_stack.pop()
        self.undo_stack.push(action)
        self.current_content = action.content
        
        return True, action.content, f"Redo: {action.content[:50]}..."
    
    def get_history(self) -> List[Action]:
        """Get full history in chronological order"""
        return self.undo_stack.get_all()[::-1]  # Reverse to show oldest first
    
    def clear_history(self):
        """Clear all history"""
        self.undo_stack.clear()
        self.redo_stack.clear()
        self.current_content = ""
    
    def get_stats(self) -> Dict:
        """Get statistics about stacks"""
        return {
            'undo_size': self.undo_stack.size(),
            'redo_size': self.redo_stack.size(),
            'undo_top': self.undo_stack.peek().content[:30] if not self.undo_stack.is_empty() else "None",
            'redo_top': self.redo_stack.peek().content[:30] if not self.redo_stack.is_empty() else "None",
            'total_history': self.undo_stack.size()
        }
    
    def export_history(self, filename: str = "undo_history.json") -> bool:
        """Export history to JSON file"""
        try:
            history = self.get_history()
            data = {
                'history': [action.to_dict() for action in history],
                'export_date': datetime.now().isoformat(),
                'total_actions': len(history)
            }
            with open(filename, 'w') as f:
                json.dump(data, f, indent=2)
            return True
        except Exception as e:
            print(f"Error exporting history: {e}")
            return False
    
    def import_history(self, filename: str = "undo_history.json") -> bool:
        """Import history from JSON file"""
        try:
            with open(filename, 'r') as f:
                data = json.load(f)
            
            self.clear_history()
            for action_data in data['history']:
                action = Action.from_dict(action_data)
                self.undo_stack.push(action)
            
            if not self.undo_stack.is_empty():
                self.current_content = self.undo_stack.peek().content
            
            return True
        except FileNotFoundError:
            print(f"File not found: {filename}")
            return False
        except Exception as e:
            print(f"Error importing history: {e}")
            return False