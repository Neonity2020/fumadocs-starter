'use client'

import React, { useState, useEffect } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

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

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    e.dataTransfer.setData('index', index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLLIElement>, targetIndex: number) => {
    const sourceIndex = Number(e.dataTransfer.getData('index'));
    if (sourceIndex === targetIndex) return;

    const newTodos = [...todos];
    const [movedTodo] = newTodos.splice(sourceIndex, 1);
    newTodos.splice(targetIndex, 0, movedTodo);

    setTodos(newTodos);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
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

  return (
    <div className="max-w-[600px] mx-auto p-5 w-full box-border">
      <h1 className="text-center mb-5 text-[clamp(1.5rem,6vw,2rem)]">Todo List</h1>
      <div className="flex flex-col gap-2.5 mb-5 md:flex-row">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a new todo"
          className="flex-1 p-2 rounded border border-gray-300 text-base"
        />
        <button 
          onClick={addTodo}
          className="px-4 py-3 bg-blue-500 text-white border-none rounded cursor-pointer text-base"
        >
          Add
        </button>
      </div>
      <ul className="list-none p-0 m-0">
        {todos.map((todo, index) => (
          <li 
            key={todo.id} 
            className={`flex items-center gap-2.5 p-3 mb-2.5 bg-gray-50 rounded cursor-grab flex-wrap ${
              todo.completed ? 'completed' : ''
            }`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
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
                    className="px-4 py-2 bg-green-500 text-white border-none rounded cursor-pointer flex-1"
                  >
                    Save
                  </button>
                  <button 
                    onClick={cancelEdit}
                    className="px-4 py-2 bg-gray-500 text-white border-none rounded cursor-pointer flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span 
                  className={`flex-1 break-words ${
                    todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
                  }`}
                >
                  {todo.text}
                </span>
                <div className="flex gap-2 flex-wrap">
                  <button 
                    onClick={() => startEdit(todo.id, todo.text)}
                    className="px-4 py-2 bg-yellow-400 text-white border-none rounded cursor-pointer flex-1"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => deleteTodo(todo.id)}
                    className="px-4 py-2 bg-red-500 text-white border-none rounded cursor-pointer flex-1"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
