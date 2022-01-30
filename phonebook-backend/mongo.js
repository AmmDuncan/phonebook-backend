const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log(
    "You need to enter your password to run this program: node mongo.js <password>"
  );
  process.exit(1);
}
const password = process.argv[2];
const url = `mongodb+srv://fullstackopen:${password}@cluster0.ovfuj.mongodb.net/phonebook?retryWrites=true&w=majority`;
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

if (process.argv.length === 3) {
  Person.find({}).then((persons) => {
    console.log("phonebook:");
    persons.forEach(({ name, number }) => {
      console.log(`${name} ${number}`);
    });
    mongoose.connection.close();
  });
}

if (process.argv.length === 5) {
  const [, , , name, number] = process.argv;
  const newPerson = new Person({
    name,
    number,
  });
  newPerson.save().then((person) => {
    console.log(`added ${person.name} number ${person.number} to phonebook`);
    mongoose.connection.close();
  });
}
