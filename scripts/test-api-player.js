const fs = require('fs')

async function testApi() {
  const apiKey = '24f7ff23b96dcf9af3ef36a3bac17c15'
  const headers = { 'x-apisports-key': apiKey }

  // Test Lamine Yamal (ID 386828)
  console.log('Testing Lamine Yamal...')
  
  // 1. Squads
  const squadUrl = 'https://v3.football.api-sports.io/players/squads?player=386828'
  const squadRes = await fetch(squadUrl, { headers })
  const squadJson = await squadRes.json()
  console.log('Squad response:', JSON.stringify(squadJson, null, 2))

  // 2. Stats season 2026
  const stats2026Url = 'https://v3.football.api-sports.io/players?id=386828&season=2026'
  const statsRes = await fetch(stats2026Url, { headers })
  const statsJson = await statsRes.json()
  console.log('Stats 2026 results count:', statsJson.results)
  if (statsJson.response && statsJson.response.length > 0) {
    const playerObj = statsJson.response[0]
    console.log('Player header:', playerObj.player)
    console.log('Statistics length:', playerObj.statistics?.length)
    playerObj.statistics?.forEach((s, idx) => {
      console.log(`[${idx}] League: ${s.league.name} (id: ${s.league.id}), Team: ${s.team.name} (id: ${s.team.id}), Apps: ${s.games.appearences}, Goals: ${s.goals.total}, Assists: ${s.goals.assists}`)
    })
  } else {
    console.log('Stats 2026 response:', JSON.stringify(statsJson, null, 2))
  }
}

testApi()
