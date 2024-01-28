const axios = require('axios')
const { jwtDecode } = require('jwt-decode')
require('dotenv').config()

async function getUser(token) {
  // decode token
  const tokenData = jwtDecode(token)

  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  // set user
  try {
    let user = await axios.get(`${process.env.API_URL}/${process.env.USERS_PATH}/${tokenData.id}`)
    if (user?.data) {
      return user.data
    } else console.log('error')
  } catch (err) {
    console.log(err)
  }
}

async function getClients(token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  // set user
  try {
    let user = await axios.get(`${process.env.API_URL}/${process.env.GET_CLIENTS_PATH}`)
    if (user?.data?.items) {
      return user.data.items
    } else console.log('error')
  } catch (err) {
    console.log(err)
  }
}

async function getRecordings(token) {
  // decode token
  const tokenData = jwtDecode(token)

  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  // set user
  try {
    let user = await axios.get(`${process.env.API_URL}/${process.env.GET_RECORDINGS_PATH}/${tokenData.id}`)
    if (user?.data) {
      return user.data
    } else console.log('error')
  } catch (err) {
    console.log(err)
  }
}

module.exports = { getUser, getClients, getRecordings }
