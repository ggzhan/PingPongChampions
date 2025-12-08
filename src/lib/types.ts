
import type { Timestamp } from 'firebase/firestore';

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
  createdAt?: string; // ISO date string
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
  privacy: 'public' | 'private';
  leaderboardVisible?: boolean;
  inviteCode?: string | null;
  adminIds: string[];
  players: Player[];
  matches: Match[];
  activePlayerCount?: number;
  createdAt: Timestamp | string;
};

export type EloHistory = {
  date: string;
  elo: number;
  matchIndex: number;
};

export type PlayerStats = {
  player: Player;
  leagueId: string;
  rank: number;
  matchHistory: Match[];
  eloHistory: EloHistory[];
  headToHeadStats: {
    opponentId: string;
    opponentName: string;
    wins: number;
    losses: number;
  }[];
};

export type MatchResult = {
    playerAId: string;
    playerBId: string;
    playerAScore: number;
    playerBScore: number;
    winnerId: string;
};
