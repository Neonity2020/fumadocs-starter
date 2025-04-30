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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2.5 p-3 mb-2.5 bg-gray-50 rounded flex-wrap ${
        isDragging ? 'shadow-lg scale-105 z-50' : ''
      } ${todo.completed ? 'completed' : ''}`}
      {...attributes}
    >
      <div 
        className="cursor-grab p-2 -ml-2 select-none touch-none active:cursor-grabbing"
        {...listeners}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <span className="text-gray-400 select-none">☰</span>
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
            className="flex-1 p-2 rounded border border-gray-300 min-w-[150px]"
          />
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={() => saveEdit(todo.id)}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg shadow-md hover:from-green-600 hover:to-green-700 active:scale-95 transition-all duration-200"
            >
              保存
            </button>
            <button 
              onClick={cancelEdit}
              className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium rounded-lg shadow-md hover:from-gray-600 hover:to-gray-700 active:scale-95 transition-all duration-200"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <>
          <span 
            className={`flex-1 break-words ${
              todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
            }`}
            onDoubleClick={(e) => {
              e.stopPropagation();
              startEdit(todo.id, todo.text);
            }}
          >
            {todo.text}
          </span>
          <div className="flex gap-2 flex-wrap relative z-10">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                startEdit(todo.id, todo.text);
              }}
              className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-medium rounded-lg shadow-md hover:from-yellow-500 hover:to-yellow-600 active:scale-95 transition-all duration-200"
            >
              编辑
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                deleteTodo(todo.id);
              }}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg shadow-md hover:from-red-600 hover:to-red-700 active:scale-95 transition-all duration-200"
            >
              删除
            </button>
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
      <h1 className="text-center mb-5 text-[clamp(1.5rem,6vw,2rem)]">任务列表</h1>
      <div className="flex flex-col gap-2.5 mb-5 md:flex-row">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="添加一个新任务"
          className="flex-1 p-2 rounded border border-gray-300 text-base"
        />
        <button 
          onClick={addTodo}
          className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 active:scale-95 transition-all duration-200"
        >
          添加
        </button>
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
