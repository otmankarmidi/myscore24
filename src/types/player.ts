import { Team } from './team'

export interface PlayerStats {
  appearances?: number | null
  matches?: number | null
  lineups?: number | null
  goals?: number | null
  assists?: number | null
  yellowCards?: number | null
  redCards?: number | null
  minutesPlayed?: number | null
  minutes?: number | null
  rating?: number | null
  cleanSheets?: number | null
  saves?: number | null
  passAccuracy?: number | null
  dribbles?: number | null
  shotsOnTarget?: number | null
  shotsTotal?: number | null
}

export interface PlayerCompetitionItem {
  competitionId?: string
  leagueId?: number | string
  leagueName: string
  leagueLogo?: string | null
  leagueCountry?: string | null
  teamId?: string
  teamProviderId?: number
  teamName: string
  teamLogo?: string | null
  season?: number | string
  isCalendarYear?: boolean
  appearances?: number | null
  lineups?: number | null
  minutes?: number | null
  goals?: number | null
  assists?: number | null
  yellowCards?: number | null
  redCards?: number | null
  rating?: number | null
}

export interface Player {
  id: string
  providerPlayerId?: number
  slug: string
  name: string
  firstName: string
  lastName: string
  photo?: string | null
  image?: string | null
  imagePath?: string | null
  imageSourceUrl?: string | null
  squadNumber?: number | null
  nationality: string
  nationalityFlag?: string | null
  countryFlag?: string | null
  dateOfBirth: string
  age: number
  height?: string | number | null
  weight?: string | number | null
  position: string
  number?: number | null
  team?: Team
  teamId?: string | null
  teamSlug?: string | null
  teamName?: string | null
  teamLogo?: string | null
  currentClubId?: string | null
  currentClubProviderId?: number | null
  currentNationalTeamId?: string | null
  currentNationalProviderId?: number | null
  preferredFoot?: string | null
  marketValue?: string | null
  stats?: PlayerStats
  seasonStats?: PlayerStats
  competitions?: PlayerCompetitionItem[]
  defaultCompetitionId?: string | number | null
  selectedCompetitionId?: string | number | null
  seasonYear?: number
  seasonLabel?: string
  recentMatches?: Array<{
    matchId: string
    matchSlug: string
    opponentName: string
    opponentLogo?: string
    isHome?: boolean
    score?: string
    rating?: number
    ratingIsLive?: boolean
    date: string
  }>
}
