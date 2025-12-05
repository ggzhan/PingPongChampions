
export type User = {
  id: string;
  name: string;
  email: string;
  showEmail?: boolean;
};

export type Player = User & {
  elo: number;
  wins: number;
  losses: number;
  status: 'active' | 'inactive';
};

export type Match = {
  id: string;
  leagueId: string;
  playerAId: string;
  playerBId: string;
  playerAName: string;
  playerBName: string;
  playerAScore: number;
  playerBScore: number;
  winnerId: string;
  eloChangeA: number;
  eloChangeB: number;
  createdAt: string; // ISO date string
};

export type League = {
  id: string;
  name: string;
  description: string;
  adminIds: string[];
  players: Player[];
  matches: Match[];
  activePlayerCount?: number;
};

export type EloHistory = {
  date: string; // YYYY-MM-DD
  elo: number;
};

export type PlayerStats = {
  player: Player;
  leagueId: string;
  rank: number;
  eloHistory: EloHistory[];
  matchHistory: Match[];
  headToHead: {
    [opponentId: string]: {
      opponentName: string;
      wins: number;
      losses: number;
      matches: number;
    };
  };
};
