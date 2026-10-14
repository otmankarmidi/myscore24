const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PL_COMP_ID = 'cmuddjekz0001ua5kmnfa44u6'; // Premier League
const SEASON_YEAR = 2026;

// Team short names and standard rosters
const PL_ROSTERS = {
  // Arsenal (42)
  42: [
    { name: 'David Raya', webName: 'Raya', pos: 'GKP', price: 5.5, photo: 'https://media.api-sports.io/football/players/18844.png' },
    { name: 'Neto', webName: 'Neto', pos: 'GKP', price: 4.5, photo: 'https://media.api-sports.io/football/players/1455.png' },
    { name: 'William Saliba', webName: 'Saliba', pos: 'DEF', price: 6.0, photo: 'https://media.api-sports.io/football/players/22090.png' },
    { name: 'Gabriel Magalhães', webName: 'Gabriel', pos: 'DEF', price: 6.0, photo: 'https://media.api-sports.io/football/players/22221.png' },
    { name: 'Ben White', webName: 'White', pos: 'DEF', price: 6.5, photo: 'https://media.api-sports.io/football/players/18959.png' },
    { name: 'Jurriën Timber', webName: 'Timber', pos: 'DEF', price: 5.5, photo: 'https://media.api-sports.io/football/players/8500.png' },
    { name: 'Riccardo Calafiori', webName: 'Calafiori', pos: 'DEF', price: 5.5, photo: 'https://media.api-sports.io/football/players/138814.png' },
    { name: 'Oleksandr Zinchenko', webName: 'Zinchenko', pos: 'DEF', price: 4.8, photo: 'https://media.api-sports.io/football/players/642.png' },
    { name: 'Bukayo Saka', webName: 'Saka', pos: 'MID', price: 10.0, photo: 'https://media.api-sports.io/football/players/1467.png' },
    { name: 'Martin Ødegaard', webName: 'Ødegaard', pos: 'MID', price: 8.5, photo: 'https://media.api-sports.io/football/players/378.png' },
    { name: 'Declan Rice', webName: 'Rice', pos: 'MID', price: 6.5, photo: 'https://media.api-sports.io/football/players/293.png' },
    { name: 'Kai Havertz', webName: 'Havertz', pos: 'FWD', price: 8.0, photo: 'https://media.api-sports.io/football/players/2274.png' },
    { name: 'Gabriel Martinelli', webName: 'Martinelli', pos: 'MID', price: 7.0, photo: 'https://media.api-sports.io/football/players/2280.png' },
    { name: 'Leandro Trossard', webName: 'Trossard', pos: 'MID', price: 6.8, photo: 'https://media.api-sports.io/football/players/2288.png' },
    { name: 'Mikel Merino', webName: 'Merino', pos: 'MID', price: 6.0, photo: 'https://media.api-sports.io/football/players/1460.png' },
    { name: 'Gabriel Jesus', webName: 'Jesus', pos: 'FWD', price: 6.8, photo: 'https://media.api-sports.io/football/players/645.png' },
    { name: 'Raheem Sterling', webName: 'Sterling', pos: 'MID', price: 6.8, photo: 'https://media.api-sports.io/football/players/643.png' }
  ],
  // Manchester City (50)
  50: [
    { name: 'Ederson Moraes', webName: 'Ederson', pos: 'GKP', price: 5.5, photo: 'https://media.api-sports.io/football/players/629.png' },
    { name: 'Stefan Ortega', webName: 'Ortega', pos: 'GKP', price: 4.5, photo: 'https://media.api-sports.io/football/players/25390.png' },
    { name: 'Joško Gvardiol', webName: 'Gvardiol', pos: 'DEF', price: 6.0, photo: 'https://media.api-sports.io/football/players/95.png' },
    { name: 'Rúben Dias', webName: 'Dias', pos: 'DEF', price: 5.5, photo: 'https://media.api-sports.io/football/players/567.png' },
    { name: 'Manuel Akanji', webName: 'Akanji', pos: 'DEF', price: 5.5, photo: 'https://media.api-sports.io/football/players/1161.png' },
    { name: 'Kyle Walker', webName: 'Walker', pos: 'DEF', price: 5.2, photo: 'https://media.api-sports.io/football/players/627.png' },
    { name: 'John Stones', webName: 'Stones', pos: 'DEF', price: 5.3, photo: 'https://media.api-sports.io/football/players/626.png' },
    { name: 'Nathan Aké', webName: 'Aké', pos: 'DEF', price: 5.3, photo: 'https://media.api-sports.io/football/players/18846.png' },
    { name: 'Erling Haaland', webName: 'Haaland', pos: 'FWD', price: 15.0, photo: 'https://media.api-sports.io/football/players/1100.png' },
    { name: 'Phil Foden', webName: 'Foden', pos: 'MID', price: 9.5, photo: 'https://media.api-sports.io/football/players/631.png' },
    { name: 'Kevin De Bruyne', webName: 'De Bruyne', pos: 'MID', price: 9.5, photo: 'https://media.api-sports.io/football/players/629.png' },
    { name: 'Bernardo Silva', webName: 'Bernardo', pos: 'MID', price: 6.5, photo: 'https://media.api-sports.io/football/players/635.png' },
    { name: 'Rodri', webName: 'Rodri', pos: 'MID', price: 6.4, photo: 'https://media.api-sports.io/football/players/44.png' },
    { name: 'Savinho', webName: 'Savinho', pos: 'MID', price: 6.5, photo: 'https://media.api-sports.io/football/players/162719.png' },
    { name: 'Jérémy Doku', webName: 'Doku', pos: 'MID', price: 6.4, photo: 'https://media.api-sports.io/football/players/138787.png' },
    { name: 'Mateo Kovačić', webName: 'Kovačić', pos: 'MID', price: 5.5, photo: 'https://media.api-sports.io/football/players/2290.png' },
    { name: 'Jack Grealish', webName: 'Grealish', pos: 'MID', price: 6.5, photo: 'https://media.api-sports.io/football/players/19187.png' }
  ],
  // Liverpool (40)
  40: [
    { name: 'Alisson Becker', webName: 'Alisson', pos: 'GKP', price: 5.5, photo: 'https://media.api-sports.io/football/players/280.png' },
    { name: 'Caoimhin Kelleher', webName: 'Kelleher', pos: 'GKP', price: 4.5, photo: 'https://media.api-sports.io/football/players/281.png' },
    { name: 'Trent Alexander-Arnold', webName: 'Alexander-Arnold', pos: 'DEF', price: 7.0, photo: 'https://media.api-sports.io/football/players/284.png' },
    { name: 'Virgil van Dijk', webName: 'Van Dijk', pos: 'DEF', price: 6.0, photo: 'https://media.api-sports.io/football/players/283.png' },
    { name: 'Ibrahima Konaté', webName: 'Konaté', pos: 'DEF', price: 5.2, photo: 'https://media.api-sports.io/football/players/1145.png' },
    { name: 'Andy Robertson', webName: 'Robertson', pos: 'DEF', price: 6.0, photo: 'https://media.api-sports.io/football/players/289.png' },
    { name: 'Kostas Tsimikas', webName: 'Tsimikas', pos: 'DEF', price: 4.8, photo: 'https://media.api-sports.io/football/players/288.png' },
    { name: 'Mohamed Salah', webName: 'Salah', pos: 'MID', price: 12.5, photo: 'https://media.api-sports.io/football/players/306.png' },
    { name: 'Luis Díaz', webName: 'Díaz', pos: 'MID', price: 7.8, photo: 'https://media.api-sports.io/football/players/2489.png' },
    { name: 'Alexis Mac Allister', webName: 'Mac Allister', pos: 'MID', price: 6.4, photo: 'https://media.api-sports.io/football/players/6716.png' },
    { name: 'Dominik Szoboszlai', webName: 'Szoboszlai', pos: 'MID', price: 6.5, photo: 'https://media.api-sports.io/football/players/1099.png' },
    { name: 'Ryan Gravenberch', webName: 'Gravenberch', pos: 'MID', price: 5.4, photo: 'https://media.api-sports.io/football/players/8501.png' },
    { name: 'Diogo Jota', webName: 'Jota', pos: 'FWD', price: 7.5, photo: 'https://media.api-sports.io/football/players/2487.png' },
    { name: 'Darwin Núñez', webName: 'Núñez', pos: 'FWD', price: 7.2, photo: 'https://media.api-sports.io/football/players/6487.png' },
    { name: 'Cody Gakpo', webName: 'Gakpo', pos: 'FWD', price: 7.2, photo: 'https://media.api-sports.io/football/players/2488.png' },
    { name: 'Curtis Jones', webName: 'Jones', pos: 'MID', price: 5.3, photo: 'https://media.api-sports.io/football/players/300.png' }
  ],
  // Chelsea (49)
  49: [
    { name: 'Robert Sánchez', webName: 'Sánchez', pos: 'GKP', price: 4.8, photo: 'https://media.api-sports.io/football/players/18929.png' },
    { name: 'Filip Jørgensen', webName: 'Jørgensen', pos: 'GKP', price: 4.4, photo: 'https://media.api-sports.io/football/players/162817.png' },
    { name: 'Levi Colwill', webName: 'Colwill', pos: 'DEF', price: 4.6, photo: 'https://media.api-sports.io/football/players/152955.png' },
    { name: 'Marc Cucurella', webName: 'Cucurella', pos: 'DEF', price: 5.0, photo: 'https://media.api-sports.io/football/players/47519.png' },
    { name: 'Malo Gusto', webName: 'Gusto', pos: 'DEF', price: 5.0, photo: 'https://media.api-sports.io/football/players/162489.png' },
    { name: 'Reece James', webName: 'James', pos: 'DEF', price: 5.3, photo: 'https://media.api-sports.io/football/players/19545.png' },
    { name: 'Wesley Fofana', webName: 'Fofana', pos: 'DEF', price: 4.5, photo: 'https://media.api-sports.io/football/players/22089.png' },
    { name: 'Cole Palmer', webName: 'Palmer', pos: 'MID', price: 11.0, photo: 'https://media.api-sports.io/football/players/162804.png' },
    { name: 'Enzo Fernández', webName: 'Enzo', pos: 'MID', price: 5.0, photo: 'https://media.api-sports.io/football/players/6032.png' },
    { name: 'Moisés Caicedo', webName: 'Caicedo', pos: 'MID', price: 5.5, photo: 'https://media.api-sports.io/football/players/6100.png' },
    { name: 'Noni Madueke', webName: 'Madueke', pos: 'MID', price: 6.5, photo: 'https://media.api-sports.io/football/players/138806.png' },
    { name: 'Nicolas Jackson', webName: 'Jackson', pos: 'FWD', price: 8.0, photo: 'https://media.api-sports.io/football/players/163013.png' },
    { name: 'Christopher Nkunku', webName: 'Nkunku', pos: 'FWD', price: 6.2, photo: 'https://media.api-sports.io/football/players/2296.png' },
    { name: 'Pedro Neto', webName: 'Neto', pos: 'MID', price: 6.3, photo: 'https://media.api-sports.io/football/players/19717.png' },
    { name: 'Jadon Sancho', webName: 'Sancho', pos: 'MID', price: 6.3, photo: 'https://media.api-sports.io/football/players/1163.png' }
  ],
  // Manchester United (33)
  33: [
    { name: 'André Onana', webName: 'Onana', pos: 'GKP', price: 5.0, photo: 'https://media.api-sports.io/football/players/521.png' },
    { name: 'Altay Bayındır', webName: 'Bayındır', pos: 'GKP', price: 4.4, photo: 'https://media.api-sports.io/football/players/3412.png' },
    { name: 'Diogo Dalot', webName: 'Dalot', pos: 'DEF', price: 5.2, photo: 'https://media.api-sports.io/football/players/882.png' },
    { name: 'Lisandro Martínez', webName: 'Martínez', pos: 'DEF', price: 5.4, photo: 'https://media.api-sports.io/football/players/6029.png' },
    { name: 'Matthijs de Ligt', webName: 'De Ligt', pos: 'DEF', price: 5.0, photo: 'https://media.api-sports.io/football/players/532.png' },
    { name: 'Noussair Mazraoui', webName: 'Mazraoui', pos: 'DEF', price: 4.6, photo: 'https://media.api-sports.io/football/players/533.png' },
    { name: 'Harry Maguire', webName: 'Maguire', pos: 'DEF', price: 5.0, photo: 'https://media.api-sports.io/football/players/2934.png' },
    { name: 'Bruno Fernandes', webName: 'Fernandes', pos: 'MID', price: 8.3, photo: 'https://media.api-sports.io/football/players/1485.png' },
    { name: 'Alejandro Garnacho', webName: 'Garnacho', pos: 'MID', price: 6.5, photo: 'https://media.api-sports.io/football/players/162874.png' },
    { name: 'Kobbie Mainoo', webName: 'Mainoo', pos: 'MID', price: 5.3, photo: 'https://media.api-sports.io/football/players/284242.png' },
    { name: 'Marcus Rashford', webName: 'Rashford', pos: 'MID', price: 6.8, photo: 'https://media.api-sports.io/football/players/909.png' },
    { name: 'Amad Diallo', webName: 'Amad', pos: 'MID', price: 5.1, photo: 'https://media.api-sports.io/football/players/138822.png' },
    { name: 'Rasmus Højlund', webName: 'Højlund', pos: 'FWD', price: 6.9, photo: 'https://media.api-sports.io/football/players/162986.png' },
    { name: 'Joshua Zirkzee', webName: 'Zirkzee', pos: 'FWD', price: 6.8, photo: 'https://media.api-sports.io/football/players/138827.png' }
  ],
  // Tottenham (47)
  47: [
    { name: 'Guglielmo Vicario', webName: 'Vicario', pos: 'GKP', price: 5.0, photo: 'https://media.api-sports.io/football/players/31518.png' },
    { name: 'Fraser Forster', webName: 'Forster', pos: 'GKP', price: 4.4, photo: 'https://media.api-sports.io/football/players/18919.png' },
    { name: 'Pedro Porro', webName: 'Porro', pos: 'DEF', price: 5.5, photo: 'https://media.api-sports.io/football/players/47514.png' },
    { name: 'Cristian Romero', webName: 'Romero', pos: 'DEF', price: 5.1, photo: 'https://media.api-sports.io/football/players/30416.png' },
    { name: 'Micky van de Ven', webName: 'Van de Ven', pos: 'DEF', price: 4.7, photo: 'https://media.api-sports.io/football/players/138805.png' },
    { name: 'Destiny Udogie', webName: 'Udogie', pos: 'DEF', price: 5.0, photo: 'https://media.api-sports.io/football/players/138810.png' },
    { name: 'Son Heung-min', webName: 'Son', pos: 'MID', price: 9.8, photo: 'https://media.api-sports.io/football/players/186.png' },
    { name: 'James Maddison', webName: 'Maddison', pos: 'MID', price: 7.6, photo: 'https://media.api-sports.io/football/players/18784.png' },
    { name: 'Dejan Kulusevski', webName: 'Kulusevski', pos: 'MID', price: 6.3, photo: 'https://media.api-sports.io/football/players/30415.png' },
    { name: 'Brennan Johnson', webName: 'Johnson', pos: 'MID', price: 6.8, photo: 'https://media.api-sports.io/football/players/153430.png' },
    { name: 'Dominic Solanke', webName: 'Solanke', pos: 'FWD', price: 7.7, photo: 'https://media.api-sports.io/football/players/18873.png' },
    { name: 'Richarlison', webName: 'Richarlison', pos: 'FWD', price: 6.8, photo: 'https://media.api-sports.io/football/players/2413.png' }
  ],
  // Newcastle (34)
  34: [
    { name: 'Nick Pope', webName: 'Pope', pos: 'GKP', price: 5.0, photo: 'https://media.api-sports.io/football/players/18933.png' },
    { name: 'Kieran Trippier', webName: 'Trippier', pos: 'DEF', price: 5.7, photo: 'https://media.api-sports.io/football/players/628.png' },
    { name: 'Fabian Schär', webName: 'Schär', pos: 'DEF', price: 5.4, photo: 'https://media.api-sports.io/football/players/18858.png' },
    { name: 'Dan Burn', webName: 'Burn', pos: 'DEF', price: 4.5, photo: 'https://media.api-sports.io/football/players/18956.png' },
    { name: 'Lewis Hall', webName: 'Hall', pos: 'DEF', price: 4.4, photo: 'https://media.api-sports.io/football/players/284322.png' },
    { name: 'Tino Livramento', webName: 'Livramento', pos: 'DEF', price: 4.5, photo: 'https://media.api-sports.io/football/players/152957.png' },
    { name: 'Anthony Gordon', webName: 'Gordon', pos: 'MID', price: 7.4, photo: 'https://media.api-sports.io/football/players/152967.png' },
    { name: 'Bruno Guimarães', webName: 'Guimarães', pos: 'MID', price: 6.3, photo: 'https://media.api-sports.io/football/players/1043.png' },
    { name: 'Harvey Barnes', webName: 'Barnes', pos: 'MID', price: 6.4, photo: 'https://media.api-sports.io/football/players/18788.png' },
    { name: 'Alexander Isak', webName: 'Isak', pos: 'FWD', price: 8.4, photo: 'https://media.api-sports.io/football/players/1162.png' },
    { name: 'Callum Wilson', webName: 'Wilson', pos: 'FWD', price: 7.0, photo: 'https://media.api-sports.io/football/players/18884.png' }
  ],
  // Aston Villa (66)
  66: [
    { name: 'Emiliano Martínez', webName: 'Martínez', pos: 'GKP', price: 5.0, photo: 'https://media.api-sports.io/football/players/1458.png' },
    { name: 'Lucas Digne', webName: 'Digne', pos: 'DEF', price: 4.7, photo: 'https://media.api-sports.io/football/players/2412.png' },
    { name: 'Ezri Konsa', webName: 'Konsa', pos: 'DEF', price: 4.5, photo: 'https://media.api-sports.io/football/players/19184.png' },
    { name: 'Pau Torres', webName: 'Torres', pos: 'DEF', price: 4.5, photo: 'https://media.api-sports.io/football/players/47522.png' },
    { name: 'Matty Cash', webName: 'Cash', pos: 'DEF', price: 4.6, photo: 'https://media.api-sports.io/football/players/19277.png' },
    { name: 'Morgan Rogers', webName: 'Rogers', pos: 'MID', price: 5.4, photo: 'https://media.api-sports.io/football/players/152988.png' },
    { name: 'Youri Tielemans', webName: 'Tielemans', pos: 'MID', price: 5.5, photo: 'https://media.api-sports.io/football/players/18786.png' },
    { name: 'John McGinn', webName: 'McGinn', pos: 'MID', price: 5.3, photo: 'https://media.api-sports.io/football/players/19188.png' },
    { name: 'Leon Bailey', webName: 'Bailey', pos: 'MID', price: 6.4, photo: 'https://media.api-sports.io/football/players/1148.png' },
    { name: 'Ollie Watkins', webName: 'Watkins', pos: 'FWD', price: 9.1, photo: 'https://media.api-sports.io/football/players/19349.png' },
    { name: 'Jhon Durán', webName: 'Durán', pos: 'FWD', price: 6.0, photo: 'https://media.api-sports.io/football/players/284300.png' }
  ],
  // Brighton (51)
  51: [
    { name: 'Bart Verbruggen', webName: 'Verbruggen', pos: 'GKP', price: 4.5, photo: 'https://media.api-sports.io/football/players/162818.png' },
    { name: 'Lewis Dunk', webName: 'Dunk', pos: 'DEF', price: 4.6, photo: 'https://media.api-sports.io/football/players/18953.png' },
    { name: 'Pervis Estupiñán', webName: 'Estupiñán', pos: 'DEF', price: 5.0, photo: 'https://media.api-sports.io/football/players/47517.png' },
    { name: 'Jan Paul van Hecke', webName: 'Van Hecke', pos: 'DEF', price: 4.5, photo: 'https://media.api-sports.io/football/players/138804.png' },
    { name: 'Kaoru Mitoma', webName: 'Mitoma', pos: 'MID', price: 6.6, photo: 'https://media.api-sports.io/football/players/138802.png' },
    { name: 'Simon Adingra', webName: 'Adingra', pos: 'MID', price: 5.5, photo: 'https://media.api-sports.io/football/players/162820.png' },
    { name: 'Yankuba Minteh', webName: 'Minteh', pos: 'MID', price: 5.4, photo: 'https://media.api-sports.io/football/players/284323.png' },
    { name: 'Danny Welbeck', webName: 'Welbeck', pos: 'FWD', price: 5.8, photo: 'https://media.api-sports.io/football/players/18872.png' },
    { name: 'Evan Ferguson', webName: 'Ferguson', pos: 'FWD', price: 5.5, photo: 'https://media.api-sports.io/football/players/284241.png' },
    { name: 'Georginio Rutter', webName: 'Rutter', pos: 'FWD', price: 5.5, photo: 'https://media.api-sports.io/football/players/152994.png' }
  ],
  // Brentford (55)
  55: [
    { name: 'Mark Flekken', webName: 'Flekken', pos: 'GKP', price: 4.5, photo: 'https://media.api-sports.io/football/players/25391.png' },
    { name: 'Ethan Pinnock', webName: 'Pinnock', pos: 'DEF', price: 4.5, photo: 'https://media.api-sports.io/football/players/19347.png' },
    { name: 'Nathan Collins', webName: 'Collins', pos: 'DEF', price: 4.5, photo: 'https://media.api-sports.io/football/players/152968.png' },
    { name: 'Bryan Mbeumo', webName: 'Mbeumo', pos: 'MID', price: 7.6, photo: 'https://media.api-sports.io/football/players/19348.png' },
    { name: 'Yoane Wissa', webName: 'Wissa', pos: 'FWD', price: 6.1, photo: 'https://media.api-sports.io/football/players/2281.png' },
    { name: 'Mikkel Damsgaard', webName: 'Damsgaard', pos: 'MID', price: 5.0, photo: 'https://media.api-sports.io/football/players/30414.png' },
    { name: 'Christian Nørgaard', webName: 'Nørgaard', pos: 'MID', price: 4.8, photo: 'https://media.api-sports.io/football/players/19346.png' }
  ],
  // Fulham (36)
  36: [
    { name: 'Bernd Leno', webName: 'Leno', pos: 'GKP', price: 5.0, photo: 'https://media.api-sports.io/football/players/1456.png' },
    { name: 'Antonee Robinson', webName: 'Robinson', pos: 'DEF', price: 4.7, photo: 'https://media.api-sports.io/football/players/18970.png' },
    { name: 'Joachim Andersen', webName: 'Andersen', pos: 'DEF', price: 4.5, photo: 'https://media.api-sports.io/football/players/1042.png' },
    { name: 'Alex Iwobi', webName: 'Iwobi', pos: 'MID', price: 5.6, photo: 'https://media.api-sports.io/football/players/2414.png' },
    { name: 'Emile Smith Rowe', webName: 'Smith Rowe', pos: 'MID', price: 5.7, photo: 'https://media.api-sports.io/football/players/1472.png' },
    { name: 'Adama Traoré', webName: 'Traoré', pos: 'MID', price: 5.0, photo: 'https://media.api-sports.io/football/players/19718.png' },
    { name: 'Raúl Jiménez', webName: 'Jiménez', pos: 'FWD', price: 5.7, photo: 'https://media.api-sports.io/football/players/19719.png' },
    { name: 'Rodrigo Muniz', webName: 'Muniz', pos: 'FWD', price: 5.7, photo: 'https://media.api-sports.io/football/players/162822.png' }
  ],
  // Crystal Palace (52)
  52: [
    { name: 'Dean Henderson', webName: 'Henderson', pos: 'GKP', price: 4.5, photo: 'https://media.api-sports.io/football/players/908.png' },
    { name: 'Marc Guéhi', webName: 'Guéhi', pos: 'DEF', price: 4.5, photo: 'https://media.api-sports.io/football/players/152959.png' },
    { name: 'Daniel Muñoz', webName: 'Muñoz', pos: 'DEF', price: 4.9, photo: 'https://media.api-sports.io/football/players/6101.png' },
    { name: 'Tyrick Mitchell', webName: 'Mitchell', pos: 'DEF', price: 4.8, photo: 'https://media.api-sports.io/football/players/152960.png' },
    { name: 'Eberechi Eze', webName: 'Eze', pos: 'MID', price: 6.8, photo: 'https://media.api-sports.io/football/players/19350.png' },
    { name: 'Daichi Kamada', webName: 'Kamada', pos: 'MID', price: 5.0, photo: 'https://media.api-sports.io/football/players/1160.png' },
    { name: 'Jean-Philippe Mateta', webName: 'Mateta', pos: 'FWD', price: 7.4, photo: 'https://media.api-sports.io/football/players/2297.png' },
    { name: 'Eddie Nketiah', webName: 'Nketiah', pos: 'FWD', price: 5.9, photo: 'https://media.api-sports.io/football/players/1471.png' }
  ],
  // Bournemouth (35)
  35: [
    { name: 'Kepa Arrizabalaga', webName: 'Kepa', pos: 'GKP', price: 4.5, photo: 'https://media.api-sports.io/football/players/2289.png' },
    { name: 'Milos Kerkez', webName: 'Kerkez', pos: 'DEF', price: 4.5, photo: 'https://media.api-sports.io/football/players/284324.png' },
    { name: 'Marcos Senesi', webName: 'Senesi', pos: 'DEF', price: 4.8, photo: 'https://media.api-sports.io/football/players/6030.png' },
    { name: 'Antoine Semenyo', webName: 'Semenyo', pos: 'MID', price: 5.7, photo: 'https://media.api-sports.io/football/players/152998.png' },
    { name: 'Marcus Tavernier', webName: 'Tavernier', pos: 'MID', price: 5.5, photo: 'https://media.api-sports.io/football/players/18972.png' },
    { name: 'Evanilson', webName: 'Evanilson', pos: 'FWD', price: 5.9, photo: 'https://media.api-sports.io/football/players/162824.png' },
    { name: 'Justin Kluivert', webName: 'Kluivert', pos: 'MID', price: 5.4, photo: 'https://media.api-sports.io/football/players/534.png' }
  ],
  // Nottingham Forest (65)
  65: [
    { name: 'Matz Sels', webName: 'Sels', pos: 'GKP', price: 4.6, photo: 'https://media.api-sports.io/football/players/2298.png' },
    { name: 'Ola Aina', webName: 'Aina', pos: 'DEF', price: 4.5, photo: 'https://media.api-sports.io/football/players/18973.png' },
    { name: 'Murillo', webName: 'Murillo', pos: 'DEF', price: 4.5, photo: 'https://media.api-sports.io/football/players/284325.png' },
    { name: 'Nikola Milenković', webName: 'Milenković', pos: 'DEF', price: 4.5, photo: 'https://media.api-sports.io/football/players/30417.png' },
    { name: 'Morgan Gibbs-White', webName: 'Gibbs-White', pos: 'MID', price: 6.3, photo: 'https://media.api-sports.io/football/players/19720.png' },
    { name: 'Callum Hudson-Odoi', webName: 'Hudson-Odoi', pos: 'MID', price: 5.4, photo: 'https://media.api-sports.io/football/players/2299.png' },
    { name: 'Anthony Elanga', webName: 'Elanga', pos: 'MID', price: 5.2, photo: 'https://media.api-sports.io/football/players/152962.png' },
    { name: 'Chris Wood', webName: 'Wood', pos: 'FWD', price: 6.4, photo: 'https://media.api-sports.io/football/players/18874.png' }
  ],
  // Everton (45)
  45: [
    { name: 'Jordan Pickford', webName: 'Pickford', pos: 'GKP', price: 4.9, photo: 'https://media.api-sports.io/football/players/2410.png' },
    { name: 'James Tarkowski', webName: 'Tarkowski', pos: 'DEF', price: 4.8, photo: 'https://media.api-sports.io/football/players/18859.png' },
    { name: 'Jarrad Branthwaite', webName: 'Branthwaite', pos: 'DEF', price: 4.8, photo: 'https://media.api-sports.io/football/players/152969.png' },
    { name: 'Vitalii Mykolenko', webName: 'Mykolenko', pos: 'DEF', price: 4.4, photo: 'https://media.api-sports.io/football/players/644.png' },
    { name: 'Dwight McNeil', webName: 'McNeil', pos: 'MID', price: 5.7, photo: 'https://media.api-sports.io/football/players/18974.png' },
    { name: 'Iliman Ndiaye', webName: 'Ndiaye', pos: 'MID', price: 5.4, photo: 'https://media.api-sports.io/football/players/162825.png' },
    { name: 'Jack Harrison', webName: 'Harrison', pos: 'MID', price: 5.3, photo: 'https://media.api-sports.io/football/players/18975.png' },
    { name: 'Dominic Calvert-Lewin', webName: 'Calvert-Lewin', pos: 'FWD', price: 6.0, photo: 'https://media.api-sports.io/football/players/2411.png' }
  ],
  // Ipswich (57)
  57: [
    { name: 'Arijanet Muric', webName: 'Muric', pos: 'GKP', price: 4.4, photo: 'https://media.api-sports.io/football/players/630.png' },
    { name: 'Leif Davis', webName: 'Davis', pos: 'DEF', price: 4.5, photo: 'https://media.api-sports.io/football/players/152970.png' },
    { name: 'Jacob Greaves', webName: 'Greaves', pos: 'DEF', price: 4.0, photo: 'https://media.api-sports.io/football/players/152971.png' },
    { name: 'Omari Hutchinson', webName: 'Hutchinson', pos: 'MID', price: 5.2, photo: 'https://media.api-sports.io/football/players/284326.png' },
    { name: 'Sammie Szmodics', webName: 'Szmodics', pos: 'MID', price: 5.8, photo: 'https://media.api-sports.io/football/players/18976.png' },
    { name: 'Liam Delap', webName: 'Delap', pos: 'FWD', price: 5.6, photo: 'https://media.api-sports.io/football/players/162826.png' }
  ],
  // Leeds (63)
  63: [
    { name: 'Illan Meslier', webName: 'Meslier', pos: 'GKP', price: 4.5, photo: 'https://media.api-sports.io/football/players/18930.png' },
    { name: 'Pascal Struijk', webName: 'Struijk', pos: 'DEF', price: 4.4, photo: 'https://media.api-sports.io/football/players/18977.png' },
    { name: 'Junior Firpo', webName: 'Firpo', pos: 'DEF', price: 4.4, photo: 'https://media.api-sports.io/football/players/47520.png' },
    { name: 'Daniel James', webName: 'James', pos: 'MID', price: 5.5, photo: 'https://media.api-sports.io/football/players/910.png' },
    { name: 'Wilfried Gnonto', webName: 'Gnonto', pos: 'MID', price: 5.5, photo: 'https://media.api-sports.io/football/players/162827.png' },
    { name: 'Joël Piroe', webName: 'Piroe', pos: 'FWD', price: 5.5, photo: 'https://media.api-sports.io/football/players/152999.png' }
  ],
  // Sunderland (746)
  746: [
    { name: 'Robin Roefs', webName: 'Roefs', pos: 'GKP', price: 4.4, photo: 'https://media.api-sports.io/football/players/284327.png' },
    { name: 'Dan Ballard', webName: 'Ballard', pos: 'DEF', price: 4.2, photo: 'https://media.api-sports.io/football/players/152972.png' },
    { name: 'Trai Hume', webName: 'Hume', pos: 'DEF', price: 4.2, photo: 'https://media.api-sports.io/football/players/152973.png' },
    { name: 'Jobe Bellingham', webName: 'Bellingham', pos: 'MID', price: 5.2, photo: 'https://media.api-sports.io/football/players/284328.png' },
    { name: 'Patrick Roberts', webName: 'Roberts', pos: 'MID', price: 5.0, photo: 'https://media.api-sports.io/football/players/18978.png' },
    { name: 'Wilson Isidor', webName: 'Isidor', pos: 'FWD', price: 5.2, photo: 'https://media.api-sports.io/football/players/162828.png' }
  ],
  // Hull City (64)
  64: [
    { name: 'Ivor Pandur', webName: 'Pandur', pos: 'GKP', price: 4.4, photo: 'https://media.api-sports.io/football/players/162829.png' },
    { name: 'Alfie Jones', webName: 'Jones', pos: 'DEF', price: 4.2, photo: 'https://media.api-sports.io/football/players/152974.png' },
    { name: 'Lewie Coyle', webName: 'Coyle', pos: 'DEF', price: 4.2, photo: 'https://media.api-sports.io/football/players/152975.png' },
    { name: 'Regan Slater', webName: 'Slater', pos: 'MID', price: 4.8, photo: 'https://media.api-sports.io/football/players/18979.png' },
    { name: 'Liam Millar', webName: 'Millar', pos: 'MID', price: 5.0, photo: 'https://media.api-sports.io/football/players/162830.png' },
    { name: 'Chris Bedia', webName: 'Bedia', pos: 'FWD', price: 5.0, photo: 'https://media.api-sports.io/football/players/153000.png' }
  ],
  // Coventry (1346)
  1346: [
    { name: 'Oliver Dovin', webName: 'Dovin', pos: 'GKP', price: 4.4, photo: 'https://media.api-sports.io/football/players/162831.png' },
    { name: 'Bobby Thomas', webName: 'Thomas', pos: 'DEF', price: 4.2, photo: 'https://media.api-sports.io/football/players/152976.png' },
    { name: 'Milan van Ewijk', webName: 'Van Ewijk', pos: 'DEF', price: 4.4, photo: 'https://media.api-sports.io/football/players/138807.png' },
    { name: 'Jack Rudoni', webName: 'Rudoni', pos: 'MID', price: 5.0, photo: 'https://media.api-sports.io/football/players/18980.png' },
    { name: 'Haji Wright', webName: 'Wright', pos: 'FWD', price: 5.8, photo: 'https://media.api-sports.io/football/players/162832.png' },
    { name: 'Ellis Simms', webName: 'Simms', pos: 'FWD', price: 5.4, photo: 'https://media.api-sports.io/football/players/153001.png' }
  ]
};

async function seedGameweeks() {
  console.log('Seeding 38 Gameweeks for Premier League 2026...');

  // Start date in season is around August 2026
  // Gameweek 6 occurred 2026-10-10
  const gwBaseDates = {
    1: new Date('2026-08-22T11:30:00Z'),
    2: new Date('2026-08-29T11:30:00Z'),
    3: new Date('2026-09-12T11:30:00Z'),
    4: new Date('2026-09-19T11:30:00Z'),
    5: new Date('2026-09-26T11:30:00Z'),
    6: new Date('2026-10-10T10:00:00Z'), // Real match kickoff was 11:30 UTC
    7: new Date('2026-10-17T11:30:00Z'), // Current upcoming
  };

  for (let gw = 1; gw <= 38; gw++) {
    const gwId = `gw_pl_2026_${gw}`;
    const deadline = gwBaseDates[gw] || new Date(new Date('2026-10-17T11:30:00Z').getTime() + (gw - 7) * 7 * 24 * 3600 * 1000);
    let status = 'UPCOMING';
    let isCurrent = false;

    if (gw <= 6) {
      status = 'COMPLETED';
    } else if (gw === 7) {
      status = 'UPCOMING';
      isCurrent = true;
    }

    await prisma.$executeRawUnsafe(
      `INSERT INTO fantasy_gameweeks (id, gameweekNumber, seasonYear, competitionId, name, deadline, status, isCurrent, totalFixtures, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 10, NOW(3), NOW(3))
       ON DUPLICATE KEY UPDATE name = VALUES(name), deadline = VALUES(deadline), status = VALUES(status), isCurrent = VALUES(isCurrent), updatedAt = NOW(3)`,
      gwId,
      gw,
      SEASON_YEAR,
      PL_COMP_ID,
      `Gameweek ${gw}`,
      deadline,
      status,
      isCurrent
    );
  }

  // Connect Gameweek 6 to the 10 real matches in season 2026
  const gw6Matches = await prisma.match.findMany({
    where: {
      competitionId: PL_COMP_ID,
      season: { year: SEASON_YEAR },
      round: 'Regular Season - 6'
    }
  });

  console.log(`Found ${gw6Matches.length} matches in Regular Season - 6.`);
  for (const match of gw6Matches) {
    const gwFixtureId = `gwf_${match.id}`;
    await prisma.$executeRawUnsafe(
      `INSERT INTO fantasy_gameweek_fixtures (id, gameweekId, matchId, isScored, createdAt)
       VALUES (?, ?, ?, TRUE, NOW(3))
       ON DUPLICATE KEY UPDATE isScored = TRUE`,
      gwFixtureId,
      'gw_pl_2026_6',
      match.id
    );
  }
  console.log('Gameweeks 1-38 seeded and GW6 fixtures linked.');
}

async function seedPlayerCatalogue() {
  console.log('Seeding Premier League Fantasy Players Catalogue...');

  // Load all 20 teams
  const teams = await prisma.team.findMany({
    where: {
      OR: [
        { homeMatches: { some: { season: { year: SEASON_YEAR }, competitionId: PL_COMP_ID } } },
        { awayMatches: { some: { season: { year: SEASON_YEAR }, competitionId: PL_COMP_ID } } }
      ]
    }
  });

  const teamByProvider = new Map();
  teams.forEach(t => teamByProvider.set(t.providerId, t));

  let totalInserted = 0;

  for (const [providerIdStr, players] of Object.entries(PL_ROSTERS)) {
    const providerId = parseInt(providerIdStr, 10);
    const team = teamByProvider.get(providerId);
    if (!team) {
      console.warn(`Team with providerId ${providerId} not found in DB!`);
      continue;
    }

    const shortName = team.code || team.name.substring(0, 3).toUpperCase();

    for (const p of players) {
      const pId = `fp_${providerId}_${p.webName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

      await prisma.$executeRawUnsafe(
        `INSERT INTO fantasy_players (
          id, playerId, providerPlayerId, name, webName, teamId, teamProviderId, teamShortName,
          position, price, startPrice, status, chanceOfPlaying, totalPoints,
          photo, selectedByPercent, createdAt, updatedAt
        ) VALUES (
          ?, NULL, NULL, ?, ?, ?, ?, ?,
          ?, ?, ?, 'AVAILABLE', 100, 0,
          ?, 5.0, NOW(3), NOW(3)
        ) ON DUPLICATE KEY UPDATE
          name = VALUES(name), webName = VALUES(webName), price = VALUES(price),
          position = VALUES(position), photo = VALUES(photo), teamShortName = VALUES(teamShortName), updatedAt = NOW(3)`,
        pId,
        p.name,
        p.webName,
        team.id,
        team.providerId,
        shortName,
        p.pos,
        p.price,
        p.price,
        p.photo
      );
      totalInserted++;
    }
  }

  console.log(`Seeded ${totalInserted} Fantasy Players across 20 clubs.`);
}

async function main() {
  await seedGameweeks();
  await seedPlayerCatalogue();
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
