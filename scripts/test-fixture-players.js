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
  console.log('Testing fixture players stats...')
  // Let's test a recent fixture ID or search live/finished fixture
  const today = new Date().toISOString().split('T')[0]
  const fixturesData = await fetchApi(`fixtures?date=${today}&league=39`) // Premier League
  const fixture = fixturesData.response?.[0]
  if (!fixture) {
    console.log('No fixture found today for league 39, fetching recent fixtures...')
    const recentData = await fetchApi(`fixtures?league=39&season=2024&last=1`)
    console.log('Recent fixture response:', JSON.stringify(recentData.response?.[0]?.fixture, null, 2))
    const fixId = recentData.response?.[0]?.fixture?.id
    if (fixId) {
      const playersData = await fetchApi(`fixtures/players?fixture=${fixId}`)
      console.log('Fixtures/players response sample:', JSON.stringify(playersData.response?.[0]?.players?.[0], null, 2))
    }
  } else {
    console.log('Fixture found:', fixture.fixture.id)
    const playersData = await fetchApi(`fixtures/players?fixture=${fixture.fixture.id}`)
    console.log('Fixtures/players response sample:', JSON.stringify(playersData.response?.[0]?.players?.[0], null, 2))
  }
}

main().catch(console.error)
