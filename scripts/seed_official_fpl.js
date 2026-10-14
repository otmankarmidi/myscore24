const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

const PL_COMP_ID = 'cmuddjekz0001ua5kmnfa44u6';
const SEASON_YEAR = 2026;

// Hash password with Node crypto scrypt
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

// 20 Official Premier League Teams & Providers
// 42: Arsenal, 66: Aston Villa, 35: Bournemouth, 55: Brentford, 51: Brighton,
// 49: Chelsea, 52: Crystal Palace, 45: Everton, 36: Fulham, 57: Ipswich,
// 46: Leicester, 40: Liverpool, 50: Man City, 33: Man Utd, 34: Newcastle,
// 65: Nottm Forest, 41: Southampton, 47: Spurs, 48: West Ham, 39: Wolves

const OFFICIAL_PL_PLAYERS = {
  // Arsenal (42)
  42: [
    { name: 'David Raya', webName: 'Raya', pos: 'GKP', price: 5.6, pts: 38, photo: 'https://media.api-sports.io/football/players/18844.png' },
    { name: 'Neto', webName: 'Neto', pos: 'GKP', price: 4.3, pts: 0, photo: 'https://media.api-sports.io/football/players/1455.png' },
    { name: 'William Saliba', webName: 'Saliba', pos: 'DEF', price: 6.0, pts: 34, photo: 'https://media.api-sports.io/football/players/22090.png' },
    { name: 'Gabriel Magalhães', webName: 'Gabriel', pos: 'DEF', price: 6.2, pts: 42, photo: 'https://media.api-sports.io/football/players/22221.png' },
    { name: 'Ben White', webName: 'White', pos: 'DEF', price: 6.3, pts: 22, photo: 'https://media.api-sports.io/football/players/18959.png' },
    { name: 'Jurriën Timber', webName: 'Timber', pos: 'DEF', price: 5.5, pts: 28, photo: 'https://media.api-sports.io/football/players/8500.png' },
    { name: 'Riccardo Calafiori', webName: 'Calafiori', pos: 'DEF', price: 5.8, pts: 25, photo: 'https://media.api-sports.io/football/players/138814.png' },
    { name: 'Bukayo Saka', webName: 'Saka', pos: 'MID', price: 10.1, pts: 58, photo: 'https://media.api-sports.io/football/players/1467.png' },
    { name: 'Martin Ødegaard', webName: 'Ødegaard', pos: 'MID', price: 8.2, pts: 26, photo: 'https://media.api-sports.io/football/players/378.png' },
    { name: 'Declan Rice', webName: 'Rice', pos: 'MID', price: 6.3, pts: 29, photo: 'https://media.api-sports.io/football/players/293.png' },
    { name: 'Gabriel Martinelli', webName: 'Martinelli', pos: 'MID', price: 6.9, pts: 35, photo: 'https://media.api-sports.io/football/players/2280.png' },
    { name: 'Leandro Trossard', webName: 'Trossard', pos: 'MID', price: 6.9, pts: 31, photo: 'https://media.api-sports.io/football/players/2288.png' },
    { name: 'Mikel Merino', webName: 'Merino', pos: 'MID', price: 6.0, pts: 14, photo: 'https://media.api-sports.io/football/players/1460.png' },
    { name: 'Kai Havertz', webName: 'Havertz', pos: 'FWD', price: 8.1, pts: 46, photo: 'https://media.api-sports.io/football/players/2274.png' },
    { name: 'Gabriel Jesus', webName: 'Jesus', pos: 'FWD', price: 6.8, pts: 12, photo: 'https://media.api-sports.io/football/players/645.png' }
  ],
  // Manchester City (50)
  50: [
    { name: 'Ederson Moraes', webName: 'Ederson', pos: 'GKP', price: 5.5, pts: 32, photo: 'https://media.api-sports.io/football/players/629.png' },
    { name: 'Stefan Ortega', webName: 'Ortega', pos: 'GKP', price: 4.4, pts: 4, photo: 'https://media.api-sports.io/football/players/25390.png' },
    { name: 'Joško Gvardiol', webName: 'Gvardiol', pos: 'DEF', price: 6.2, pts: 40, photo: 'https://media.api-sports.io/football/players/95.png' },
    { name: 'Rúben Dias', webName: 'Dias', pos: 'DEF', price: 5.5, pts: 28, photo: 'https://media.api-sports.io/football/players/567.png' },
    { name: 'Manuel Akanji', webName: 'Akanji', pos: 'DEF', price: 5.5, pts: 29, photo: 'https://media.api-sports.io/football/players/1161.png' },
    { name: 'John Stones', webName: 'Stones', pos: 'DEF', price: 5.4, pts: 24, photo: 'https://media.api-sports.io/football/players/626.png' },
    { name: 'Kyle Walker', webName: 'Walker', pos: 'DEF', price: 5.3, pts: 18, photo: 'https://media.api-sports.io/football/players/627.png' },
    { name: 'Erling Haaland', webName: 'Haaland', pos: 'FWD', price: 15.3, pts: 82, photo: 'https://media.api-sports.io/football/players/1100.png' },
    { name: 'Phil Foden', webName: 'Foden', pos: 'MID', price: 9.2, pts: 36, photo: 'https://media.api-sports.io/football/players/631.png' },
    { name: 'Kevin De Bruyne', webName: 'De Bruyne', pos: 'MID', price: 9.4, pts: 30, photo: 'https://media.api-sports.io/football/players/629.png' },
    { name: 'Bernardo Silva', webName: 'Bernardo', pos: 'MID', price: 6.5, pts: 33, photo: 'https://media.api-sports.io/football/players/635.png' },
    { name: 'Savinho', webName: 'Savinho', pos: 'MID', price: 6.5, pts: 34, photo: 'https://media.api-sports.io/football/players/162719.png' },
    { name: 'Jérémy Doku', webName: 'Doku', pos: 'MID', price: 6.4, pts: 28, photo: 'https://media.api-sports.io/football/players/138787.png' },
    { name: 'Mateo Kovačić', webName: 'Kovačić', pos: 'MID', price: 5.5, pts: 31, photo: 'https://media.api-sports.io/football/players/2290.png' },
    { name: 'Jack Grealish', webName: 'Grealish', pos: 'MID', price: 6.4, pts: 20, photo: 'https://media.api-sports.io/football/players/19187.png' }
  ],
  // Liverpool (40)
  40: [
    { name: 'Alisson Becker', webName: 'Alisson', pos: 'GKP', price: 5.5, pts: 35, photo: 'https://media.api-sports.io/football/players/280.png' },
    { name: 'Caoimhin Kelleher', webName: 'Kelleher', pos: 'GKP', price: 4.4, pts: 12, photo: 'https://media.api-sports.io/football/players/281.png' },
    { name: 'Trent Alexander-Arnold', webName: 'Alexander-Arnold', pos: 'DEF', price: 7.1, pts: 48, photo: 'https://media.api-sports.io/football/players/284.png' },
    { name: 'Virgil van Dijk', webName: 'Van Dijk', pos: 'DEF', price: 6.1, pts: 44, photo: 'https://media.api-sports.io/football/players/283.png' },
    { name: 'Ibrahima Konaté', webName: 'Konaté', pos: 'DEF', price: 5.3, pts: 36, photo: 'https://media.api-sports.io/football/players/1145.png' },
    { name: 'Andy Robertson', webName: 'Robertson', pos: 'DEF', price: 6.0, pts: 32, photo: 'https://media.api-sports.io/football/players/289.png' },
    { name: 'Mohamed Salah', webName: 'Salah', pos: 'MID', price: 12.8, pts: 76, photo: 'https://media.api-sports.io/football/players/306.png' },
    { name: 'Luis Díaz', webName: 'Díaz', pos: 'MID', price: 7.9, pts: 52, photo: 'https://media.api-sports.io/football/players/2489.png' },
    { name: 'Dominik Szoboszlai', webName: 'Szoboszlai', pos: 'MID', price: 6.5, pts: 32, photo: 'https://media.api-sports.io/football/players/1099.png' },
    { name: 'Alexis Mac Allister', webName: 'Mac Allister', pos: 'MID', price: 6.3, pts: 30, photo: 'https://media.api-sports.io/football/players/6716.png' },
    { name: 'Ryan Gravenberch', webName: 'Gravenberch', pos: 'MID', price: 5.5, pts: 36, photo: 'https://media.api-sports.io/football/players/8501.png' },
    { name: 'Diogo Jota', webName: 'Jota', pos: 'FWD', price: 7.4, pts: 35, photo: 'https://media.api-sports.io/football/players/2487.png' },
    { name: 'Darwin Núñez', webName: 'Núñez', pos: 'FWD', price: 7.1, pts: 28, photo: 'https://media.api-sports.io/football/players/6487.png' },
    { name: 'Cody Gakpo', webName: 'Gakpo', pos: 'FWD', price: 7.1, pts: 26, photo: 'https://media.api-sports.io/football/players/2488.png' }
  ],
  // Chelsea (49)
  49: [
    { name: 'Robert Sánchez', webName: 'Sánchez', pos: 'GKP', price: 4.7, pts: 33, photo: 'https://media.api-sports.io/football/players/18929.png' },
    { name: 'Filip Jørgensen', webName: 'Jørgensen', pos: 'GKP', price: 4.3, pts: 0, photo: 'https://media.api-sports.io/football/players/162817.png' },
    { name: 'Levi Colwill', webName: 'Colwill', pos: 'DEF', price: 4.6, pts: 29, photo: 'https://media.api-sports.io/football/players/152955.png' },
    { name: 'Marc Cucurella', webName: 'Cucurella', pos: 'DEF', price: 5.0, pts: 27, photo: 'https://media.api-sports.io/football/players/47519.png' },
    { name: 'Malo Gusto', webName: 'Gusto', pos: 'DEF', price: 4.9, pts: 22, photo: 'https://media.api-sports.io/football/players/162489.png' },
    { name: 'Reece James', webName: 'James', pos: 'DEF', price: 5.2, pts: 12, photo: 'https://media.api-sports.io/football/players/19545.png' },
    { name: 'Cole Palmer', webName: 'Palmer', pos: 'MID', price: 11.0, pts: 67, photo: 'https://media.api-sports.io/football/players/162804.png' },
    { name: 'Enzo Fernández', webName: 'Enzo', pos: 'MID', price: 4.9, pts: 26, photo: 'https://media.api-sports.io/football/players/6032.png' },
    { name: 'Moisés Caicedo', webName: 'Caicedo', pos: 'MID', price: 5.5, pts: 34, photo: 'https://media.api-sports.io/football/players/6100.png' },
    { name: 'Noni Madueke', webName: 'Madueke', pos: 'MID', price: 6.4, pts: 41, photo: 'https://media.api-sports.io/football/players/138806.png' },
    { name: 'Jadon Sancho', webName: 'Sancho', pos: 'MID', price: 6.3, pts: 25, photo: 'https://media.api-sports.io/football/players/1163.png' },
    { name: 'Pedro Neto', webName: 'Neto', pos: 'MID', price: 6.2, pts: 24, photo: 'https://media.api-sports.io/football/players/19717.png' },
    { name: 'Nicolas Jackson', webName: 'Jackson', pos: 'FWD', price: 8.0, pts: 54, photo: 'https://media.api-sports.io/football/players/163013.png' },
    { name: 'Christopher Nkunku', webName: 'Nkunku', pos: 'FWD', price: 6.1, pts: 22, photo: 'https://media.api-sports.io/football/players/2296.png' }
  ],
  // Arsenal & Aston Villa & others
  66: [
    { name: 'Emiliano Martínez', webName: 'Martínez', pos: 'GKP', price: 5.0, pts: 30, photo: 'https://media.api-sports.io/football/players/1458.png' },
    { name: 'Lucas Digne', webName: 'Digne', pos: 'DEF', price: 4.7, pts: 33, photo: 'https://media.api-sports.io/football/players/2412.png' },
    { name: 'Ezri Konsa', webName: 'Konsa', pos: 'DEF', price: 4.5, pts: 27, photo: 'https://media.api-sports.io/football/players/19184.png' },
    { name: 'Pau Torres', webName: 'Torres', pos: 'DEF', price: 4.5, pts: 25, photo: 'https://media.api-sports.io/football/players/47522.png' },
    { name: 'Morgan Rogers', webName: 'Rogers', pos: 'MID', price: 5.5, pts: 42, photo: 'https://media.api-sports.io/football/players/152988.png' },
    { name: 'Youri Tielemans', webName: 'Tielemans', pos: 'MID', price: 5.5, pts: 34, photo: 'https://media.api-sports.io/football/players/18786.png' },
    { name: 'Leon Bailey', webName: 'Bailey', pos: 'MID', price: 6.3, pts: 22, photo: 'https://media.api-sports.io/football/players/1148.png' },
    { name: 'Ollie Watkins', webName: 'Watkins', pos: 'FWD', price: 9.1, pts: 55, photo: 'https://media.api-sports.io/football/players/19349.png' },
    { name: 'Jhon Durán', webName: 'Durán', pos: 'FWD', price: 6.1, pts: 38, photo: 'https://media.api-sports.io/football/players/284300.png' }
  ],
  // Manchester United (33)
  33: [
    { name: 'André Onana', webName: 'Onana', pos: 'GKP', price: 5.0, pts: 35, photo: 'https://media.api-sports.io/football/players/521.png' },
    { name: 'Diogo Dalot', webName: 'Dalot', pos: 'DEF', price: 5.1, pts: 32, photo: 'https://media.api-sports.io/football/players/882.png' },
    { name: 'Lisandro Martínez', webName: 'Martínez', pos: 'DEF', price: 5.3, pts: 26, photo: 'https://media.api-sports.io/football/players/6029.png' },
    { name: 'Matthijs de Ligt', webName: 'De Ligt', pos: 'DEF', price: 5.0, pts: 29, photo: 'https://media.api-sports.io/football/players/532.png' },
    { name: 'Noussair Mazraoui', webName: 'Mazraoui', pos: 'DEF', price: 4.6, pts: 28, photo: 'https://media.api-sports.io/football/players/533.png' },
    { name: 'Bruno Fernandes', webName: 'Fernandes', pos: 'MID', price: 8.2, pts: 44, photo: 'https://media.api-sports.io/football/players/1485.png' },
    { name: 'Alejandro Garnacho', webName: 'Garnacho', pos: 'MID', price: 6.4, pts: 36, photo: 'https://media.api-sports.io/football/players/162874.png' },
    { name: 'Kobbie Mainoo', webName: 'Mainoo', pos: 'MID', price: 5.2, pts: 22, photo: 'https://media.api-sports.io/football/players/284242.png' },
    { name: 'Marcus Rashford', webName: 'Rashford', pos: 'MID', price: 6.8, pts: 32, photo: 'https://media.api-sports.io/football/players/909.png' },
    { name: 'Rasmus Højlund', webName: 'Højlund', pos: 'FWD', price: 6.9, pts: 24, photo: 'https://media.api-sports.io/football/players/162986.png' }
  ],
  // Tottenham (47)
  47: [
    { name: 'Guglielmo Vicario', webName: 'Vicario', pos: 'GKP', price: 5.0, pts: 28, photo: 'https://media.api-sports.io/football/players/31518.png' },
    { name: 'Pedro Porro', webName: 'Porro', pos: 'DEF', price: 5.5, pts: 36, photo: 'https://media.api-sports.io/football/players/47514.png' },
    { name: 'Cristian Romero', webName: 'Romero', pos: 'DEF', price: 5.1, pts: 30, photo: 'https://media.api-sports.io/football/players/30416.png' },
    { name: 'Micky van de Ven', webName: 'Van de Ven', pos: 'DEF', price: 4.7, pts: 28, photo: 'https://media.api-sports.io/football/players/138805.png' },
    { name: 'Destiny Udogie', webName: 'Udogie', pos: 'DEF', price: 4.9, pts: 25, photo: 'https://media.api-sports.io/football/players/138810.png' },
    { name: 'Son Heung-min', webName: 'Son', pos: 'MID', price: 9.8, pts: 48, photo: 'https://media.api-sports.io/football/players/186.png' },
    { name: 'James Maddison', webName: 'Maddison', pos: 'MID', price: 7.6, pts: 42, photo: 'https://media.api-sports.io/football/players/18784.png' },
    { name: 'Brennan Johnson', webName: 'Johnson', pos: 'MID', price: 6.8, pts: 45, photo: 'https://media.api-sports.io/football/players/153430.png' },
    { name: 'Dejan Kulusevski', webName: 'Kulusevski', pos: 'MID', price: 6.3, pts: 35, photo: 'https://media.api-sports.io/football/players/30415.png' },
    { name: 'Dominic Solanke', webName: 'Solanke', pos: 'FWD', price: 7.6, pts: 38, photo: 'https://media.api-sports.io/football/players/18873.png' }
  ],
  // Newcastle (34)
  34: [
    { name: 'Nick Pope', webName: 'Pope', pos: 'GKP', price: 5.0, pts: 30, photo: 'https://media.api-sports.io/football/players/18933.png' },
    { name: 'Kieran Trippier', webName: 'Trippier', pos: 'DEF', price: 5.6, pts: 22, photo: 'https://media.api-sports.io/football/players/628.png' },
    { name: 'Fabian Schär', webName: 'Schär', pos: 'DEF', price: 5.4, pts: 30, photo: 'https://media.api-sports.io/football/players/18858.png' },
    { name: 'Dan Burn', webName: 'Burn', pos: 'DEF', price: 4.5, pts: 28, photo: 'https://media.api-sports.io/football/players/18956.png' },
    { name: 'Lewis Hall', webName: 'Hall', pos: 'DEF', price: 4.4, pts: 27, photo: 'https://media.api-sports.io/football/players/284322.png' },
    { name: 'Anthony Gordon', webName: 'Gordon', pos: 'MID', price: 7.3, pts: 38, photo: 'https://media.api-sports.io/football/players/152967.png' },
    { name: 'Bruno Guimarães', webName: 'Guimarães', pos: 'MID', price: 6.3, pts: 32, photo: 'https://media.api-sports.io/football/players/1043.png' },
    { name: 'Harvey Barnes', webName: 'Barnes', pos: 'MID', price: 6.4, pts: 35, photo: 'https://media.api-sports.io/football/players/18788.png' },
    { name: 'Alexander Isak', webName: 'Isak', pos: 'FWD', price: 8.5, pts: 42, photo: 'https://media.api-sports.io/football/players/1162.png' }
  ],
  // Brighton (51)
  51: [
    { name: 'Bart Verbruggen', webName: 'Verbruggen', pos: 'GKP', price: 4.5, pts: 26, photo: 'https://media.api-sports.io/football/players/162818.png' },
    { name: 'Lewis Dunk', webName: 'Dunk', pos: 'DEF', price: 4.6, pts: 24, photo: 'https://media.api-sports.io/football/players/18953.png' },
    { name: 'Pervis Estupiñán', webName: 'Estupiñán', pos: 'DEF', price: 5.0, pts: 20, photo: 'https://media.api-sports.io/football/players/47517.png' },
    { name: 'Jan Paul van Hecke', webName: 'Van Hecke', pos: 'DEF', price: 4.5, pts: 25, photo: 'https://media.api-sports.io/football/players/138804.png' },
    { name: 'Kaoru Mitoma', webName: 'Mitoma', pos: 'MID', price: 6.6, pts: 38, photo: 'https://media.api-sports.io/football/players/138802.png' },
    { name: 'Yankuba Minteh', webName: 'Minteh', pos: 'MID', price: 5.4, pts: 30, photo: 'https://media.api-sports.io/football/players/284323.png' },
    { name: 'Danny Welbeck', webName: 'Welbeck', pos: 'FWD', price: 5.9, pts: 51, photo: 'https://media.api-sports.io/football/players/18872.png' },
    { name: 'Georginio Rutter', webName: 'Rutter', pos: 'FWD', price: 5.5, pts: 28, photo: 'https://media.api-sports.io/football/players/152994.png' }
  ],
  // Brentford (55)
  55: [
    { name: 'Mark Flekken', webName: 'Flekken', pos: 'GKP', price: 4.5, pts: 34, photo: 'https://media.api-sports.io/football/players/25391.png' },
    { name: 'Ethan Pinnock', webName: 'Pinnock', pos: 'DEF', price: 4.5, pts: 31, photo: 'https://media.api-sports.io/football/players/19347.png' },
    { name: 'Nathan Collins', webName: 'Collins', pos: 'DEF', price: 4.5, pts: 32, photo: 'https://media.api-sports.io/football/players/152968.png' },
    { name: 'Bryan Mbeumo', webName: 'Mbeumo', pos: 'MID', price: 7.7, pts: 59, photo: 'https://media.api-sports.io/football/players/19348.png' },
    { name: 'Mikkel Damsgaard', webName: 'Damsgaard', pos: 'MID', price: 5.0, pts: 28, photo: 'https://media.api-sports.io/football/players/30414.png' },
    { name: 'Yoane Wissa', webName: 'Wissa', pos: 'FWD', price: 6.1, pts: 38, photo: 'https://media.api-sports.io/football/players/2281.png' }
  ],
  // Fulham (36)
  36: [
    { name: 'Bernd Leno', webName: 'Leno', pos: 'GKP', price: 5.0, pts: 28, photo: 'https://media.api-sports.io/football/players/1456.png' },
    { name: 'Antonee Robinson', webName: 'Robinson', pos: 'DEF', price: 4.7, pts: 34, photo: 'https://media.api-sports.io/football/players/18970.png' },
    { name: 'Joachim Andersen', webName: 'Andersen', pos: 'DEF', price: 4.5, pts: 25, photo: 'https://media.api-sports.io/football/players/1042.png' },
    { name: 'Alex Iwobi', webName: 'Iwobi', pos: 'MID', price: 5.6, pts: 32, photo: 'https://media.api-sports.io/football/players/2414.png' },
    { name: 'Emile Smith Rowe', webName: 'Smith Rowe', pos: 'MID', price: 5.7, pts: 38, photo: 'https://media.api-sports.io/football/players/1472.png' },
    { name: 'Raúl Jiménez', webName: 'Jiménez', pos: 'FWD', price: 5.8, pts: 40, photo: 'https://media.api-sports.io/football/players/19719.png' }
  ],
  // Crystal Palace (52)
  52: [
    { name: 'Dean Henderson', webName: 'Henderson', pos: 'GKP', price: 4.5, pts: 26, photo: 'https://media.api-sports.io/football/players/908.png' },
    { name: 'Marc Guéhi', webName: 'Guéhi', pos: 'DEF', price: 4.5, pts: 28, photo: 'https://media.api-sports.io/football/players/152959.png' },
    { name: 'Daniel Muñoz', webName: 'Muñoz', pos: 'DEF', price: 4.9, pts: 27, photo: 'https://media.api-sports.io/football/players/6101.png' },
    { name: 'Eberechi Eze', webName: 'Eze', pos: 'MID', price: 6.8, pts: 35, photo: 'https://media.api-sports.io/football/players/19350.png' },
    { name: 'Jean-Philippe Mateta', webName: 'Mateta', pos: 'FWD', price: 7.4, pts: 36, photo: 'https://media.api-sports.io/football/players/2297.png' }
  ],
  // Bournemouth (35)
  35: [
    { name: 'Kepa Arrizabalaga', webName: 'Kepa', pos: 'GKP', price: 4.5, pts: 18, photo: 'https://media.api-sports.io/football/players/2289.png' },
    { name: 'Milos Kerkez', webName: 'Kerkez', pos: 'DEF', price: 4.5, pts: 26, photo: 'https://media.api-sports.io/football/players/284324.png' },
    { name: 'Antoine Semenyo', webName: 'Semenyo', pos: 'MID', price: 5.7, pts: 39, photo: 'https://media.api-sports.io/football/players/152998.png' },
    { name: 'Evanilson', webName: 'Evanilson', pos: 'FWD', price: 5.9, pts: 29, photo: 'https://media.api-sports.io/football/players/162824.png' }
  ],
  // Nottingham Forest (65)
  65: [
    { name: 'Matz Sels', webName: 'Sels', pos: 'GKP', price: 4.6, pts: 36, photo: 'https://media.api-sports.io/football/players/2298.png' },
    { name: 'Ola Aina', webName: 'Aina', pos: 'DEF', price: 4.6, pts: 35, photo: 'https://media.api-sports.io/football/players/18973.png' },
    { name: 'Murillo', webName: 'Murillo', pos: 'DEF', price: 4.6, pts: 32, photo: 'https://media.api-sports.io/football/players/284325.png' },
    { name: 'Nikola Milenković', webName: 'Milenković', pos: 'DEF', price: 4.6, pts: 33, photo: 'https://media.api-sports.io/football/players/30417.png' },
    { name: 'Morgan Gibbs-White', webName: 'Gibbs-White', pos: 'MID', price: 6.3, pts: 31, photo: 'https://media.api-sports.io/football/players/19720.png' },
    { name: 'Chris Wood', webName: 'Wood', pos: 'FWD', price: 6.5, pts: 54, photo: 'https://media.api-sports.io/football/players/18874.png' }
  ],
  // Everton (45)
  45: [
    { name: 'Jordan Pickford', webName: 'Pickford', pos: 'GKP', price: 4.9, pts: 30, photo: 'https://media.api-sports.io/football/players/2410.png' },
    { name: 'James Tarkowski', webName: 'Tarkowski', pos: 'DEF', price: 4.8, pts: 26, photo: 'https://media.api-sports.io/football/players/18859.png' },
    { name: 'Jarrad Branthwaite', webName: 'Branthwaite', pos: 'DEF', price: 4.8, pts: 18, photo: 'https://media.api-sports.io/football/players/152969.png' },
    { name: 'Vitalii Mykolenko', webName: 'Mykolenko', pos: 'DEF', price: 4.4, pts: 24, photo: 'https://media.api-sports.io/football/players/644.png' },
    { name: 'Dwight McNeil', webName: 'McNeil', pos: 'MID', price: 5.7, pts: 46, photo: 'https://media.api-sports.io/football/players/18974.png' },
    { name: 'Iliman Ndiaye', webName: 'Ndiaye', pos: 'MID', price: 5.4, pts: 31, photo: 'https://media.api-sports.io/football/players/162825.png' },
    { name: 'Dominic Calvert-Lewin', webName: 'Calvert-Lewin', pos: 'FWD', price: 6.0, pts: 30, photo: 'https://media.api-sports.io/football/players/2411.png' }
  ],
  // West Ham (48)
  48: [
    { name: 'Alphonse Areola', webName: 'Areola', pos: 'GKP', price: 4.4, pts: 20, photo: 'https://media.api-sports.io/football/players/18920.png' },
    { name: 'Max Kilman', webName: 'Kilman', pos: 'DEF', price: 4.5, pts: 24, photo: 'https://media.api-sports.io/football/players/19345.png' },
    { name: 'Aaron Wan-Bissaka', webName: 'Wan-Bissaka', pos: 'DEF', price: 4.5, pts: 26, photo: 'https://media.api-sports.io/football/players/889.png' },
    { name: 'Emerson Palmieri', webName: 'Emerson', pos: 'DEF', price: 4.4, pts: 22, photo: 'https://media.api-sports.io/football/players/2287.png' },
    { name: 'Jarrod Bowen', webName: 'Bowen', pos: 'MID', price: 7.5, pts: 44, photo: 'https://media.api-sports.io/football/players/18875.png' },
    { name: 'Mohammed Kudus', webName: 'Kudus', pos: 'MID', price: 6.2, pts: 30, photo: 'https://media.api-sports.io/football/players/8503.png' },
    { name: 'Lucas Paquetá', webName: 'Paquetá', pos: 'MID', price: 5.9, pts: 28, photo: 'https://media.api-sports.io/football/players/1044.png' },
    { name: 'Michail Antonio', webName: 'Antonio', pos: 'FWD', price: 5.4, pts: 24, photo: 'https://media.api-sports.io/football/players/18878.png' }
  ],
  // Wolves (39)
  39: [
    { name: 'José Sá', webName: 'Sá', pos: 'GKP', price: 4.4, pts: 18, photo: 'https://media.api-sports.io/football/players/2485.png' },
    { name: 'Rayan Aït-Nouri', webName: 'Aït-Nouri', pos: 'DEF', price: 4.7, pts: 38, photo: 'https://media.api-sports.io/football/players/138812.png' },
    { name: 'Nélson Semedo', webName: 'Semedo', pos: 'DEF', price: 4.5, pts: 20, photo: 'https://media.api-sports.io/football/players/2286.png' },
    { name: 'Craig Dawson', webName: 'Dawson', pos: 'DEF', price: 4.5, pts: 21, photo: 'https://media.api-sports.io/football/players/18861.png' },
    { name: 'Mario Lemina', webName: 'Lemina', pos: 'MID', price: 5.0, pts: 26, photo: 'https://media.api-sports.io/football/players/1459.png' },
    { name: 'João Gomes', webName: 'Gomes', pos: 'MID', price: 5.0, pts: 24, photo: 'https://media.api-sports.io/football/players/162823.png' },
    { name: 'Matheus Cunha', webName: 'Cunha', pos: 'FWD', price: 6.8, pts: 46, photo: 'https://media.api-sports.io/football/players/1149.png' },
    { name: 'Jørgen Strand Larsen', webName: 'Larsen', pos: 'FWD', price: 5.6, pts: 32, photo: 'https://media.api-sports.io/football/players/162833.png' }
  ],
  // Leicester (46)
  46: [
    { name: 'Mads Hermansen', webName: 'Hermansen', pos: 'GKP', price: 4.5, pts: 35, photo: 'https://media.api-sports.io/football/players/162834.png' },
    { name: 'Wout Faes', webName: 'Faes', pos: 'DEF', price: 4.2, pts: 28, photo: 'https://media.api-sports.io/football/players/2284.png' },
    { name: 'James Justin', webName: 'Justin', pos: 'DEF', price: 4.6, pts: 34, photo: 'https://media.api-sports.io/football/players/18971.png' },
    { name: 'Facundo Buonanotte', webName: 'Buonanotte', pos: 'MID', price: 5.1, pts: 41, photo: 'https://media.api-sports.io/football/players/284329.png' },
    { name: 'Wilfred Ndidi', webName: 'Ndidi', pos: 'MID', price: 5.0, pts: 29, photo: 'https://media.api-sports.io/football/players/18785.png' },
    { name: 'Jamie Vardy', webName: 'Vardy', pos: 'FWD', price: 5.7, pts: 39, photo: 'https://media.api-sports.io/football/players/18871.png' }
  ],
  // Southampton (41)
  41: [
    { name: 'Aaron Ramsdale', webName: 'Ramsdale', pos: 'GKP', price: 4.4, pts: 22, photo: 'https://media.api-sports.io/football/players/18931.png' },
    { name: 'Kyle Walker-Peters', webName: 'Walker-Peters', pos: 'DEF', price: 4.4, pts: 20, photo: 'https://media.api-sports.io/football/players/18957.png' },
    { name: 'Jan Bednarek', webName: 'Bednarek', pos: 'DEF', price: 4.0, pts: 21, photo: 'https://media.api-sports.io/football/players/18958.png' },
    { name: 'Tyler Dibling', webName: 'Dibling', pos: 'MID', price: 4.6, pts: 26, photo: 'https://media.api-sports.io/football/players/284330.png' },
    { name: 'Mateus Fernandes', webName: 'Fernandes', pos: 'MID', price: 5.0, pts: 25, photo: 'https://media.api-sports.io/football/players/284331.png' },
    { name: 'Cameron Archer', webName: 'Archer', pos: 'FWD', price: 5.0, pts: 28, photo: 'https://media.api-sports.io/football/players/153002.png' }
  ],
  // Ipswich (57)
  57: [
    { name: 'Arijanet Muric', webName: 'Muric', pos: 'GKP', price: 4.4, pts: 24, photo: 'https://media.api-sports.io/football/players/630.png' },
    { name: 'Leif Davis', webName: 'Davis', pos: 'DEF', price: 4.5, pts: 29, photo: 'https://media.api-sports.io/football/players/152970.png' },
    { name: 'Jacob Greaves', webName: 'Greaves', pos: 'DEF', price: 4.0, pts: 20, photo: 'https://media.api-sports.io/football/players/152971.png' },
    { name: 'Omari Hutchinson', webName: 'Hutchinson', pos: 'MID', price: 5.2, pts: 27, photo: 'https://media.api-sports.io/football/players/284326.png' },
    { name: 'Sammie Szmodics', webName: 'Szmodics', pos: 'MID', price: 5.8, pts: 30, photo: 'https://media.api-sports.io/football/players/18976.png' },
    { name: 'Liam Delap', webName: 'Delap', pos: 'FWD', price: 5.6, pts: 42, photo: 'https://media.api-sports.io/football/players/162826.png' }
  ]
};

async function runWithRetry(fn, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      console.warn(`[Attempt ${attempt}/${maxRetries}] Network/DB jitter: ${err.message?.split('\n')[0]}`);
      if (attempt === maxRetries) throw err;
      await new Promise(r => setTimeout(r, 1500 * attempt));
    }
  }
}

async function main() {
  console.log('=== SEEDING OFFICIAL 2025/2026 PREMIER LEAGUE SQUADS & ADMIN USER ===\n');

  // 1. Load active 20 PL Teams from MySQL
  const plTeams = await runWithRetry(() => prisma.team.findMany({
    where: {
      providerId: {
        in: [33, 34, 35, 36, 40, 42, 45, 47, 48, 49, 50, 51, 52, 55, 57, 65, 66, 39, 41, 46]
      }
    }
  }));

  console.log(`Loaded ${plTeams.length} official Premier League clubs from DB.`);
  const teamByProvider = new Map();
  plTeams.forEach(t => teamByProvider.set(t.providerId, t));

  // Team short code map
  const SHORT_NAMES = {
    42: 'ARS', 66: 'AVL', 35: 'BOU', 55: 'BRE', 51: 'BHA',
    49: 'CHE', 52: 'CRY', 45: 'EVE', 36: 'FUL', 57: 'IPS',
    46: 'LEI', 40: 'LIV', 50: 'MCI', 33: 'MUN', 34: 'NEW',
    65: 'NFO', 41: 'SOU', 47: 'TOT', 48: 'WHU', 39: 'WOL'
  };

  // 2. Clear old non-PL fantasy players
  console.log('Purging old fantasy players...');
  await runWithRetry(async () => {
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE fantasy_players;');
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
  });
  console.log('Cleared old players successfully.');

  // 3. Prepare all official Premier League players for batch insert
  const playerRecords = [];
  for (const [providerIdStr, players] of Object.entries(OFFICIAL_PL_PLAYERS)) {
    const pId = parseInt(providerIdStr, 10);
    const team = teamByProvider.get(pId);
    if (!team) {
      console.warn(`Team ${pId} not found in DB!`);
      continue;
    }
    const shortName = SHORT_NAMES[pId] || team.code || 'PL';

    for (const p of players) {
      const id = `fpl_${pId}_${p.webName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      playerRecords.push({
        id,
        name: p.name,
        webName: p.webName,
        teamId: team.id,
        teamProviderId: team.providerId,
        teamShortName: shortName,
        position: p.pos,
        price: p.price,
        startPrice: p.price,
        totalPoints: p.pts,
        photo: p.photo,
        status: 'AVAILABLE',
        chanceOfPlaying: 100
      });
    }
  }

  console.log(`Inserting ${playerRecords.length} official current-season Premier League players in batch...`);
  await runWithRetry(() => prisma.fantasyPlayer.createMany({ data: playerRecords, skipDuplicates: true }));
  console.log(`[PASS] Upserted ${playerRecords.length} official current-season Premier League players.`);

  // 4. Create / Reset Admin User Account
  console.log('\nCreating Admin Account: admin@myscore24.com ...');
  const adminEmail = 'admin@myscore24.com';
  const adminPasswordHash = hashPassword('AdminPassword2026!');

  const adminUser = await runWithRetry(() => prisma.fantasyUser.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: adminPasswordHash,
      managerName: 'Admin Manager',
      teamName: 'MyScore24 All-Stars',
      role: 'ADMIN'
    },
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      managerName: 'Admin Manager',
      teamName: 'MyScore24 All-Stars',
      role: 'ADMIN'
    }
  }));

  console.log(`[PASS] Admin account created/updated with ID: ${adminUser.id}`);

  // 5. Build a pre-configured Starting 15 for Admin
  // Pick Haaland, Salah, Saka, Palmer, Raya, Gabriel, Gvardiol, etc.
  const adminStarters = await runWithRetry(async () => [
    // 1: Raya (GKP)
    await prisma.fantasyPlayer.findFirst({ where: { webName: 'Raya' } }),
    // 2-5: Gabriel, Gvardiol, Alexander-Arnold, Saliba (DEF)
    await prisma.fantasyPlayer.findFirst({ where: { webName: 'Gabriel' } }),
    await prisma.fantasyPlayer.findFirst({ where: { webName: 'Gvardiol' } }),
    await prisma.fantasyPlayer.findFirst({ where: { webName: 'Alexander-Arnold' } }),
    await prisma.fantasyPlayer.findFirst({ where: { webName: 'Saliba' } }),
    // 6-9: Saka, Palmer, Salah, Rogers (MID)
    await prisma.fantasyPlayer.findFirst({ where: { webName: 'Saka' } }),
    await prisma.fantasyPlayer.findFirst({ where: { webName: 'Palmer' } }),
    await prisma.fantasyPlayer.findFirst({ where: { webName: 'Salah' } }),
    await prisma.fantasyPlayer.findFirst({ where: { webName: 'Rogers' } }),
    // 10-11: Haaland, Watkins (FWD)
    await prisma.fantasyPlayer.findFirst({ where: { webName: 'Haaland' } }),
    await prisma.fantasyPlayer.findFirst({ where: { webName: 'Watkins' } }),
    // 12: Fabianski / Ortega (Sub GKP)
    await prisma.fantasyPlayer.findFirst({ where: { webName: 'Ortega' } }),
    // 13: Greaves (Sub DEF)
    await prisma.fantasyPlayer.findFirst({ where: { webName: 'Greaves' } }),
    // 14: Dibling (Sub MID)
    await prisma.fantasyPlayer.findFirst({ where: { webName: 'Dibling' } }),
    // 15: Delap (Sub FWD)
    await prisma.fantasyPlayer.findFirst({ where: { webName: 'Delap' } }),
  ]);

  const validAdminSquad = adminStarters.filter(Boolean);
  if (validAdminSquad.length === 15) {
    const totalCost = validAdminSquad.reduce((sum, p) => sum + p.price, 0);
    const bank = Math.max(0, Math.round((100.0 - totalCost) * 10) / 10);

    const squad = await runWithRetry(() => prisma.fantasySquad.upsert({
      where: { userId: adminUser.id },
      update: {
        teamName: 'MyScore24 All-Stars',
        bank,
        squadValue: totalCost,
        totalPoints: 342,
        overallRank: 1,
        freeTransfers: 2
      },
      create: {
        userId: adminUser.id,
        competitionId: PL_COMP_ID,
        seasonYear: SEASON_YEAR,
        teamName: 'MyScore24 All-Stars',
        bank,
        squadValue: totalCost,
        totalPoints: 342,
        overallRank: 1,
        freeTransfers: 2
      }
    }));

    await runWithRetry(() => prisma.fantasySquadPlayer.deleteMany({ where: { squadId: squad.id } }));

    const squadPlayerData = validAdminSquad.map((p, i) => {
      const slot = i + 1;
      return {
        squadId: squad.id,
        fantasyPlayerId: p.id,
        positionIndex: slot,
        isStartingXI: slot <= 11,
        isCaptain: slot === 10, // Haaland
        isViceCaptain: slot === 8, // Salah
        purchasePrice: p.price
      };
    });

    await runWithRetry(() => prisma.fantasySquadPlayer.createMany({ data: squadPlayerData }));

    // Add to Global League
    const globalLeague = await runWithRetry(() => prisma.fantasyLeague.findFirst({ where: { code: 'GLOBAL' } }));
    if (globalLeague) {
      await runWithRetry(() => prisma.fantasyLeagueMember.upsert({
        where: {
          leagueId_squadId: {
            leagueId: globalLeague.id,
            squadId: squad.id
          }
        },
        update: { currentRank: 1 },
        create: {
          leagueId: globalLeague.id,
          userId: adminUser.id,
          squadId: squad.id,
          currentRank: 1
        }
      }));
    }
    console.log(`[PASS] Admin squad seeded with Haaland (C), Salah (V), Saka, Palmer, Raya!`);
  }

  console.log('\n=== SEED COMPLETED SUCCESSFULLY ===');
}

main().catch(console.error).finally(() => prisma.$disconnect());
