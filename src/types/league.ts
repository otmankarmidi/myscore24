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
  currentRound?: string
  type: 'league' | 'cup' | 'international'
  continent?: string
}
