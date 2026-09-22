-- Football Ingestion Schema for MyScore24
-- Database: PostgreSQL / Supabase

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Countries
CREATE TABLE IF NOT EXISTS countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10),
    flag_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Leagues
CREATE TABLE IF NOT EXISTS leagues (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    country_id INT REFERENCES countries(id) ON DELETE SET NULL,
    logo_url TEXT,
    type VARCHAR(50) DEFAULT 'league',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seasons
CREATE TABLE IF NOT EXISTS seasons (
    id SERIAL PRIMARY KEY,
    league_id INT NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
    year VARCHAR(20) NOT NULL,
    is_current BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(league_id, year)
);

-- Teams
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    short_name VARCHAR(50),
    code VARCHAR(10),
    logo_url TEXT,
    country_id INT REFERENCES countries(id) ON DELETE SET NULL,
    venue_name VARCHAR(150),
    venue_city VARCHAR(100),
    venue_capacity INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Matches
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    league_id INT NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
    season_id INT REFERENCES seasons(id) ON DELETE SET NULL,
    home_team_id INT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    away_team_id INT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    match_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'NS', -- NS, 1H, HT, 2H, FT, AET, PEN, CANC, POSTP
    elapsed INT DEFAULT 0,
    home_score INT DEFAULT 0,
    away_score INT DEFAULT 0,
    venue VARCHAR(150),
    round VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Match Events
CREATE TABLE IF NOT EXISTS match_events (
    id SERIAL PRIMARY KEY,
    match_id INT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    minute INT NOT NULL,
    extra_minute INT,
    team_id INT REFERENCES teams(id) ON DELETE SET NULL,
    player_name VARCHAR(150),
    type VARCHAR(50) NOT NULL, -- Goal, Card, Substitution, Var
    detail VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Match Statistics
CREATE TABLE IF NOT EXISTS match_stats (
    id SERIAL PRIMARY KEY,
    match_id INT UNIQUE NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    home_possession INT DEFAULT 50,
    away_possession INT DEFAULT 50,
    home_shots INT DEFAULT 0,
    away_shots INT DEFAULT 0,
    home_shots_on_target INT DEFAULT 0,
    away_shots_on_target INT DEFAULT 0,
    home_corners INT DEFAULT 0,
    away_corners INT DEFAULT 0,
    home_fouls INT DEFAULT 0,
    away_fouls INT DEFAULT 0,
    home_yellow_cards INT DEFAULT 0,
    away_yellow_cards INT DEFAULT 0,
    home_red_cards INT DEFAULT 0,
    away_red_cards INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Standings
CREATE TABLE IF NOT EXISTS standings (
    id SERIAL PRIMARY KEY,
    league_id INT NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
    season_id INT REFERENCES seasons(id) ON DELETE SET NULL,
    team_id INT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    rank INT NOT NULL,
    points INT NOT NULL DEFAULT 0,
    played INT NOT NULL DEFAULT 0,
    won INT NOT NULL DEFAULT 0,
    drawn INT NOT NULL DEFAULT 0,
    lost INT NOT NULL DEFAULT 0,
    goals_for INT NOT NULL DEFAULT 0,
    goals_against INT NOT NULL DEFAULT 0,
    form VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(league_id, team_id)
);

-- Ingestion Logs
CREATE TABLE IF NOT EXISTS ingestion_logs (
    id SERIAL PRIMARY KEY,
    source VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL, -- SUCCESS, WARNING, FAILED, BLOCKED_BY_CLOUDFLARE
    matches_processed INT DEFAULT 0,
    message TEXT,
    execution_time_ms INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_league ON matches(league_id);
CREATE INDEX IF NOT EXISTS idx_standings_league ON standings(league_id, rank);
