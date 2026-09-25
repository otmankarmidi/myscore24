export interface LeagueSeasonItem {
  year: number
  current: boolean
  label: string
}

export interface League {
  id: string
  slug: string
  name: string
  shortName: string
  logo?: string
  country: string
  countryCode: string
  countryFlag?: string
  season: string
  currentSeason?: string
  selectedSeason?: string
  seasons?: LeagueSeasonItem[]
  currentRound?: string
  type: 'league' | 'cup' | 'international'
  continent?: string
  groups?: import('./standing').GroupedStanding[]
  standingsSupported?: boolean
  topScorersSupported?: boolean
}
