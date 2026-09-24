const fs = require('fs')

async function testSquads() {
  const apiKey = '24f7ff23b96dcf9af3ef36a3bac17c15'
  const headers = { 'x-apisports-key': apiKey }

  // 1. Mbappe (278)
  console.log('Testing Mbappe (278)...')
  const res1 = await fetch('https://v3.football.api-sports.io/players/squads?player=278', { headers })
  const json1 = await res1.json()
  console.log('Mbappe squads:', json1.response?.map(r => ({ team: r.team.name, id: r.team.id, playerPos: r.players[0]?.position, number: r.players[0]?.number })))

  // 2. Haaland (1100)
  console.log('Testing Haaland (1100)...')
  const res2 = await fetch('https://v3.football.api-sports.io/players/squads?player=1100', { headers })
  const json2 = await res2.json()
  console.log('Haaland squads:', json2.response?.map(r => ({ team: r.team.name, id: r.team.id, playerPos: r.players[0]?.position, number: r.players[0]?.number })))

  // 3. Olmo (1218)
  console.log('Testing Dani Olmo (1218)...')
  const res3 = await fetch('https://v3.football.api-sports.io/players/squads?player=1218', { headers })
  const json3 = await res3.json()
  console.log('Olmo squads:', json3.response?.map(r => ({ team: r.team.name, id: r.team.id, playerPos: r.players[0]?.position, number: r.players[0]?.number })))
}

testSquads()
