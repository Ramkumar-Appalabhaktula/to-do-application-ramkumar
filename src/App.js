import React, { useState } from "react";
import axios from "axios";
import "./App.css"; // ✅ Import custom CSS

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [error, setError] = useState("");

  // ✅ Fetch Todos manually
  const fetchTodos = async () => {
    try {
      const { data } = await axios.get("https://dummyjson.com/todos?limit=5");
      setTodos(data.todos);
      setError("");
    } catch {
      setError("⚠ Failed to fetch todos");
    }
  };

  // ✅ Add Todo with validation
  const addTodo = async () => {
    if (!newTodo.trim()) {
      setError("⚠ Todo cannot be empty");
      return;
    }
    try {
      const { data } = await axios.post("https://dummyjson.com/todos/add", {
        todo: newTodo,
        completed: false,
        userId: 1,
      });
      setTodos([...todos, data]);
      setNewTodo("");
      setError("");
    } catch {
      setError("⚠ Failed to add todo");
    }
  };

  // ✅ Start Editing
  const startEditing = (id, text) => {
    setEditingId(id);
    setEditingText(text);
    setError("");
  };

  // ✅ Update Todo with validation
  const updateTodo = async (id) => {
    if (!editingText.trim()) {
      setError("⚠ Todo cannot be empty while editing");
      return;
    }
    try {
      const { data } = await axios.put(`https://dummyjson.com/todos/${id}`, {
        todo: editingText,
      });
      setTodos(todos.map((t) => (t.id === id ? { ...t, todo: data.todo } : t)));
      setEditingId(null);
      setEditingText("");
      setError("");
    } catch {
      setError("⚠ Failed to update todo");
    }
  };

  // ✅ Delete Todo with confirmation
  const deleteTodo = async (id) => {
    const todoToDelete = todos.find((t) => t.id === id);
    if (!todoToDelete) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${todoToDelete.todo}"?`
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`https://dummyjson.com/todos/${id}`);
      setTodos(todos.filter((t) => t.id !== id));
      setError("");
    } catch {
      setError("⚠ Failed to delete todo");
    }
  };

  // ✅ Toggle Completed
  const toggleCompleted = async (id) => {
    const item = todos.find((t) => t.id === id);
    if (!item) return;

    const nextCompleted = !item.completed;

    // Optimistic UI update
    setTodos(
      todos.map((t) => (t.id === id ? { ...t, completed: nextCompleted } : t))
    );

    try {
      const { data } = await axios.put(`https://dummyjson.com/todos/${id}`, {
        completed: nextCompleted,
      });

      // Sync with API response
      setTodos((curr) =>
        curr.map((t) =>
          t.id === id ? { ...t, completed: Boolean(data.completed) } : t
        )
      );
    } catch {
      // Revert on failure
      setTodos((curr) =>
        curr.map((t) =>
          t.id === id ? { ...t, completed: item.completed } : t
        )
      );
      setError("⚠ Failed to toggle status");
    }
  };

  return (
    <div className="app-container">
      <div className="todo-box">
        <h1 className="title">TODO App</h1>

        {/* Error Message */}
        {error && <p className="error">{error}</p>}

        {/* Input + Add Button */}
        <div className="input-row">
          <input
            type="text"
            placeholder="Enter new todo..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            className="input-box"
          />
          <button onClick={addTodo} className="btn btn-purple">
            Add
          </button>
          <button onClick={fetchTodos} className="btn btn-blue">
            Fetch
          </button>
        </div>

        {/* Todo List */}
        <ul className="todo-list">
          {todos.map((todo) => (
            <li key={todo.id} className="todo-item">
              {editingId === todo.id ? (
                <>
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="input-edit"
                  />
                  <button
                    onClick={() => updateTodo(todo.id)}
                    className="btn btn-green"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="btn btn-gray"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span
                    onClick={() => toggleCompleted(todo.id)}
                    className={`todo-text ${
                      todo.completed ? "completed" : ""
                    }`}
                  >
                    {todo.todo}
                  </span>
                  <button
                    onClick={() => startEditing(todo.id, todo.todo)}
                    className="btn btn-yellow"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="btn btn-red"
                  >
                    Delete
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
