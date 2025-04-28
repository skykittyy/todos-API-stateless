// Add a new todo when the "Add Todo" button is clicked
document.getElementById('submitTodo').addEventListener('click', async () => {
  const name = document.getElementById('todoName').value;
  const priority = document.getElementById('todoPriority').value || 'low';
  const isFun = document.getElementById('todoIsFun').value || 'true';

  const todo = { name, priority, isFun };

  try {
    const response = await fetch('/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todo)
    });

    const result = await response.json();
    alert(`Todo added: ${JSON.stringify(result)}`);

    // Clear input fields after adding todo
    document.getElementById('todoName').value = '';
    document.getElementById('todoPriority').value = '';
    document.getElementById('todoIsFun').value = '';

    // Refresh the todo list
    displayTodos();
  } catch (error) {
    console.error('Error adding todo:', error);
    alert('Failed to add todo.');
  }
});

// Delete a todo when the "Delete Todo" button is clicked
document.getElementById('deleteTodo').addEventListener('click', async () => {
  const id = document.getElementById('todoIdToDelete').value; // Get ID from input field

  if (!id) {
    alert("Please provide a valid Todo ID.");
    return;
  }

  try {
    const response = await fetch(`/todos/${id}`, { method: 'DELETE' }); // Send DELETE request
    const result = await response.json();

    if (response.status === 200) {
      alert(result.message); // Show success message
    } else {
      alert('Error: ' + result.message); // Show error message
    }

    // Refresh the todo list to reflect the deleted todo
    displayTodos();
  } catch (error) {
    console.error('Error deleting todo:', error);
    alert('Failed to delete todo.');
  }
});

// Function to display all todos
async function displayTodos() {
  try {
    const response = await fetch('/todos');
    const todos = await response.json();

    const todoDisplay = document.getElementById('todoDisplay');
    todoDisplay.innerHTML = ''; // Clear any previous content

    if (todos.length === 0) {
      todoDisplay.innerHTML = '<p>No todos found.</p>';
      return;
    }

    const ul = document.createElement('ul');
    todos.forEach(todo => {
      const li = document.createElement('li');
      li.textContent = `ID: ${todo.id}, Name: ${todo.name}, Priority: ${todo.priority}, Is Fun: ${todo.isFun}`;
      ul.appendChild(li);
    });

    todoDisplay.appendChild(ul);
  } catch (error) {
    console.error('Error fetching todos:', error);
    document.getElementById('todoDisplay').innerHTML = '<p>Error loading todos.</p>';
  }
}

// Load the todos when the page is first loaded
window.onload = displayTodos;
