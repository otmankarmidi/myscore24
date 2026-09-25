const API_KEY = '24f7ff23b96dcf9af3ef36a3bac17c15'
const API_HOST = 'v3.football.api-sports.io'

async function fetchApi(endpoint) {
  const url = `https://${API_HOST}/${endpoint}`
  const res = await fetch(url, {
    headers: { 'x-apisports-key': API_KEY }
  })
  return res.json()
}

async function main() {
  const fixId = 1208399
  const playersData = await fetchApi(`fixtures/players?fixture=${fixId}`)
  
  const playerRatingMap = new Map()
  for (const teamRes of (playersData.response || [])) {
    for (const pItem of (teamRes.players || [])) {
      const pId = String(pItem.player?.id)
      const pStats = pItem.statistics?.[0]?.games
      if (pId && pStats) {
        const rating = pStats.rating ? parseFloat(String(pStats.rating)) : undefined
        playerRatingMap.set(pId, {
          rating: isNaN(rating) ? undefined : rating,
          pos: pStats.position,
          minutes: pStats.minutes,
        })
      }
    }
  }

  console.log('Player ratings count mapped:', playerRatingMap.size)
  console.log('Sample map entries:', Array.from(playerRatingMap.entries()).slice(0, 5))
}

main().catch(console.error)
