const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

morgan.token("body", (req, res) =>
  req.method === "POST" ? JSON.stringify(req.body) : ""
);

app.use(cors());
app.use(express.json());
app.use(express.static("build"));
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/info", (req, res) => {
  const body = `
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>
  `;

  res.status(200).send(body);
});

app.post("/api/persons", (req, res) => {
  const body = req.body;
  if (!body.name || !body.number) {
    res.status(400).json({ error: "name or number missing" }).end();
  }
  const found = persons.find((person) => person.name === body.name);
  if (found) {
    res.status(400).json({ error: "name must be unique" }).end();
  }
  const person = {
    id: Math.round(Math.random() * 10000),
    name: body.name,
    number: body.number,
  };
  persons = persons.concat(person);
  res.status(201).send(person);
});

app.get("/api/persons", (req, res) => {
  res.status(200).send(persons);
});

app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  const person = persons.find((p) => p.id === Number(id));
  if (!person) {
    res.status(404).send("not found");
  } else {
    res.status(200).send(person);
  }
});

app.delete("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  persons = persons.filter((p) => p.id !== Number(id));
  res.status(204).end();
});

const port = process.env.PORT || 3005;
app.listen(port, () => {
  console.log(`server started on port ${port}`);
});
