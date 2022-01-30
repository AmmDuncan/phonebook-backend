require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const Person = require("./models/person");

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

app.get("/info", async (req, res) => {
  const persons = await Person.find({});
  const body = `
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>
  `;

  res.status(200).send(body);
});

app.post("/api/persons", async (req, res, next) => {
  const body = req.body;
  try {
    if (!body.name || !body.number) {
      res.status(400).json({ error: "name or number missing" }).end();
    }
    const found = await Person.findOne({ name: { $eq: body.name } });
    if (found) {
      return res
        .status(400)
        .json({ error: `${body.name} already exists, try updating instead` });
    }
    const person = new Person({
      name: body.name,
      number: body.number,
    });
    const savedPerson = await person.save();
    res.status(201).send(savedPerson);
  } catch (e) {
    next(e);
  }
});

app.get("/api/persons", async (req, res) => {
  const people = await Person.find({});

  res.status(200).send(people);
});

app.get("/api/persons/:id", async (req, res, next) => {
  const id = req.params.id;
  try {
    const person = await Person.findById(id);
    if (!person) {
      next({ message: "Person not found" });
    } else {
      res.status(200).send(person);
    }
  } catch (e) {
    next(e);
  }
});

app.put("/api/persons/:id", async (req, res, next) => {
  const id = req.params.id;
  try {
    const updatedPerson = await Person.findByIdAndUpdate(
      id,
      { number: req.body.number },
      { new: true, runValidators: true }
    );
    res.status(200).send(updatedPerson.toJSON());
  } catch (e) {
    next(e);
  }
});

app.delete("/api/persons/:id", async (req, res, next) => {
  const id = req.params.id;
  try {
    await Person.findByIdAndDelete(id);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

const errorHandler = (error, req, res, next) => {
  console.log(error.message);
  if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  }
  res
    .status(400)
    .send({ error: error.message || "something unexpected happened" });
};

app.use(errorHandler);

const port = process.env.PORT || 3005;
app.listen(port, () => {
  console.log(`server started on port ${port}`);
});
