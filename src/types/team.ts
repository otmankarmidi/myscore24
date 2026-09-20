export interface Team {
  id: string
  slug: string
  name: string
  shortName: string
  abbreviation: string
  logo?: string
  country: string
  countryFlag?: string
  founded?: number
  stadium?: string
  stadiumCapacity?: number
  manager?: string
  website?: string
  colors?: {
    primary: string
    secondary: string
  }
}
