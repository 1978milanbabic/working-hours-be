const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const TinyDB = require('tinydb')

const app = express()
const port = 5000

const db = new TinyDB('./db/database.json')

app.use(cors())
app.use(bodyParser.json())

// API routes
app.get('/api/todos', (req, res) => {
  const todos = db.getInfo('todos') || []
  res.json(todos)
})

app.post('/api/todos', (req, res) => {
  const newTodo = req.body
  const todos = db.getInfo('todos') || []
  todos.push(newTodo)
  db.setInfo('todos', todos)
  res.json(newTodo)
})

// test db
db.onReady = () => {
  console.log('database is ready for operating')

  // set info to DB
  db.setInfo('title', 'Test DB', function (err, key, value) {
    if (err) {
      console.log(err)
      return
    }

    console.log('[setInfo] ' + key + ' : ' + value)
  })

  // get info from DB
  db.getInfo('title', function (err, key, value) {
    if (err) {
      console.log(err)
      return
    }

    console.log('[getInfo] ' + key + ' : ' + value)
  })
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
