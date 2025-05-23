'use client'

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ConfirmDialog } from './ConfirmDialog';
import { Button } from "@/components/ui/button";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const SortableTodoItem: React.FC<{
  todo: Todo;
  toggleTodo: (id: number) => void;
  startEdit: (id: number, text: string) => void;
  deleteTodo: (id: number) => void;
  editingId: number | null;
  editText: string;
  setEditText: (text: string) => void;
  saveEdit: (id: number) => void;
  cancelEdit: () => void;
  index: number;
}> = ({
  todo,
  toggleTodo,
  startEdit,
  deleteTodo,
  editingId,
  editText,
  setEditText,
  saveEdit,
  cancelEdit,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 mb-2 bg-card rounded flex-wrap ${
        isDragging ? 'shadow-lg scale-105 z-50' : ''
      } ${todo.completed ? 'completed' : ''}`}
      {...attributes}
    >
      <div 
        className="cursor-grab p-1 -ml-1 select-none touch-none active:cursor-grabbing"
        {...listeners}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <span className="text-muted-foreground select-none">☰</span>
      </div>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => toggleTodo(todo.id)}
        className="cursor-pointer w-5 h-5"
      />
      {editingId === todo.id ? (
        <div className="flex-1 flex gap-2.5 flex-wrap">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="flex-1 p-2 rounded border border-input bg-background text-foreground min-w-[150px]"
          />
          <div className="flex gap-2 w-full md:w-auto">
            <Button 
              onClick={() => saveEdit(todo.id)}
              variant="default"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              保存
            </Button>
            <Button 
              onClick={cancelEdit}
              variant="secondary"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              取消
            </Button>
          </div>
        </div>
      ) : (
        <>
          <span 
            className={`flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap ${
              todo.completed ? 'line-through text-muted-foreground' : 'text-foreground'
            }`}
            onDoubleClick={(e) => {
              e.stopPropagation();
              startEdit(todo.id, todo.text);
            }}
            title={todo.text}
          >
            {todo.text}
          </span>
          <div className="md:flex gap-2 flex-wrap relative z-10 hidden">
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                startEdit(todo.id, todo.text);
              }}
              variant="outline"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              编辑
            </Button>
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                deleteTodo(todo.id);
              }}
              variant="destructive"
              className="bg-destructive text-gray-50 hover:bg-destructive/90"
            >
              删除
            </Button>
          </div>
          <div className="md:hidden relative">
            <button 
              className="p-2 text-muted-foreground hover:bg-accent/10 rounded"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis">
                <circle cx="12" cy="12" r="1"/>
                <circle cx="19" cy="12" r="1"/>
                <circle cx="5" cy="12" r="1"/>
              </svg>
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-24 bg-background border border-input rounded shadow-lg z-20">
                <button
                  className="w-full px-4 py-2 text-left hover:bg-accent/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEdit(todo.id, todo.text);
                    setIsMenuOpen(false);
                  }}
                >
                  编辑
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTodo(todo.id);
                    setIsMenuOpen(false);
                  }}
                >
                  删除
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </li>
  );
};

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 只在客户端初始化
  useEffect(() => {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      setTodos(JSON.parse(storedTodos));
    }
  }, []);

  // 保存到localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  }, [todos]);

  const addTodo = () => {
    if (newTodo.trim() !== '') {
      const todo: Todo = {
        id: Date.now(),
        text: newTodo,
        completed: false
      };
      setTodos([...todos, todo]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleDelete = (id: number) => {
    setTodoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (todoToDelete) {
      setTodos(todos.filter(todo => todo.id !== todoToDelete));
      setTodoToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  const startEdit = (id: number, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const saveEdit = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: editText } : todo
    ));
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTodos((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="max-w-[600px] mx-auto p-5 w-full box-border">
      <h1 className="text-center mb-5 text-[clamp(1.5rem,6vw,2rem)] text-foreground">任务列表</h1>
      <div className="flex gap-2.5 mb-5">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="添加一个新任务"
          className="flex-1 p-2 rounded border border-input bg-background text-foreground text-base"
        />
        <Button 
          onClick={addTodo}
          variant="default"
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-12 flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus">
            <path d="M5 12h14"/>
            <path d="M12 5v14"/>
          </svg>
        </Button>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={todos} strategy={verticalListSortingStrategy}>
          <ul className="list-none p-0 m-0">
            {todos.map((todo, index) => (
              <SortableTodoItem
                key={todo.id}
                todo={todo}
                toggleTodo={toggleTodo}
                startEdit={startEdit}
                deleteTodo={handleDelete}
                editingId={editingId}
                editText={editText}
                setEditText={setEditText}
                saveEdit={saveEdit}
                cancelEdit={cancelEdit}
                index={index}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="删除任务"
        description="确定要删除这个任务吗？此操作无法撤销。"
      />
    </div>
  );
};

export default TodoList;
