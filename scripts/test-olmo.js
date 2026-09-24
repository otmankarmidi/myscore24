const fs = require('fs')

async function testOlmo() {
  const apiKey = '24f7ff23b96dcf9af3ef36a3bac17c15'
  const headers = { 'x-apisports-key': apiKey }

  // Dani Olmo search
  const res = await fetch('https://v3.football.api-sports.io/players?search=Dani%20Olmo', { headers })
  const json = await res.json()
  console.log('Olmo search:', json.response?.map(r => ({ id: r.player.id, name: r.player.name, firstname: r.player.firstname, lastname: r.player.lastname, team: r.statistics?.[0]?.team?.name })))
}

testOlmo()
