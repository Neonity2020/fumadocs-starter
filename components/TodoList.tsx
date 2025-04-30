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
    <div className="todo-list" style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      padding: '20px',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        marginBottom: '20px',
        fontSize: 'clamp(1.5rem, 6vw, 2rem)' // 响应式字体大小
      }}>Todo List</h1>
      <div className="add-todo" style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        flexDirection: 'column', // 移动端改为垂直布局
        '@media (min-width: 600px)': {
          flexDirection: 'row' // 桌面端保持水平布局
        }
      }}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a new todo"
          style={{ 
            flex: 1, 
            padding: '8px', 
            borderRadius: '4px', 
            border: '1px solid #ccc',
            fontSize: '16px' // 确保移动端输入字体大小合适
          }}
        />
        <button 
          onClick={addTodo}
          style={{ 
            padding: '12px 16px', // 增大点击区域
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Add
        </button>
      </div>
      <ul style={{ 
        listStyle: 'none', 
        padding: 0,
        margin: 0
      }}>
        {todos.map((todo, index) => (
          <li 
            key={todo.id} 
            className={todo.completed ? 'completed' : ''}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '12px', 
              marginBottom: '10px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px',
              cursor: 'grab',
              flexWrap: 'wrap' // 允许内容换行
            }}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              style={{ 
                cursor: 'pointer',
                width: '20px',
                height: '20px'
              }}
            />
            {editingId === todo.id ? (
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                gap: '10px',
                flexWrap: 'wrap' // 允许内容换行
              }}>
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  style={{ 
                    flex: 1, 
                    padding: '8px', 
                    borderRadius: '4px', 
                    border: '1px solid #ccc',
                    minWidth: '150px' // 确保输入框最小宽度
                  }}
                />
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  width: '100%',
                  '@media (min-width: 400px)': {
                    width: 'auto'
                  }
                }}>
                  <button 
                    onClick={() => saveEdit(todo.id)}
                    style={{ 
                      padding: '8px 16px', 
                      backgroundColor: '#28a745', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    Save
                  </button>
                  <button 
                    onClick={cancelEdit}
                    style={{ 
                      padding: '8px 16px', 
                      backgroundColor: '#6c757d', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span 
                  style={{ 
                    flex: 1, 
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    color: todo.completed ? '#6c757d' : '#212529',
                    wordBreak: 'break-word' // 长文本自动换行
                  }}
                >
                  {todo.text}
                </span>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  <button 
                    onClick={() => startEdit(todo.id, todo.text)}
                    style={{ 
                      padding: '8px 16px', 
                      backgroundColor: '#ffc107', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => deleteTodo(todo.id)}
                    style={{ 
                      padding: '8px 16px', 
                      backgroundColor: '#dc3545', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer',
                      flex: 1
                    }}
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
