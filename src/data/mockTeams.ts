import { Team } from '@/types/team'

export const mockTeams: Team[] = [
  { id: 'fcb', slug: 'fc-barcelona', name: 'FC Barcelona', shortName: 'Barcelona', abbreviation: 'FCB', country: 'Spain', countryFlag: '🇪🇸', founded: 1899, stadium: 'Camp Nou', stadiumCapacity: 99354, manager: 'Hansi Flick', colors: { primary: '#004D98', secondary: '#A50044' } },
  { id: 'rma', slug: 'real-madrid', name: 'Real Madrid', shortName: 'Real Madrid', abbreviation: 'RMA', country: 'Spain', countryFlag: '🇪🇸', founded: 1902, stadium: 'Santiago Bernabéu', stadiumCapacity: 81044, manager: 'Carlo Ancelotti', colors: { primary: '#FFFFFF', secondary: '#FEBE10' } },
  { id: 'atm', slug: 'atletico-madrid', name: 'Atlético Madrid', shortName: 'Atlético', abbreviation: 'ATM', country: 'Spain', countryFlag: '🇪🇸', founded: 1903, stadium: 'Cívitas Metropolitano', stadiumCapacity: 68456, manager: 'Diego Simeone' },
  { id: 'ath', slug: 'athletic-club', name: 'Athletic Club', shortName: 'Athletic', abbreviation: 'ATH', country: 'Spain', countryFlag: '🇪🇸', founded: 1898, stadium: 'San Mamés', stadiumCapacity: 53289 },
  { id: 'rso', slug: 'real-sociedad', name: 'Real Sociedad', shortName: 'R. Sociedad', abbreviation: 'RSO', country: 'Spain', countryFlag: '🇪🇸', founded: 1909, stadium: 'Reale Arena', stadiumCapacity: 40000 },
  { id: 'sev', slug: 'sevilla-fc', name: 'Sevilla FC', shortName: 'Sevilla', abbreviation: 'SEV', country: 'Spain', countryFlag: '🇪🇸', founded: 1890, stadium: 'Estadio Ramón Sánchez-Pizjuán', stadiumCapacity: 43883 },
  { id: 'ars', slug: 'arsenal', name: 'Arsenal', shortName: 'Arsenal', abbreviation: 'ARS', country: 'England', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', founded: 1886, stadium: 'Emirates Stadium', stadiumCapacity: 60704, manager: 'Mikel Arteta', colors: { primary: '#EF0107', secondary: '#FFFFFF' } },
  { id: 'che', slug: 'chelsea', name: 'Chelsea', shortName: 'Chelsea', abbreviation: 'CHE', country: 'England', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', founded: 1905, stadium: 'Stamford Bridge', stadiumCapacity: 40341, manager: 'Enzo Maresca' },
  { id: 'mci', slug: 'manchester-city', name: 'Manchester City', shortName: 'Man City', abbreviation: 'MCI', country: 'England', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', founded: 1880, stadium: 'Etihad Stadium', stadiumCapacity: 53400, manager: 'Pep Guardiola' },
  { id: 'liv', slug: 'liverpool', name: 'Liverpool', shortName: 'Liverpool', abbreviation: 'LIV', country: 'England', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', founded: 1892, stadium: 'Anfield', stadiumCapacity: 61276, manager: 'Arne Slot' },
  { id: 'new', slug: 'newcastle-united', name: 'Newcastle United', shortName: 'Newcastle', abbreviation: 'NEW', country: 'England', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', founded: 1892, stadium: "St. James' Park", stadiumCapacity: 52258 },
  { id: 'tot', slug: 'tottenham-hotspur', name: 'Tottenham Hotspur', shortName: 'Spurs', abbreviation: 'TOT', country: 'England', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', founded: 1882, stadium: 'Tottenham Hotspur Stadium', stadiumCapacity: 62850 },
  { id: 'wac', slug: 'wydad-ac', name: 'Wydad AC', shortName: 'Wydad', abbreviation: 'WAC', country: 'Morocco', countryFlag: '🇲🇦', founded: 1937, stadium: 'Stade Mohammed V', stadiumCapacity: 67000 },
  { id: 'rca', slug: 'raja-ca', name: 'Raja CA', shortName: 'Raja', abbreviation: 'RCA', country: 'Morocco', countryFlag: '🇲🇦', founded: 1949, stadium: 'Stade Mohammed V', stadiumCapacity: 67000 },
  { id: 'far', slug: 'as-far', name: 'AS FAR', shortName: 'AS FAR', abbreviation: 'FAR', country: 'Morocco', countryFlag: '🇲🇦', founded: 1958, stadium: 'Complexe Sportif Mohammed V', stadiumCapacity: 45000 },
  { id: 'rsb', slug: 'rs-berkane', name: 'RS Berkane', shortName: 'RS Berkane', abbreviation: 'RSB', country: 'Morocco', countryFlag: '🇲🇦', founded: 1952, stadium: 'Stade Municipal de Berkane', stadiumCapacity: 12000 },
  { id: 'bay', slug: 'bayern-munich', name: 'Bayern Munich', shortName: 'Bayern', abbreviation: 'BAY', country: 'Germany', countryFlag: '🇩🇪', founded: 1900, stadium: 'Allianz Arena', stadiumCapacity: 75024, manager: 'Vincent Kompany' },
  { id: 'psg', slug: 'paris-saint-germain', name: 'Paris Saint-Germain', shortName: 'PSG', abbreviation: 'PSG', country: 'France', countryFlag: '🇫🇷', founded: 1970, stadium: 'Parc des Princes', stadiumCapacity: 47929 },
  { id: 'int', slug: 'inter-milan', name: 'Inter Milan', shortName: 'Inter', abbreviation: 'INT', country: 'Italy', countryFlag: '🇮🇹', founded: 1908, stadium: 'Giuseppe Meazza', stadiumCapacity: 75923 },
  { id: 'bvb', slug: 'borussia-dortmund', name: 'Borussia Dortmund', shortName: 'Dortmund', abbreviation: 'BVB', country: 'Germany', countryFlag: '🇩🇪', founded: 1909, stadium: 'Signal Iduna Park', stadiumCapacity: 81365 },
]

export const getTeamBySlug = (slug: string) => mockTeams.find(t => t.slug === slug)
export const getTeamById = (id: string) => mockTeams.find(t => t.id === id)
