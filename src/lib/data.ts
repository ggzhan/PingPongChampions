// In a real application, this would be a database.
// For this example, we're using an in-memory store.
import type { League, User, Match, Player, PlayerStats } from './types';
import { PlaceHolderImages } from './placeholder-images';

const avatar1 = PlaceHolderImages.find(p => p.id === 'avatar1')?.imageUrl || '';
const avatar2 = PlaceHolderImages.find(p => p.id === 'avatar2')?.imageUrl || '';
const avatar3 = PlaceHolderImages.find(p => p.id === 'avatar3')?.imageUrl || '';
const avatar4 = PlaceHolderImages.find(p => p.id === 'avatar4')?.imageUrl || '';
const avatar5 = PlaceHolderImages.find(p => p.id === 'avatar5')?.imageUrl || '';

const users: User[] = [
  { id: 'user-1', name: 'Alice', email: 'alice@example.com', avatarUrl: avatar1 },
  { id: 'user-2', name: 'Bob', email: 'bob@example.com', avatarUrl: avatar2 },
  { id: 'user-3', name: 'Charlie', email: 'charlie@example.com', avatarUrl: avatar3 },
  { id: 'user-4', name: 'Diana', email: 'diana@example.com', avatarUrl: avatar4 },
  { id: 'user-5', name: 'Eve', email: 'eve@example.com', avatarUrl: avatar5 },
];

const initialPlayers: Player[] = users.slice(0, 4).map(user => ({
  ...user,
  elo: 1000,
  wins: 0,
  losses: 0,
}));

const initialMatches: Match[] = [
  {
    id: 'match-1',
    leagueId: 'league-1',
    playerAId: 'user-1',
    playerBId: 'user-2',
    playerAName: 'Alice',
    playerBName: 'Bob',
    playerAAvatar: avatar1,
    playerBAvatar: avatar2,
    playerAScore: 3,
    playerBScore: 1,
    winnerId: 'user-1',
    eloChangeA: 16,
    eloChangeB: -16,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'match-2',
    leagueId: 'league-1',
    playerAId: 'user-3',
    playerBId: 'user-4',
    playerAName: 'Charlie',
    playerBName: 'Diana',
    playerAAvatar: avatar3,
    playerBAvatar: avatar4,
    playerAScore: 2,
    playerBScore: 3,
    winnerId: 'user-4',
    eloChangeA: -16,
    eloChangeB: 16,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const leagues: League[] = [
  {
    id: 'league-1',
    name: 'Office Champions League',
    description: 'The official ping pong league for the office. Settle your disputes over the table.',
    adminIds: ['user-1'],
    players: [
      { ...initialPlayers[0], elo: 1016, wins: 1, losses: 0 },
      { ...initialPlayers[1], elo: 984, wins: 0, losses: 1 },
      { ...initialPlayers[2], elo: 984, wins: 0, losses: 1 },
      { ...initialPlayers[3], elo: 1016, wins: 1, losses: 0 },
    ],
    matches: initialMatches,
  },
  {
    id: 'league-2',
    name: 'Weekend Warriors',
    description: 'A casual league for weekend games.',
    adminIds: ['user-3'],
    players: users.slice(2, 5).map(user => ({...user, elo: 1000, wins: 0, losses: 0})),
    matches: [],
  }
];

// API-like functions
export async function getLeagues(): Promise<League[]> {
  // In a real app, you'd fetch this from a database
  return Promise.resolve(leagues);
}

export async function getLeagueById(id: string): Promise<League | undefined> {
  return Promise.resolve(leagues.find(l => l.id === id));
}

export async function getPlayerStats(leagueId: string, playerId: string): Promise<PlayerStats | undefined> {
  const league = await getLeagueById(leagueId);
  if (!league) return undefined;

  const player = league.players.find(p => p.id === playerId);
  if (!player) return undefined;

  const sortedPlayers = [...league.players].sort((a, b) => b.elo - a.elo);
  const rank = sortedPlayers.findIndex(p => p.id === playerId) + 1;

  const matchHistory = league.matches.filter(m => m.playerAId === playerId || m.playerBId === playerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
  const eloHistory = [{ date: '2023-01-01', elo: 1000 }];
  let currentElo = 1000;
  
  league.matches
    .filter(m => m.playerAId === playerId || m.playerBId === playerId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .forEach(match => {
      const eloChange = match.playerAId === playerId ? match.eloChangeA : match.eloChangeB;
      currentElo += eloChange;
      eloHistory.push({
        date: new Date(match.createdAt).toISOString().split('T')[0],
        elo: currentElo
      });
  });

  const headToHead: PlayerStats['headToHead'] = {};
  matchHistory.forEach(match => {
    const isPlayerA = match.playerAId === playerId;
    const opponentId = isPlayerA ? match.playerBId : match.playerAId;
    const opponentName = isPlayerA ? match.playerBName : match.playerAName;
    const opponentAvatar = isPlayerA ? match.playerBAvatar : match.playerAAvatar;
    const won = match.winnerId === playerId;

    if (!headToHead[opponentId]) {
      headToHead[opponentId] = { opponentName, opponentAvatar, wins: 0, losses: 0, matches: 0 };
    }
    headToHead[opponentId].matches++;
    if (won) {
      headToHead[opponentId].wins++;
    } else {
      headToHead[opponentId].losses++;
    }
  });


  return {
    player,
    leagueId,
    rank,
    eloHistory,
    matchHistory,
    headToHead
  };
}
