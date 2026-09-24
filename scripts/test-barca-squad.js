const fs = require('fs')

async function testBarcaSquad() {
  const apiKey = '24f7ff23b96dcf9af3ef36a3bac17c15'
  const headers = { 'x-apisports-key': apiKey }

  // Barcelona (529) squad
  const res = await fetch('https://v3.football.api-sports.io/players/squads?team=529', { headers })
  const json = await res.json()
  const players = json.response?.[0]?.players || []
  console.log('Barcelona squad player count:', players.length)
  const olmo = players.find(p => p.name.toLowerCase().includes('olmo'))
  console.log('Olmo in Barca squad:', olmo)
  const lewy = players.find(p => p.name.toLowerCase().includes('lewandowski'))
  console.log('Lewy in Barca squad:', lewy)
  const raph = players.find(p => p.name.toLowerCase().includes('raphinha'))
  console.log('Raphinha in Barca squad:', raph)
}

testBarcaSquad()
