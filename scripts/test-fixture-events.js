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
  const res = await fetchApi('fixtures?league=39&season=2024&last=1')
  const fix = res.response?.[0]
  console.log('Fixture keys:', Object.keys(fix || {}))
  console.log('Has events?', Boolean(fix?.events), fix?.events?.length)
  if (fix?.events?.length) {
    console.log('Sample event:', fix.events[0])
  }
}

main().catch(console.error)
