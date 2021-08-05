const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) return response.status(400).json({ error: "User not found" });

  request.user = user;
  next();
}

app.get("/users", (request, response) => {
  response.json(users);
});

app.get("/users", checksExistsUserAccount, (request, response) => {
  response.json(request.user);
});

app.post("/users", (request, response) => {
  const { name } = request.body;
  const { username } = request.headers;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists)
    return request.status(400).json({ error: "User already exists" });

  users.push({
    name,
    username,
    id: uuidv4(),
    todos: [],
  });

  return response.status(201).send();
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { user } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodo);

  return response.status(201).send();
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todo = user.todos.find((user) => user.id === id);

  todo.title = title;
  todo.deadline = deadline;

  return response.status(201).send(user);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((user) => user.id === id);

  todo.done = true;

  return response.status(201).send(user);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  users.splice(user, 1);

  return response.status(201).json(users);
});

module.exports = app;
