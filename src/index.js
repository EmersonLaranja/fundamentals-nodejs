const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();
app.use(express.json());

const customers = [];


function verifyIfExistsAccountCPF(req, res, next) {
  const { cpf } = req.headers;

  const customer = customers.find(customer => customer.cpf === cpf);

  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }
  req.customer = customer;
  return next();
}

app.post('/account', (req, res) => {
  const { cpf, name } = req.body;

  const customerAlreadyExists = customers.some(customer => customer.cpf === cpf)

  if (customerAlreadyExists)
    return res.status(400).json({ error: "Customer already exists!" })

  customers.push({
    cpf, name, id: uuidv4(), statement: []
  })

  return res.status(201).send();
});

app.get('/statement', verifyIfExistsAccountCPF, (req, res) => {

  const { customer } = req;
  return res.json(customer.statement);

})

app.post("/deposit", verifyIfExistsAccountCPF, (req, res) => {

  const { customer } = req;
  const { description, amount } = req.body;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit"
  }

  customer.statement.push(statementOperation);
  return res.status(201).send();

})

app.get('/statement/date', verifyIfExistsAccountCPF, (req, res) => {

  const { customer } = req;
  const { date } = req.query;

  const dateFormat = new Date(date + ' 00:00');
  console.log(typeof (customer.statement[0].created_at));
  const statement = customer.statement.filter(statement => statement.created_at.toDateString() === new Date(dateFormat).toDateString());

  console.log(dateFormat);
  console.log(statement.created_at);
  // console.log(statement.created_at.toDateString());

  return res.json(customer.statement);

})

app.put('/account', verifyIfExistsAccountCPF, (req, res) => {
  const { name } = req.body;
  const { customer } = req;

  customer.name = name;

  return res.status(201).send();

})

app.get('/account', verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;
  return res.json(customer);
})

app.delete('/account', verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;
  customers.splice(customer, 1)

  return res.status(200).json(customers);

})
app.listen(3333);