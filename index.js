const express = require('express')
const app = express()
const morgan = require('morgan')

app.use(express.json())
morgan.token('body', function (request, response) { return JSON.stringify(request.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

const validateNewPersonMiddleware = (request, response, next) => {
    const newPerson = request.body;
    // As in requirements, better to keep { [filed]: errorString } structure to validate all errors at once
    if (!newPerson.number) {
        return response.status(403).json({ error: 'number is required' });
    }
    if (!newPerson.name) {
        return response.status(403).json({ error: 'name is required' });
    }
    if (persons.some(p => p.number ===  newPerson.number)) {
        return response.status(403).json({ error: 'number must be unique' });
    }
    if (persons.some(p => p.name ===  newPerson.name)) {
        return response.status(403).json({ error: 'name must be unique' });
    }

    return next();
}

app.get('/api/persons/:id', (request, response) => {
    const personId = Number(request.params.id);
    const person = persons.find(p => p.id === personId);

    if (!person) {
        response.status(404).end();
    } else {
        response.json(person);
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const personId = Number(request.params.id);
    persons = persons.filter((p) => p.id !== personId);
    response.status(204).end();
})

app.post('/api/persons', validateNewPersonMiddleware, (request, response) => {
    const newPerson = request.body;
    newPerson.id = Math.floor(Math.random() * 99999); // as in requirements
    persons = persons.concat(newPerson)
    response.json(newPerson);
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    response.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date()}</p>
    `)
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})