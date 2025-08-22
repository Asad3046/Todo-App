import React, { useState } from "react";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

function App() {
  // Load local todos first
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem("todos");
    return saved ? JSON.parse(saved) : [];
  });

  // Fetch from API with SWR
  const { data: todosFromAPI, error, isLoading } = useSWR(
    "https://jsonplaceholder.typicode.com/todos?_limit=5",
    fetcher
  );

  // Initialize localStorage from API if it's empty
  if (todos.length === 0 && todosFromAPI && todosFromAPI.length > 0) {
    localStorage.setItem("todos", JSON.stringify(todosFromAPI));
    setTodos(todosFromAPI);
  }

  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  if (error) return <div>❌ Failed to load</div>;
  if (isLoading && todos.length === 0) return <div>⏳ Loading...</div>;

  // helper to update both state & localStorage
  const updateTodos = (updated) => {
    setTodos(updated);
    localStorage.setItem("todos", JSON.stringify(updated));
  };

  // Add new todo
  const addTodo = () => {
    if (!newTodo.trim()) return;
    const todo = {
      id: Date.now(),
      title: newTodo,
      completed: false,
    };
    updateTodos([todo, ...todos]);
    setNewTodo("");
  };

  // Update todo
  const updateTodo = (id) => {
    const updated = todos.map((todo) =>
      todo.id === id ? { ...todo, title: editingText } : todo
    );
    updateTodos(updated);
    setEditingId(null);
    setEditingText("");
  };

  // Toggle complete
  const toggleComplete = (id) => {
    const updated = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    updateTodos(updated);
  };

  // Delete todo
  const deleteTodo = (id) => {
    const updated = todos.filter((todo) => todo.id !== id);
    updateTodos(updated);
  };

  return (
    <div className="app" style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <h1>Todo App (CRUD + SWR + localStorage, no useEffect)</h1>

      {/* Add Todo */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter new todo..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          style={{ flex: 1, padding: "8px" }}
        />
        <button onClick={addTodo} style={{ padding: "8px 12px", background: "blue", color: "white" }}>
          Add
        </button>
      </div>

      {/* Todo List */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos.map((todo) => (
          <li
            key={todo.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
              border: "1px solid #ccc",
              padding: "8px",
              borderRadius: "5px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleComplete(todo.id)}
              />

              {editingId === todo.id ? (
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  style={{ padding: "4px" }}
                />
              ) : (
                <span style={{ textDecoration: todo.completed ? "line-through" : "none" }}>
                  {todo.title}
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              {editingId === todo.id ? (
                <button onClick={() => updateTodo(todo.id)} style={{ background: "green", color: "white", padding: "4px 8px" }}>
                  Save
                </button>
              ) : (
                <button
                  onClick={() => { setEditingId(todo.id); setEditingText(todo.title); }}
                  style={{ background: "orange", color: "white", padding: "4px 8px" }}
                >
                  Edit
                </button>
              )}
              <button onClick={() => deleteTodo(todo.id)} style={{ background: "red", color: "white", padding: "4px 8px" }}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
