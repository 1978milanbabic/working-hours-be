const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const TinyDB = require('tinydb')
const { v4: uuidv4 } = require('uuid')
require('dotenv').config()

const { getUser, getClients, getRecordings } = require('./apiCalls.js')

const app = express()
const port = 5000

const db = new TinyDB('./db/database.json')

app.use(cors())
app.use(bodyParser.json())

// **** API routes ****
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

// format DB -> get & store vals on login
app.post('/api/format', async (req, res) => {
  const { token } = req?.body
  if (token) {
    // // decode token
    // const tokenData = jwtDecode(token)

    // set user
    let user = await getUser(token)
    db.setInfo('user', user)
    // set clients
    let clients = await getClients(token)
    db.setInfo('clients', clients)
    // set recordings
    let recordings = await getRecordings(token)
    db.setInfo('recordings', recordings)

    // send response ok
    res.json({ staus: 'ok' })
  } else {
    res.json({ status: 'no token' })
  }
})
// get clients
app.get('/api/clients', async (req, res) => {
  db.getInfo('clients', (err, key, value) => {
    if (err) {
      console.log(err)
      return
    }
    res.json({ clients: value })
  })
})
// upsert one default
app.post('/api/upsert-defaults', (req, res) => {
  const params = req?.body
  // save schedule for day to DB
  db.getInfo('schedules', (err, key, value) => {
    if (err) {
      console.log(err)
      return
    }
    let defaults = value
    // set or update day event
    let dayEvent = params.formData
    // calculate sum time
    const { uhours, umins, eshours, esmins } = dayEvent
    let time = 0
    let estTime = 0
    if (uhours) time += 60 * uhours
    if (umins) time += umins
    if (eshours) estTime += 60 * eshours
    if (esmins) estTime += esmins
    dayEvent.time = time
    dayEvent.estTime = estTime
    if (!params.eventID) {
      // set new
      // add new id
      dayEvent.eventID = uuidv4()
      // push new event & update DB
      defaults[parseInt(params.selectedDayForModal)].push(dayEvent)
      db.setInfo('schedules', defaults)
      res.json({ status: 'created' })
    } else {
      // update
      let { eventID } = params
      let newDefaults = defaults.map((d, index) => {
        if (parseInt(params.selectedDayForModal) === index) {
          return d.map((ev) => {
            if (ev.eventID === eventID) {
              return dayEvent
            } else {
              return ev
            }
          })
        } else {
          return d
        }
      })
      db.setInfo('schedules', newDefaults)
      res.json({ status: 'edited' })
    }
  })
})
// get one default
app.get('/api/default/:day', (req, res) => {
  const params = req?.params
  let day = parseInt(params.day)
  db.getInfo('schedules', (err, key, value) => {
    if (err) {
      console.log(err)
      return
    }
    let returnDay = value[day]
    res.json({ returnDay })
  })
})
// remove one default
app.patch('/api/default', (req, res) => {
  const params = req?.body
  db.getInfo('schedules', (err, key, value) => {
    if (err) {
      console.log(err)
      return
    }
    let defaults = value
    let newDefaults = defaults.map((d, index) => {
      if (index === parseInt(params.currentDayNumber)) {
        // day array
        return d.filter((wd) => wd.eventID !== params.id)
      } else {
        return d
      }
    })
    db.setInfo('schedules', newDefaults)
    res.json(req.body)
  })
})

// test DB
db.onReady = () => {
  console.log('database is ready for operating')
  // set defaults to DB
  db.getInfo('schedules', (err, key, value) => {
    if (err) {
      db.setInfo('schedules', [[], [], [], [], [], [], []])
      return
    }
  })
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
