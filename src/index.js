const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const existsUser = users.find(user => user.username === username);

  if(!existsUser && users.length > 0) return response.status(404).json({ error: 'User Not Found' });

  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const existsUser = users.find(user => user.username === username);

  if(existsUser) return response.status(400).json({ error: 'User Already Exists!' });

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
   const { username } = request.headers;
   const todos = users.find(user => user.username === username).todos;
   return response.json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;

  const newTodo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
	  created_at: new Date()
  }

  const index = users.findIndex(user => user.username === username);
  const user = users[index];
  user.todos.push(newTodo);
  users[index] = user;
  return response.status(201).json(newTodo); 
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { username } = request.headers;

  const index = users.findIndex(user => user.username === username);
  const user = users[index];

  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  if(todoIndex === -1) return response.status(404).json({ error: 'Todo Not Found' });

  user.todos[todoIndex].title = title;
  user.todos[todoIndex].deadline = new Date(deadline);

  const { done } = user.todos[todoIndex];
  
  users[index] = user;
  return response.json({
    title, 
    deadline, 
    done
  }); 
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;

  const index = users.findIndex(user => user.username === username);
  const user = users[index];

  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  if(todoIndex === -1) return response.status(404).json({ error: 'Todo Not Found' });

  user.todos[todoIndex].done = true;

  const todo = user.todos[todoIndex];

  users[index] = user;

  return response.json(todo); 
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;

  const index = users.findIndex(user => user.username === username);

  const user = users[index];

  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  if(todoIndex === -1) return response.status(404).json({ error: 'Todo Not Found' });
  
  user.todos.splice(todoIndex, 1);

  users[index] = user;
  return response.status(204).send(); 
});

module.exports = app;