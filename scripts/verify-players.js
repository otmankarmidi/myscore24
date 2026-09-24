// Verification script for player profiles
// Tests: Yamal (386828), Mbappé (278), Haaland (1100), Lewandowski (521)

const API_KEY = '24f7ff23b96dcf9af3ef36a3bac17c15'
const API_HOST = 'v3.football.api-sports.io'

async function fetchApi(endpoint) {
  const url = `https://${API_HOST}${endpoint}`
  const res = await fetch(url, {
    headers: { 'x-apisports-key': API_KEY }
  })
  const json = await res.json()
  return json.response || []
}

async function verifyPlayer(playerId, expectedName) {
  console.log(`\n${'='.repeat(70)}`)
  console.log(`VERIFYING: ${expectedName} (ID: ${playerId})`)
  console.log('='.repeat(70))

  // 1. Get squads
  const squads = await fetchApi(`/players/squads?player=${playerId}`)
  let currentClub = null
  let nationalTeam = null
  
  const NATIONAL_NAMES = ['spain', 'france', 'england', 'germany', 'argentina', 'brazil', 
    'portugal', 'poland', 'norway', 'morocco', 'netherlands', 'italy']

  for (const sq of squads) {
    const team = sq.team
    const isNational = NATIONAL_NAMES.includes((team.name || '').toLowerCase()) ||
      (team.name || '').toLowerCase().includes('national')
    
    if (isNational && !nationalTeam) {
      nationalTeam = { id: team.id, name: team.name }
    } else if (!isNational && !currentClub) {
      currentClub = { id: team.id, name: team.name }
    }
  }

  console.log(`  Current Club: ${currentClub ? `${currentClub.name} (${currentClub.id})` : 'NOT FOUND'}`)
  console.log(`  National Team: ${nationalTeam ? `${nationalTeam.name} (${nationalTeam.id})` : 'NOT FOUND'}`)

  // 2. Get 2026 season stats
  const playerData = await fetchApi(`/players?id=${playerId}&season=2026`)
  const pd = playerData[0]
  
  if (!pd) {
    console.log(`  ERROR: No API data for season 2026!`)
    return
  }

  console.log(`  Name: ${pd.player.name}`)
  console.log(`  Photo: ${pd.player.photo ? 'YES' : 'MISSING'}`)
  console.log(`  Photo URL: ${pd.player.photo || 'N/A'}`)
  console.log(`  Age: ${pd.player.age}`)
  console.log(`  Nationality: ${pd.player.nationality}`)
  console.log(`  Height: ${pd.player.height}`)
  console.log(`  Weight: ${pd.player.weight}`)

  // 3. Show all 2026 competitions
  const stats = pd.statistics || []
  console.log(`\n  Season 2026 competitions (${stats.length} total):`)
  
  for (const s of stats) {
    const team = s.team
    const league = s.league
    const games = s.games || {}
    const goals = s.goals || {}
    
    const isCurrentClub = currentClub && Number(team.id) === Number(currentClub.id)
    const marker = isCurrentClub ? ' ★ CURRENT CLUB' : ''
    
    console.log(`    ${league.name} (${league.country}) — ${team.name}${marker}`)
    console.log(`      Apps: ${games.appearences ?? 'null'} | Goals: ${goals.total ?? 'null'} | Assists: ${goals.assists ?? 'null'} | Rating: ${games.rating ?? 'null'}`)
  }

  // 4. Determine default competition (current club + domestic league)
  const DOMESTIC_KEYWORDS = ['la liga', 'premier league', 'serie a', 'bundesliga', 'ligue 1', 
    'major league soccer', 'mls', 'primeira liga', 'eredivisie', 'botola', 'saudi pro league']
  
  const currentClubStats = currentClub 
    ? stats.filter(s => Number(s.team.id) === Number(currentClub.id))
    : []
  
  let defaultComp = null
  if (currentClubStats.length > 0) {
    defaultComp = currentClubStats.find(s => {
      const name = (s.league.name || '').toLowerCase()
      return DOMESTIC_KEYWORDS.some(kw => name.includes(kw))
    })
    if (!defaultComp) {
      defaultComp = currentClubStats.sort((a, b) => 
        (b.games?.appearences || 0) - (a.games?.appearences || 0)
      )[0]
    }
  }
  if (!defaultComp && stats.length > 0) {
    defaultComp = stats.sort((a, b) => 
      (b.games?.appearences || 0) - (a.games?.appearences || 0)
    )[0]
  }

  if (defaultComp) {
    const CALENDAR_YEAR_COUNTRIES = ['usa', 'brazil', 'argentina', 'japan', 'norway', 'sweden']
    const country = (defaultComp.league.country || '').toLowerCase()
    const lname = (defaultComp.league.name || '').toLowerCase()
    const isCalendar = country === 'usa' || lname.includes('mls') || 
      CALENDAR_YEAR_COUNTRIES.includes(country)
    const seasonLabel = isCalendar ? '2026' : '2026/27'
    
    console.log(`\n  DEFAULT STATS VIEW:`)
    console.log(`    Competition: ${defaultComp.league.name}`)
    console.log(`    Team: ${defaultComp.team.name}`)
    console.log(`    Season Label: ${seasonLabel}`)
    console.log(`    Apps: ${defaultComp.games?.appearences ?? 'null'}`)
    console.log(`    Goals: ${defaultComp.goals?.total ?? 'null'}`)
    console.log(`    Assists: ${defaultComp.goals?.assists ?? 'null'}`)
    console.log(`    Rating: ${defaultComp.games?.rating ?? 'null'}`)
  }

  return { currentClub, nationalTeam, statsCount: stats.length }
}

async function main() {
  console.log('MyScore24 Player Profile Verification')
  console.log('Date:', new Date().toISOString())
  console.log('Season: 2026 (API-Football)')
  console.log('')

  const players = [
    { id: 386828, name: 'Lamine Yamal' },
    { id: 278, name: 'Kylian Mbappé' },
    { id: 1100, name: 'Erling Haaland' },
    { id: 521, name: 'Robert Lewandowski' },
  ]

  const results = {}
  for (const p of players) {
    try {
      results[p.name] = await verifyPlayer(p.id, p.name)
    } catch (err) {
      console.log(`  ERROR: ${err.message}`)
      results[p.name] = { error: err.message }
    }
  }

  console.log(`\n${'='.repeat(70)}`)
  console.log('SUMMARY')
  console.log('='.repeat(70))
  for (const [name, r] of Object.entries(results)) {
    if (r.error) {
      console.log(`  ${name}: ERROR - ${r.error}`)
    } else {
      console.log(`  ${name}: Club=${r.currentClub?.name || 'N/A'}, National=${r.nationalTeam?.name || 'N/A'}, Competitions=${r.statsCount}`)
    }
  }

  // Special checks
  console.log('\nCRITICAL CHECKS:')
  const lewa = results['Robert Lewandowski']
  if (lewa && !lewa.error) {
    const isChicago = lewa.currentClub?.name?.toLowerCase().includes('chicago')
    const isNotBarca = !lewa.currentClub?.name?.toLowerCase().includes('barcelona')
    console.log(`  ✓ Lewandowski current club = ${lewa.currentClub?.name} ${isChicago ? '✅ CORRECT' : isNotBarca ? '⚠️ NOT BARCA (GOOD) but unexpected club' : '❌ STILL BARCA - WRONG'}`)
  }
}

main().catch(console.error)
