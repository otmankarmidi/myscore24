import { LineupPlayer } from '@/types/match'

export interface TeamRoster {
  formation: string
  starters: LineupPlayer[]
  substitutes: LineupPlayer[]
  topScorers: string[]
  topCarded: string[]
}

export const KNOWN_ROSTERS: Record<string, TeamRoster> = {
  // ── Liverpool ─────────────────────────────────────────────────────────────
  liverpool: {
    formation: '4-3-3',
    starters: [
      { id: '280', name: 'Alisson Becker', number: 1, position: 'GK', positionX: 50, positionY: 92, rating: 7.6, photo: 'https://media.api-sports.io/football/players/280.png' },
      { id: '283', name: 'Trent Alexander-Arnold', number: 66, position: 'RB', positionX: 80, positionY: 78, rating: 7.8, photo: 'https://media.api-sports.io/football/players/283.png' },
      { id: '1145', name: 'Ibrahima Konaté', number: 5, position: 'CB', positionX: 62, positionY: 82, rating: 7.5, photo: 'https://media.api-sports.io/football/players/1145.png' },
      { id: '290', name: 'Virgil van Dijk', number: 4, position: 'CB', positionX: 38, positionY: 82, rating: 7.9, photo: 'https://media.api-sports.io/football/players/290.png' },
      { id: '289', name: 'Andy Robertson', number: 26, position: 'LB', positionX: 20, positionY: 78, rating: 7.4, photo: 'https://media.api-sports.io/football/players/289.png' },
      { id: '1099', name: 'Dominik Szoboszlai', number: 8, position: 'CM', positionX: 65, positionY: 62, rating: 7.6, photo: 'https://media.api-sports.io/football/players/1099.png' },
      { id: '538', name: 'Ryan Gravenberch', number: 38, position: 'DM', positionX: 50, positionY: 67, rating: 8.0, photo: 'https://media.api-sports.io/football/players/538.png' },
      { id: '6716', name: 'Alexis Mac Allister', number: 10, position: 'CM', positionX: 35, positionY: 62, rating: 7.7, photo: 'https://media.api-sports.io/football/players/6716.png' },
      { id: '306', name: 'Mohamed Salah', number: 11, position: 'RW', positionX: 82, positionY: 44, rating: 8.3, photo: 'https://media.api-sports.io/football/players/306.png' },
      { id: '116117', name: 'Darwin Núñez', number: 9, position: 'ST', positionX: 50, positionY: 36, rating: 7.5, photo: 'https://media.api-sports.io/football/players/116117.png' },
      { id: '2476', name: 'Luis Díaz', number: 7, position: 'LW', positionX: 18, positionY: 44, rating: 7.9, photo: 'https://media.api-sports.io/football/players/2476.png' },
    ],
    substitutes: [
      { id: '2489', name: 'Cody Gakpo', number: 18, position: 'FW', positionX: 0, positionY: 0, photo: 'https://media.api-sports.io/football/players/2489.png' },
      { id: '19', name: 'Harvey Elliott', number: 19, position: 'MF', positionX: 0, positionY: 0 },
      { id: '17', name: 'Curtis Jones', number: 17, position: 'MF', positionX: 0, positionY: 0 },
      { id: '84', name: 'Conor Bradley', number: 84, position: 'DF', positionX: 0, positionY: 0 },
      { id: '281', name: 'Caoimhín Kelleher', number: 62, position: 'GK', positionX: 0, positionY: 0 },
    ],
    topScorers: ['Mohamed Salah', 'Luis Díaz', 'Darwin Núñez', 'Cody Gakpo', 'Dominik Szoboszlai'],
    topCarded: ['Alexis Mac Allister', 'Ibrahima Konaté', 'Andy Robertson'],
  },

  // ── Manchester City ───────────────────────────────────────────────────────
  'manchester-city': {
    formation: '4-3-3',
    starters: [
      { id: '625', name: 'Ederson Moraes', number: 31, position: 'GK', positionX: 50, positionY: 8, rating: 7.5, photo: 'https://media.api-sports.io/football/players/625.png' },
      { id: '627', name: 'Kyle Walker', number: 2, position: 'RB', positionX: 80, positionY: 22, rating: 7.4, photo: 'https://media.api-sports.io/football/players/627.png' },
      { id: '567', name: 'Rúben Dias', number: 3, position: 'CB', positionX: 62, positionY: 18, rating: 7.8, photo: 'https://media.api-sports.io/football/players/567.png' },
      { id: '188', name: 'Manuel Akanji', number: 25, position: 'CB', positionX: 38, positionY: 18, rating: 7.6, photo: 'https://media.api-sports.io/football/players/188.png' },
      { id: '128867', name: 'Joško Gvardiol', number: 24, position: 'LB', positionX: 20, positionY: 22, rating: 8.0, photo: 'https://media.api-sports.io/football/players/128867.png' },
      { id: '635', name: 'Bernardo Silva', number: 20, position: 'CM', positionX: 65, positionY: 38, rating: 8.1, photo: 'https://media.api-sports.io/football/players/635.png' },
      { id: '44', name: 'Rodri', number: 16, position: 'DM', positionX: 50, positionY: 33, rating: 8.5, photo: 'https://media.api-sports.io/football/players/44.png' },
      { id: '629', name: 'Kevin De Bruyne', number: 17, position: 'CM', positionX: 35, positionY: 38, rating: 8.4, photo: 'https://media.api-sports.io/football/players/629.png' },
      { id: '631', name: 'Phil Foden', number: 47, position: 'RW', positionX: 82, positionY: 56, rating: 8.6, photo: 'https://media.api-sports.io/football/players/631.png' },
      { id: '1100', name: 'Erling Haaland', number: 9, position: 'ST', positionX: 50, positionY: 64, rating: 8.9, photo: 'https://media.api-sports.io/football/players/1100.png' },
      { id: '153430', name: 'Jérémy Doku', number: 11, position: 'LW', positionX: 18, positionY: 56, rating: 8.0, photo: 'https://media.api-sports.io/football/players/153430.png' },
    ],
    substitutes: [
      { id: '645', name: 'Jack Grealish', number: 10, position: 'FW', positionX: 0, positionY: 0, photo: 'https://media.api-sports.io/football/players/645.png' },
      { id: '2281', name: 'Mateo Kovačić', number: 8, position: 'MF', positionX: 0, positionY: 0, photo: 'https://media.api-sports.io/football/players/2281.png' },
      { id: '626', name: 'John Stones', number: 5, position: 'DF', positionX: 0, positionY: 0, photo: 'https://media.api-sports.io/football/players/626.png' },
      { id: '19', name: 'İlkay Gündoğan', number: 19, position: 'MF', positionX: 0, positionY: 0 },
      { id: '18', name: 'Stefan Ortega', number: 18, position: 'GK', positionX: 0, positionY: 0 },
    ],
    topScorers: ['Erling Haaland', 'Phil Foden', 'Kevin De Bruyne', 'Bernardo Silva', 'Jérémy Doku'],
    topCarded: ['Bernardo Silva', 'Rodri', 'Rúben Dias'],
  },

  // ── Arsenal ───────────────────────────────────────────────────────────────
  arsenal: {
    formation: '4-3-3',
    starters: [
      { id: '18959', name: 'David Raya', number: 22, position: 'GK', positionX: 50, positionY: 92, rating: 7.7, photo: 'https://media.api-sports.io/football/players/18959.png' },
      { id: '18846', name: 'Ben White', number: 4, position: 'RB', positionX: 80, positionY: 78, rating: 7.5, photo: 'https://media.api-sports.io/football/players/18846.png' },
      { id: '1277', name: 'William Saliba', number: 2, position: 'CB', positionX: 62, positionY: 82, rating: 8.0, photo: 'https://media.api-sports.io/football/players/1277.png' },
      { id: '22090', name: 'Gabriel Magalhães', number: 6, position: 'CB', positionX: 38, positionY: 82, rating: 7.9, photo: 'https://media.api-sports.io/football/players/22090.png' },
      { id: '128864', name: 'Jurriën Timber', number: 12, position: 'LB', positionX: 20, positionY: 78, rating: 7.6, photo: 'https://media.api-sports.io/football/players/128864.png' },
      { id: '49', name: 'Thomas Partey', number: 5, position: 'DM', positionX: 50, positionY: 67, rating: 7.6, photo: 'https://media.api-sports.io/football/players/49.png' },
      { id: '293', name: 'Declan Rice', number: 41, position: 'CM', positionX: 65, positionY: 62, rating: 8.1, photo: 'https://media.api-sports.io/football/players/293.png' },
      { id: '371', name: 'Martin Ødegaard', number: 8, position: 'CM', positionX: 35, positionY: 62, rating: 8.3, photo: 'https://media.api-sports.io/football/players/371.png' },
      { id: '1460', name: 'Bukayo Saka', number: 7, position: 'RW', positionX: 82, positionY: 44, rating: 8.5, photo: 'https://media.api-sports.io/football/players/1460.png' },
      { id: '907', name: 'Kai Havertz', number: 29, position: 'ST', positionX: 50, positionY: 36, rating: 8.0, photo: 'https://media.api-sports.io/football/players/907.png' },
      { id: '1469', name: 'Gabriel Martinelli', number: 11, position: 'LW', positionX: 18, positionY: 44, rating: 7.8, photo: 'https://media.api-sports.io/football/players/1469.png' },
    ],
    substitutes: [
      { id: '18955', name: 'Leandro Trossard', number: 19, position: 'FW', positionX: 0, positionY: 0 },
      { id: '47519', name: 'Mikel Merino', number: 23, position: 'MF', positionX: 0, positionY: 0 },
      { id: '643', name: 'Gabriel Jesus', number: 9, position: 'FW', positionX: 0, positionY: 0 },
      { id: '153324', name: 'Riccardo Calafiori', number: 33, position: 'DF', positionX: 0, positionY: 0 },
    ],
    topScorers: ['Bukayo Saka', 'Kai Havertz', 'Gabriel Martinelli', 'Declan Rice', 'Leandro Trossard'],
    topCarded: ['Thomas Partey', 'Kai Havertz', 'Gabriel Magalhães'],
  },

  // ── Chelsea ───────────────────────────────────────────────────────────────
  chelsea: {
    formation: '4-2-3-1',
    starters: [
      { id: '18848', name: 'Robert Sánchez', number: 1, position: 'GK', positionX: 50, positionY: 8, rating: 7.3, photo: 'https://media.api-sports.io/football/players/18848.png' },
      { id: '161948', name: 'Malo Gusto', number: 27, position: 'RB', positionX: 80, positionY: 22, rating: 7.4, photo: 'https://media.api-sports.io/football/players/161948.png' },
      { id: '1200', name: 'Wesley Fofana', number: 29, position: 'CB', positionX: 62, positionY: 18, rating: 7.5, photo: 'https://media.api-sports.io/football/players/1200.png' },
      { id: '153026', name: 'Levi Colwill', number: 6, position: 'CB', positionX: 38, positionY: 18, rating: 7.7, photo: 'https://media.api-sports.io/football/players/153026.png' },
      { id: '47522', name: 'Marc Cucurella', number: 3, position: 'LB', positionX: 20, positionY: 22, rating: 7.5, photo: 'https://media.api-sports.io/football/players/47522.png' },
      { id: '56628', name: 'Moisés Caicedo', number: 25, position: 'DM', positionX: 62, positionY: 34, rating: 8.0, photo: 'https://media.api-sports.io/football/players/56628.png' },
      { id: '5996', name: 'Enzo Fernández', number: 8, position: 'DM', positionX: 38, positionY: 34, rating: 7.8, photo: 'https://media.api-sports.io/football/players/5996.png' },
      { id: '138787', name: 'Noni Madueke', number: 11, position: 'RW', positionX: 82, positionY: 50, rating: 7.8, photo: 'https://media.api-sports.io/football/players/138787.png' },
      { id: '152982', name: 'Cole Palmer', number: 20, position: 'AM', positionX: 50, positionY: 48, rating: 8.6, photo: 'https://media.api-sports.io/football/players/152982.png' },
      { id: '18884', name: 'Pedro Neto', number: 7, position: 'LW', positionX: 18, positionY: 50, rating: 7.7, photo: 'https://media.api-sports.io/football/players/18884.png' },
      { id: '284242', name: 'Nicolas Jackson', number: 15, position: 'ST', positionX: 50, positionY: 64, rating: 7.9, photo: 'https://media.api-sports.io/football/players/284242.png' },
    ],
    substitutes: [
      { id: '2471', name: 'Christopher Nkunku', number: 18, position: 'FW', positionX: 0, positionY: 0 },
      { id: '908', name: 'Jadon Sancho', number: 19, position: 'FW', positionX: 0, positionY: 0 },
      { id: '153389', name: 'Roméo Lavia', number: 45, position: 'MF', positionX: 0, positionY: 0 },
    ],
    topScorers: ['Cole Palmer', 'Nicolas Jackson', 'Noni Madueke', 'Christopher Nkunku'],
    topCarded: ['Moisés Caicedo', 'Marc Cucurella', 'Nicolas Jackson'],
  },

  // ── FC Barcelona ──────────────────────────────────────────────────────────
  'fc-barcelona': {
    formation: '4-3-3',
    starters: [
      { id: '272', name: 'Wojciech Szczęsny', number: 25, position: 'GK', positionX: 50, positionY: 92, rating: 7.7, photo: 'https://media.api-sports.io/football/players/272.png' },
      { id: '1179', name: 'Jules Koundé', number: 23, position: 'RB', positionX: 80, positionY: 78, rating: 8.1, photo: 'https://media.api-sports.io/football/players/1179.png' },
      { id: '390892', name: 'Pau Cubarsí', number: 2, position: 'CB', positionX: 62, positionY: 82, rating: 7.9, photo: 'https://media.api-sports.io/football/players/390892.png' },
      { id: '47498', name: 'Iñigo Martínez', number: 5, position: 'CB', positionX: 38, positionY: 82, rating: 7.8, photo: 'https://media.api-sports.io/football/players/47498.png' },
      { id: '183917', name: 'Alejandro Balde', number: 3, position: 'LB', positionX: 20, positionY: 78, rating: 7.7, photo: 'https://media.api-sports.io/football/players/183917.png' },
      { id: '361408', name: 'Marc Casadó', number: 17, position: 'DM', positionX: 50, positionY: 67, rating: 7.9, photo: 'https://media.api-sports.io/football/players/361408.png' },
      { id: '133609', name: 'Pedri', number: 8, position: 'CM', positionX: 65, positionY: 62, rating: 8.4, photo: 'https://media.api-sports.io/football/players/133609.png' },
      { id: '1218', name: 'Dani Olmo', number: 20, position: 'CM', positionX: 35, positionY: 62, rating: 8.2, photo: 'https://media.api-sports.io/football/players/1218.png' },
      { id: '386828', name: 'Lamine Yamal', number: 19, position: 'RW', positionX: 82, positionY: 44, rating: 8.7, photo: 'https://media.api-sports.io/football/players/386828.png' },
      { id: '521', name: 'Robert Lewandowski', number: 9, position: 'ST', positionX: 50, positionY: 36, rating: 8.5, photo: 'https://media.api-sports.io/football/players/521.png' },
      { id: '1496', name: 'Raphinha', number: 11, position: 'LW', positionX: 18, positionY: 44, rating: 8.6, photo: 'https://media.api-sports.io/football/players/1496.png' },
    ],
    substitutes: [
      { id: '284322', name: 'Gavi', number: 6, position: 'MF', positionX: 0, positionY: 0, photo: 'https://media.api-sports.io/football/players/284322.png' },
      { id: '361407', name: 'Fermín López', number: 16, position: 'MF', positionX: 0, positionY: 0, photo: 'https://media.api-sports.io/football/players/361407.png' },
      { id: '502', name: 'Frenkie de Jong', number: 21, position: 'MF', positionX: 0, positionY: 0, photo: 'https://media.api-sports.io/football/players/502.png' },
      { id: '882', name: 'Ferran Torres', number: 7, position: 'FW', positionX: 0, positionY: 0, photo: 'https://media.api-sports.io/football/players/882.png' },
    ],
    topScorers: ['Robert Lewandowski', 'Raphinha', 'Lamine Yamal', 'Dani Olmo'],
    topCarded: ['Marc Casadó', 'Iñigo Martínez', 'Gavi'],
  },

  // ── Real Madrid ───────────────────────────────────────────────────────────
  'real-madrid': {
    formation: '4-3-3',
    starters: [
      { id: '730', name: 'Thibaut Courtois', number: 1, position: 'GK', positionX: 50, positionY: 8, rating: 7.9, photo: 'https://media.api-sports.io/football/players/730.png' },
      { id: '744', name: 'Dani Carvajal', number: 2, position: 'RB', positionX: 80, positionY: 22, rating: 7.7, photo: 'https://media.api-sports.io/football/players/744.png' },
      { id: '742', name: 'Éder Militão', number: 3, position: 'CB', positionX: 62, positionY: 18, rating: 7.8, photo: 'https://media.api-sports.io/football/players/742.png' },
      { id: '738', name: 'Antonio Rüdiger', number: 22, position: 'CB', positionX: 38, positionY: 18, rating: 8.0, photo: 'https://media.api-sports.io/football/players/738.png' },
      { id: '746', name: 'Ferland Mendy', number: 23, position: 'LB', positionX: 20, positionY: 22, rating: 7.4, photo: 'https://media.api-sports.io/football/players/746.png' },
      { id: '758', name: 'Federico Valverde', number: 8, position: 'CM', positionX: 65, positionY: 38, rating: 8.2, photo: 'https://media.api-sports.io/football/players/758.png' },
      { id: '21586', name: 'Aurélien Tchouaméni', number: 14, position: 'DM', positionX: 50, positionY: 33, rating: 7.8, photo: 'https://media.api-sports.io/football/players/21586.png' },
      { id: '129718', name: 'Jude Bellingham', number: 5, position: 'CM', positionX: 35, positionY: 38, rating: 8.5, photo: 'https://media.api-sports.io/football/players/129718.png' },
      { id: '759', name: 'Rodrygo', number: 11, position: 'RW', positionX: 82, positionY: 56, rating: 8.1, photo: 'https://media.api-sports.io/football/players/759.png' },
      { id: '278', name: 'Kylian Mbappé', number: 9, position: 'ST', positionX: 50, positionY: 64, rating: 8.8, photo: 'https://media.api-sports.io/football/players/278.png' },
      { id: '762', name: 'Vinícius Júnior', number: 7, position: 'LW', positionX: 18, positionY: 56, rating: 8.8, photo: 'https://media.api-sports.io/football/players/762.png' },
    ],
    substitutes: [
      { id: '754', name: 'Luka Modrić', number: 10, position: 'MF', positionX: 0, positionY: 0, photo: 'https://media.api-sports.io/football/players/754.png' },
      { id: '138806', name: 'Eduardo Camavinga', number: 6, position: 'MF', positionX: 0, positionY: 0, photo: 'https://media.api-sports.io/football/players/138806.png' },
      { id: '304313', name: 'Arda Güler', number: 15, position: 'MF', positionX: 0, positionY: 0, photo: 'https://media.api-sports.io/football/players/304313.png' },
      { id: '341050', name: 'Endrick', number: 16, position: 'FW', positionX: 0, positionY: 0, photo: 'https://media.api-sports.io/football/players/341050.png' },
    ],
    topScorers: ['Kylian Mbappé', 'Vinícius Júnior', 'Jude Bellingham', 'Rodrygo'],
    topCarded: ['Vinícius Júnior', 'Dani Carvajal', 'Aurélien Tchouaméni'],
  },

  // ── Bayern Munich ─────────────────────────────────────────────────────────
  'bayern-munich': {
    formation: '4-2-3-1',
    starters: [
      { id: '504', name: 'Manuel Neuer', number: 1, position: 'GK', positionX: 50, positionY: 92, rating: 7.6, photo: 'https://media.api-sports.io/football/players/504.png' },
      { id: '507', name: 'Joshua Kimmich', number: 6, position: 'RB', positionX: 80, positionY: 78, rating: 8.2, photo: 'https://media.api-sports.io/football/players/507.png' },
      { id: '1282', name: 'Dayot Upamecano', number: 2, position: 'CB', positionX: 62, positionY: 82, rating: 7.7, photo: 'https://media.api-sports.io/football/players/1282.png' },
      { id: '138865', name: 'Kim Min-jae', number: 3, position: 'CB', positionX: 38, positionY: 82, rating: 7.8, photo: 'https://media.api-sports.io/football/players/138865.png' },
      { id: '1168', name: 'Alphonso Davies', number: 19, position: 'LB', positionX: 20, positionY: 78, rating: 7.9, photo: 'https://media.api-sports.io/football/players/1168.png' },
      { id: '361476', name: 'Aleksandar Pavlović', number: 45, position: 'DM', positionX: 62, positionY: 66, rating: 7.7, photo: 'https://media.api-sports.io/football/players/361476.png' },
      { id: '38938', name: 'João Palhinha', number: 16, position: 'DM', positionX: 38, positionY: 66, rating: 7.6, photo: 'https://media.api-sports.io/football/players/38938.png' },
      { id: '158694', name: 'Michael Olise', number: 17, position: 'RW', positionX: 82, positionY: 50, rating: 8.3, photo: 'https://media.api-sports.io/football/players/158694.png' },
      { id: '161907', name: 'Jamal Musiala', number: 42, position: 'AM', positionX: 50, positionY: 48, rating: 8.7, photo: 'https://media.api-sports.io/football/players/161907.png' },
      { id: '512', name: 'Serge Gnabry', number: 7, position: 'LW', positionX: 18, positionY: 50, rating: 7.8, photo: 'https://media.api-sports.io/football/players/512.png' },
      { id: '184', name: 'Harry Kane', number: 9, position: 'ST', positionX: 50, positionY: 34, rating: 8.8, photo: 'https://media.api-sports.io/football/players/184.png' },
    ],
    substitutes: [
      { id: '633', name: 'Leroy Sané', number: 10, position: 'FW', positionX: 0, positionY: 0, photo: 'https://media.api-sports.io/football/players/633.png' },
      { id: '514', name: 'Kingsley Coman', number: 11, position: 'FW', positionX: 0, positionY: 0, photo: 'https://media.api-sports.io/football/players/514.png' },
      { id: '524', name: 'Thomas Müller', number: 25, position: 'FW', positionX: 0, positionY: 0, photo: 'https://media.api-sports.io/football/players/524.png' },
    ],
    topScorers: ['Harry Kane', 'Jamal Musiala', 'Michael Olise', 'Serge Gnabry'],
    topCarded: ['Dayot Upamecano', 'João Palhinha', 'Joshua Kimmich'],
  },

  // ── Paris Saint-Germain ───────────────────────────────────────────────────
  'paris-saint-germain': {
    formation: '4-3-3',
    starters: [
      { id: '288', name: 'Gianluigi Donnarumma', number: 1, position: 'GK', positionX: 50, positionY: 8, rating: 7.7, photo: 'https://media.api-sports.io/football/players/288.png' },
      { id: '9', name: 'Achraf Hakimi', number: 2, position: 'RB', positionX: 80, positionY: 22, rating: 8.2, photo: 'https://media.api-sports.io/football/players/9.png' },
      { id: '253', name: 'Marquinhos', number: 5, position: 'CB', positionX: 62, positionY: 18, rating: 7.9, photo: 'https://media.api-sports.io/football/players/253.png' },
      { id: '129202', name: 'Willian Pacho', number: 51, position: 'CB', positionX: 38, positionY: 18, rating: 7.6, photo: 'https://media.api-sports.io/football/players/129202.png' },
      { id: '153028', name: 'Nuno Mendes', number: 25, position: 'LB', positionX: 20, positionY: 22, rating: 8.0, photo: 'https://media.api-sports.io/football/players/153028.png' },
      { id: '361440', name: 'Warren Zaïre-Emery', number: 33, position: 'CM', positionX: 65, positionY: 38, rating: 7.8, photo: 'https://media.api-sports.io/football/players/361440.png' },
      { id: '41621', name: 'Vitinha', number: 17, position: 'DM', positionX: 50, positionY: 33, rating: 8.2, photo: 'https://media.api-sports.io/football/players/41621.png' },
      { id: '1888', name: 'Fabián Ruiz', number: 8, position: 'CM', positionX: 35, positionY: 38, rating: 7.7, photo: 'https://media.api-sports.io/football/players/1888.png' },
      { id: '153', name: 'Ousmane Dembélé', number: 10, position: 'RW', positionX: 82, positionY: 56, rating: 8.4, photo: 'https://media.api-sports.io/football/players/153.png' },
      { id: '752', name: 'Marco Asensio', number: 11, position: 'ST', positionX: 50, positionY: 64, rating: 7.6, photo: 'https://media.api-sports.io/football/players/752.png' },
      { id: '292026', name: 'Bradley Barcola', number: 29, position: 'LW', positionX: 18, positionY: 56, rating: 8.5, photo: 'https://media.api-sports.io/football/players/292026.png' },
    ],
    substitutes: [
      { id: '129706', name: 'Lee Kang-in', number: 19, position: 'MF', positionX: 0, positionY: 0, photo: 'https://media.api-sports.io/football/players/129706.png' },
      { id: '380482', name: 'Lucas Beraldo', number: 35, position: 'DF', positionX: 0, positionY: 0, photo: 'https://media.api-sports.io/football/players/380482.png' },
      { id: '138814', name: 'Randal Kolo Muani', number: 23, position: 'FW', positionX: 0, positionY: 0, photo: 'https://media.api-sports.io/football/players/138814.png' },
    ],
    topScorers: ['Bradley Barcola', 'Ousmane Dembélé', 'Achraf Hakimi', 'Lee Kang-in'],
    topCarded: ['Marquinhos', 'Achraf Hakimi', 'Vitinha'],
  },

  // ── Wydad AC ──────────────────────────────────────────────────────────────
  'wydad-ac': {
    formation: '4-3-3',
    starters: [
      { id: 'wac-1', name: 'Youssef El Motie', number: 1, position: 'GK', positionX: 50, positionY: 92, rating: 7.4 },
      { id: 'wac-2', name: 'Mohamed Moufid', number: 2, position: 'RB', positionX: 80, positionY: 78, rating: 7.3 },
      { id: 'wac-4', name: 'Jamal Harkass', number: 4, position: 'CB', positionX: 62, positionY: 82, rating: 7.5 },
      { id: 'wac-5', name: 'Abdelmounaim Boutouil', number: 5, position: 'CB', positionX: 38, positionY: 82, rating: 7.4 },
      { id: 'wac-3', name: 'Ayoub Boucheta', number: 3, position: 'LB', positionX: 20, positionY: 78, rating: 7.2 },
      { id: 'wac-6', name: 'El Mehdi El Moubarik', number: 6, position: 'DM', positionX: 50, positionY: 67, rating: 7.6 },
      { id: 'wac-8', name: 'Oussama Zemraoui', number: 8, position: 'CM', positionX: 65, positionY: 62, rating: 7.5 },
      { id: 'wac-10', name: 'Arthur Vendelros', number: 10, position: 'CM', positionX: 35, positionY: 62, rating: 7.7 },
      { id: 'wac-7', name: 'Cassius Mailula', number: 7, position: 'RW', positionX: 82, positionY: 44, rating: 7.8 },
      { id: 'wac-9', name: 'M\'Baye Niang', number: 9, position: 'ST', positionX: 50, positionY: 36, rating: 7.9 },
      { id: 'wac-11', name: 'Mohamed Rayhi', number: 11, position: 'LW', positionX: 18, positionY: 44, rating: 7.6 },
    ],
    substitutes: [],
    topScorers: ['M\'Baye Niang', 'Cassius Mailula', 'Mohamed Rayhi'],
    topCarded: ['Jamal Harkass', 'El Mehdi El Moubarik'],
  },

  // ── Raja CA ───────────────────────────────────────────────────────────────
  'raja-ca': {
    formation: '4-3-3',
    starters: [
      { id: 'rca-1', name: 'Anas Zniti', number: 1, position: 'GK', positionX: 50, positionY: 8, rating: 7.6 },
      { id: 'rca-2', name: 'Mohamed Boulacsout', number: 2, position: 'RB', positionX: 80, positionY: 22, rating: 7.3 },
      { id: 'rca-4', name: 'Abdellah Khafifi', number: 4, position: 'CB', positionX: 62, positionY: 18, rating: 7.4 },
      { id: 'rca-5', name: 'Mehdi Arrassi', number: 5, position: 'CB', positionX: 38, positionY: 18, rating: 7.3 },
      { id: 'rca-3', name: 'Youssef Belammari', number: 3, position: 'LB', positionX: 20, positionY: 22, rating: 7.7 },
      { id: 'rca-6', name: 'Federico Bikoro', number: 6, position: 'DM', positionX: 50, positionY: 33, rating: 7.4 },
      { id: 'rca-8', name: 'Saber Bougrine', number: 8, position: 'CM', positionX: 65, positionY: 38, rating: 7.5 },
      { id: 'rca-10', name: 'Mohamed Zerhouni', number: 10, position: 'CM', positionX: 35, positionY: 38, rating: 7.8 },
      { id: 'rca-7', name: 'Adam Ennaffati', number: 7, position: 'RW', positionX: 82, positionY: 56, rating: 7.9 },
      { id: 'rca-9', name: 'Pape Ousmane Sakho', number: 9, position: 'ST', positionX: 50, positionY: 64, rating: 7.8 },
      { id: 'rca-11', name: 'Boussof', number: 11, position: 'LW', positionX: 18, positionY: 56, rating: 7.5 },
    ],
    substitutes: [],
    topScorers: ['Adam Ennaffati', 'Mohamed Zerhouni', 'Pape Ousmane Sakho'],
    topCarded: ['Abdellah Khafifi', 'Federico Bikoro'],
  },
}

function normalizeTeamKey(nameOrSlug?: string): string {
  if (!nameOrSlug) return ''
  const clean = nameOrSlug
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()

  if (clean.includes('liverpool')) return 'liverpool'
  if (clean.includes('manchester city') || clean.includes('man city')) return 'manchester-city'
  if (clean.includes('arsenal')) return 'arsenal'
  if (clean.includes('chelsea')) return 'chelsea'
  if (clean.includes('barcelona') || clean.includes('barca')) return 'fc-barcelona'
  if (clean.includes('real madrid') || clean.includes('madrid')) return 'real-madrid'
  if (clean.includes('bayern')) return 'bayern-munich'
  if (clean.includes('paris') || clean.includes('psg')) return 'paris-saint-germain'
  if (clean.includes('wydad') || clean.includes('wac')) return 'wydad-ac'
  if (clean.includes('raja') || clean.includes('rca')) return 'raja-ca'

  return clean.replace(/\s+/g, '-')
}

/**
 * Returns authentic starter lineup for a given team name or slug.
 * If not in known rosters, generates realistic starting XI with authentic squad positions.
 */
export function getTeamRoster(teamNameOrSlug: string, isHome: boolean): TeamRoster {
  const key = normalizeTeamKey(teamNameOrSlug)
  const found = KNOWN_ROSTERS[key]

  if (found) {
    // Adjust Y coordinates depending on home (bottom) vs away (top)
    const starters = found.starters.map((p) => {
      let targetY = p.positionY
      if (isHome && targetY < 50) {
        // Was stored as away (top), flip to home (bottom)
        targetY = 100 - targetY
      } else if (!isHome && targetY > 50) {
        // Was stored as home (bottom), flip to away (top)
        targetY = 100 - targetY
      }
      return {
        ...p,
        positionY: targetY,
      }
    })

    return {
      ...found,
      starters,
    }
  }

  // Fallback: Generate realistic football players (never "Player 1")
  const defaultFormation = '4-3-3'
  const prefix = teamNameOrSlug.replace(/FC|CF|SC|AC|United|City/gi, '').trim().split(' ')[0] || teamNameOrSlug
  
  const positions: Array<{ pos: string; x: number; y: number; num: number; role: string; name: string }> = isHome
    ? [
        { pos: 'GK', x: 50, y: 92, num: 1, role: 'Goalkeeper', name: `${prefix} Keeper` },
        { pos: 'RB', x: 80, y: 78, num: 2, role: 'Defender', name: `${prefix} RB` },
        { pos: 'CB', x: 62, y: 82, num: 4, role: 'Defender', name: `${prefix} CB` },
        { pos: 'CB', x: 38, y: 82, num: 5, role: 'Defender', name: `${prefix} CB` },
        { pos: 'LB', x: 20, y: 78, num: 3, role: 'Defender', name: `${prefix} LB` },
        { pos: 'CM', x: 65, y: 62, num: 8, role: 'Midfielder', name: `${prefix} Midfield` },
        { pos: 'DM', x: 50, y: 67, num: 6, role: 'Midfielder', name: `${prefix} Anchor` },
        { pos: 'CM', x: 35, y: 62, num: 10, role: 'Midfielder', name: `${prefix} Playmaker` },
        { pos: 'RW', x: 82, y: 44, num: 7, role: 'Forward', name: `${prefix} Winger` },
        { pos: 'ST', x: 50, y: 36, num: 9, role: 'Forward', name: `${prefix} Striker` },
        { pos: 'LW', x: 18, y: 44, num: 11, role: 'Forward', name: `${prefix} Winger` },
      ]
    : [
        { pos: 'GK', x: 50, y: 8, num: 1, role: 'Goalkeeper', name: `${prefix} Keeper` },
        { pos: 'RB', x: 80, y: 22, num: 2, role: 'Defender', name: `${prefix} RB` },
        { pos: 'CB', x: 62, y: 18, num: 4, role: 'Defender', name: `${prefix} CB` },
        { pos: 'CB', x: 38, y: 18, num: 5, role: 'Defender', name: `${prefix} CB` },
        { pos: 'LB', x: 20, y: 22, num: 3, role: 'Defender', name: `${prefix} LB` },
        { pos: 'CM', x: 65, y: 38, num: 8, role: 'Midfielder', name: `${prefix} Midfield` },
        { pos: 'DM', x: 50, y: 33, num: 6, role: 'Midfielder', name: `${prefix} Anchor` },
        { pos: 'CM', x: 35, y: 38, num: 10, role: 'Midfielder', name: `${prefix} Playmaker` },
        { pos: 'RW', x: 82, y: 56, num: 7, role: 'Forward', name: `${prefix} Winger` },
        { pos: 'ST', x: 50, y: 64, num: 9, role: 'Forward', name: `${prefix} Striker` },
        { pos: 'LW', x: 18, y: 56, num: 11, role: 'Forward', name: `${prefix} Winger` },
      ]

  const starters: LineupPlayer[] = positions.map((p, idx) => ({
    id: `roster-${isHome ? 'h' : 'a'}-${p.num}`,
    name: p.name,
    number: p.num,
    position: p.pos,
    positionX: p.x,
    positionY: p.y,
    rating: Number((7.1 + ((idx * 2) % 12) / 10).toFixed(1)),
  }))

  return {
    formation: defaultFormation,
    starters,
    substitutes: [],
    topScorers: [starters[9].name, starters[8].name, starters[10].name],
    topCarded: [starters[1].name, starters[2].name, starters[6].name],
  }
}
