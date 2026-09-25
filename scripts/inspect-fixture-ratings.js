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
  const team0 = playersData.response?.[0]
  console.log('Team 0 name:', team0?.team?.name)
  console.log('Sample players from Team 0:')
  team0?.players?.slice(0, 5).forEach(p => {
    const s = p.statistics?.[0]?.games || {}
    console.log(`Player: ${p.player.name} (${p.player.id}), pos: ${s.position}, rating: ${s.rating}, minutes: ${s.minutes}`)
  })
}

main().catch(console.error)
