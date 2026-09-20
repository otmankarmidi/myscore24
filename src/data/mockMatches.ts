import { Match } from '@/types/match'
import { mockTeams } from './mockTeams'
import { mockLeagues } from './mockLeagues'

const t = (id: string) => mockTeams.find(tm => tm.id === id)!
const l = (id: string) => mockLeagues.find(lg => lg.id === id)!

export const mockMatches: Match[] = [
  // ─── La Liga ──────────────────────────────────────────────────────────────
  {
    id: 'laliga-fcb-rma-001',
    slug: 'fc-barcelona-vs-real-madrid',
    league: l('laliga'),
    homeTeam: t('fcb'),
    awayTeam: t('rma'),
    score: { home: 2, away: 1, halftime: { home: 1, away: 0 } },
    status: 'live',
    minute: 73,
    kickoff: '2026-09-21T19:00:00Z',
    venue: 'Camp Nou, Barcelona',
    referee: 'Jesús Gil Manzano',
    round: 'Round 28',
    events: [
      { id: 'e1', minute: 22, type: 'goal', team: 'home', playerName: 'Lamine Yamal', detail: 'Right foot shot' },
      { id: 'e2', minute: 48, type: 'goal', team: 'away', playerName: 'Kylian Mbappé', detail: 'Header' },
      { id: 'e3', minute: 61, type: 'goal', team: 'home', playerName: 'Raphinha', detail: 'Penalty' },
      { id: 'e4', minute: 68, type: 'red_card', team: 'away', playerName: 'Dani Carvajal', detail: 'Second yellow' },
    ],
    statistics: {
      possession: { home: 58, away: 42 },
      shots: { home: 14, away: 8 },
      shotsOnTarget: { home: 6, away: 3 },
      corners: { home: 7, away: 3 },
      fouls: { home: 9, away: 13 },
      yellowCards: { home: 1, away: 2 },
      redCards: { home: 0, away: 1 },
      offsides: { home: 2, away: 1 },
      xG: { home: 2.4, away: 1.1 },
      passes: { home: 487, away: 342 },
      passAccuracy: { home: 89, away: 81 },
    },
    lineup: {
      home: {
        formation: '4-3-3',
        startingXI: [
          { id: 'p1', name: 'Szczesny', number: 1, position: 'GK', positionX: 50, positionY: 92 },
          { id: 'p2', name: 'Koundé', number: 23, position: 'RB', positionX: 80, positionY: 78 },
          { id: 'p3', name: 'Araujo', number: 4, position: 'CB', positionX: 62, positionY: 82 },
          { id: 'p4', name: 'Iñigo Martínez', number: 5, position: 'CB', positionX: 38, positionY: 82 },
          { id: 'p5', name: 'Balde', number: 3, position: 'LB', positionX: 20, positionY: 78 },
          { id: 'p6', name: 'Pedri', number: 8, position: 'CM', positionX: 35, positionY: 62 },
          { id: 'p7', name: 'De Jong', number: 21, position: 'DM', positionX: 50, positionY: 67 },
          { id: 'p8', name: 'Dani Olmo', number: 20, position: 'CM', positionX: 65, positionY: 62 },
          { id: 'p9', name: 'Yamal', number: 19, position: 'RW', positionX: 85, positionY: 44, rating: 8.3 },
          { id: 'p10', name: 'Lewandowski', number: 9, position: 'ST', positionX: 50, positionY: 35 },
          { id: 'p11', name: 'Raphinha', number: 11, position: 'LW', positionX: 15, positionY: 44 },
        ],
        substitutes: [
          { id: 'p12', name: 'Fermín', number: 16, position: 'CM', positionX: 0, positionY: 0 },
          { id: 'p13', name: 'Gavi', number: 6, position: 'CM', positionX: 0, positionY: 0 },
          { id: 'p14', name: 'Torres', number: 7, position: 'FW', positionX: 0, positionY: 0 },
        ],
      },
      away: {
        formation: '4-3-3',
        startingXI: [
          { id: 'p20', name: 'Lunin', number: 13, position: 'GK', positionX: 50, positionY: 8 },
          { id: 'p21', name: 'Carvajal', number: 2, position: 'RB', positionX: 80, positionY: 22, redCard: true },
          { id: 'p22', name: 'Militão', number: 3, position: 'CB', positionX: 62, positionY: 18 },
          { id: 'p23', name: 'Rüdiger', number: 22, position: 'CB', positionX: 38, positionY: 18 },
          { id: 'p24', name: 'Mendy', number: 23, position: 'LB', positionX: 20, positionY: 22 },
          { id: 'p25', name: 'Valverde', number: 15, position: 'CM', positionX: 65, positionY: 38 },
          { id: 'p26', name: 'Tchouaméni', number: 8, position: 'DM', positionX: 50, positionY: 33 },
          { id: 'p27', name: 'Bellingham', number: 5, position: 'CM', positionX: 35, positionY: 38 },
          { id: 'p28', name: 'Rodrygo', number: 11, position: 'RW', positionX: 82, positionY: 56 },
          { id: 'p29', name: 'Mbappé', number: 9, position: 'ST', positionX: 50, positionY: 65 },
          { id: 'p30', name: 'Vinícius Jr', number: 7, position: 'LW', positionX: 18, positionY: 56 },
        ],
        substitutes: [
          { id: 'p31', name: 'Camavinga', number: 12, position: 'CM', positionX: 0, positionY: 0 },
          { id: 'p32', name: 'Güler', number: 24, position: 'AM', positionX: 0, positionY: 0 },
        ],
      },
    },
  },
  {
    id: 'laliga-atm-ath-001',
    slug: 'atletico-madrid-vs-athletic-club',
    league: l('laliga'),
    homeTeam: t('atm'),
    awayTeam: t('ath'),
    score: { home: 1, away: 1, halftime: { home: 0, away: 1 } },
    status: 'live',
    minute: 84,
    kickoff: '2026-09-21T19:00:00Z',
    events: [
      { id: 'e5', minute: 35, type: 'goal', team: 'away', playerName: 'Nico Williams' },
      { id: 'e6', minute: 71, type: 'goal', team: 'home', playerName: 'Antoine Griezmann' },
    ],
  },
  {
    id: 'laliga-rso-sev-001',
    slug: 'real-sociedad-vs-sevilla-fc',
    league: l('laliga'),
    homeTeam: t('rso'),
    awayTeam: t('sev'),
    score: { home: null, away: null },
    status: 'scheduled',
    kickoff: '2026-09-21T21:00:00Z',
    venue: 'Reale Arena, San Sebastián',
  },
  // ─── Premier League ───────────────────────────────────────────────────────
  {
    id: 'epl-ars-che-001',
    slug: 'arsenal-vs-chelsea',
    league: l('epl'),
    homeTeam: t('ars'),
    awayTeam: t('che'),
    score: { home: 3, away: 0, halftime: { home: 2, away: 0 } },
    status: 'full_time',
    kickoff: '2026-09-21T14:00:00Z',
    events: [
      { id: 'e7', minute: 14, type: 'goal', team: 'home', playerName: 'Bukayo Saka' },
      { id: 'e8', minute: 38, type: 'goal', team: 'home', playerName: 'Kai Havertz' },
      { id: 'e9', minute: 76, type: 'goal', team: 'home', playerName: 'Declan Rice' },
    ],
    statistics: {
      possession: { home: 62, away: 38 },
      shots: { home: 18, away: 5 },
      shotsOnTarget: { home: 8, away: 1 },
      corners: { home: 9, away: 2 },
      fouls: { home: 7, away: 11 },
      yellowCards: { home: 0, away: 2 },
      redCards: { home: 0, away: 0 },
      offsides: { home: 1, away: 3 },
      xG: { home: 3.1, away: 0.4 },
    },
  },
  {
    id: 'epl-mci-liv-001',
    slug: 'manchester-city-vs-liverpool',
    league: l('epl'),
    homeTeam: t('mci'),
    awayTeam: t('liv'),
    score: { home: 2, away: 2, halftime: { home: 1, away: 1 } },
    status: 'live',
    minute: 65,
    kickoff: '2026-09-21T16:30:00Z',
    events: [
      { id: 'e10', minute: 9, type: 'goal', team: 'home', playerName: 'Erling Haaland' },
      { id: 'e11', minute: 33, type: 'goal', team: 'away', playerName: 'Mohamed Salah' },
      { id: 'e12', minute: 42, type: 'goal', team: 'home', playerName: 'Erling Haaland' },
      { id: 'e13', minute: 55, type: 'goal', team: 'away', playerName: 'Luis Díaz' },
    ],
  },
  {
    id: 'epl-new-tot-001',
    slug: 'newcastle-united-vs-tottenham-hotspur',
    league: l('epl'),
    homeTeam: t('new'),
    awayTeam: t('tot'),
    score: { home: null, away: null },
    status: 'scheduled',
    kickoff: '2026-09-21T17:30:00Z',
  },
  // ─── Botola Pro ───────────────────────────────────────────────────────────
  {
    id: 'botola-wac-rca-001',
    slug: 'wydad-ac-vs-raja-ca',
    league: l('botola'),
    homeTeam: t('wac'),
    awayTeam: t('rca'),
    score: { home: 1, away: 0, halftime: { home: 1, away: 0 } },
    status: 'half_time',
    kickoff: '2026-09-21T17:00:00Z',
    events: [{ id: 'e14', minute: 34, type: 'goal', team: 'home', playerName: 'Ayoub El Moutaraji' }],
  },
  {
    id: 'botola-far-rsb-001',
    slug: 'as-far-vs-rs-berkane',
    league: l('botola'),
    homeTeam: t('far'),
    awayTeam: t('rsb'),
    score: { home: 2, away: 1, halftime: { home: 1, away: 0 } },
    status: 'full_time',
    kickoff: '2026-09-21T14:00:00Z',
  },
  // ─── Champions League ─────────────────────────────────────────────────────
  {
    id: 'ucl-bay-psg-001',
    slug: 'bayern-munich-vs-paris-saint-germain',
    league: l('ucl'),
    homeTeam: t('bay'),
    awayTeam: t('psg'),
    score: { home: null, away: null },
    status: 'scheduled',
    kickoff: '2026-09-21T20:45:00Z',
    venue: 'Allianz Arena, Munich',
  },
  {
    id: 'ucl-int-bvb-001',
    slug: 'inter-milan-vs-borussia-dortmund',
    league: l('ucl'),
    homeTeam: t('int'),
    awayTeam: t('bvb'),
    score: { home: null, away: null },
    status: 'scheduled',
    kickoff: '2026-09-21T20:45:00Z',
    venue: 'Giuseppe Meazza, Milan',
  },
]

export const getMatchBySlug = (slug: string) => mockMatches.find(m => m.slug === slug)
export const getLiveMatches = () => mockMatches.filter(m => m.status === 'live' || m.status === 'half_time')
export const getMatchesByLeague = (leagueId: string) => mockMatches.filter(m => m.league.id === leagueId)
export const getMatchesByStatus = (status: string): Match[] => {
  if (status === 'live') return mockMatches.filter(m => m.status === 'live' || m.status === 'half_time')
  if (status === 'upcoming') return mockMatches.filter(m => m.status === 'scheduled')
  if (status === 'finished') return mockMatches.filter(m => m.status === 'full_time' || m.status === 'penalties')
  return mockMatches
}
