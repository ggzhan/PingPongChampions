
// In a real application, this would be a database.
// For this example, we're using an in-memory store.
import type { League, User, Match, Player, PlayerStats } from './types';

let users: User[] = [
  { id: 'user-1', name: 'AlpacaRacer', email: 'john.doe@example.com', showEmail: false },
  { id: 'user-2', name: 'Bob', email: 'bob@example.com' },
  { id: 'user-3', name: 'Charlie', email: 'charlie@example.com' },
  { id: 'user-4', name: 'Diana', email: 'diana@example.com' },
  { id: 'user-5', name: 'Eve', email: 'eve@example.com' },
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
    playerAName: 'AlpacaRacer',
    playerBName: 'Bob',
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
    playerAScore: 2,
    playerBScore: 3,
    winnerId: 'user-4',
    eloChangeA: -16,
    eloChangeB: 16,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

let leagues: League[] = [
  {
    id: 'league-1',
    name: 'Office Champions League',
    description: 'The official ping pong league for the office. Settle your disputes over the table.',
    adminIds: ['user-1'],
    players: [
      { id: 'user-1', name: 'AlpacaRacer', email: 'john.doe@example.com', showEmail: false, elo: 1016, wins: 1, losses: 0 },
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
  const league = leagues.find(l => l.id === id);
  return Promise.resolve(league ? JSON.parse(JSON.stringify(league)) : undefined);
}

export async function createLeague(leagueData: Omit<League, 'id' | 'players' | 'matches'>): Promise<League> {
  const user = users.find(u => u.id === leagueData.adminIds[0]);
  if (!user) {
    throw new Error("Admin user not found");
  }
  
  const newPlayer: Player = {
    id: user.id,
    name: user.name,
    email: user.email,
    showEmail: user.showEmail,
    elo: 1000,
    wins: 0,
    losses: 0,
  }

  const newLeague: League = {
    id: `league-${Date.now()}`,
    ...leagueData,
    players: [newPlayer],
    matches: [],
  };
  leagues.push(newLeague);
  return Promise.resolve(newLeague);
}

export async function getPlayerStats(leagueId: string, playerId: string): Promise<PlayerStats | undefined> {
  const league = await getLeagueById(leagueId);
  if (!league || !league.players) return undefined;

  const player = league.players.find(p => p.id === playerId);
  if (!player) return undefined;

  const sortedPlayers = [...league.players].sort((a, b) => b.elo - a.elo);
  const rank = sortedPlayers.findIndex(p => p.id === playerId) + 1;

  const matchHistory = (league.matches || []).filter(m => m.playerAId === playerId || m.playerBId === playerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
  const eloHistory = [{ date: '2023-01-01', elo: 1000 }];
  let currentElo = 1000;
  
  (league.matches || [])
    .filter(m => m.playerAId === playerId || m.playerBId === playerId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(a.createdAt).getTime())
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
    const won = match.winnerId === playerId;

    if (!headToHead[opponentId]) {
      headToHead[opponentId] = { opponentName, wins: 0, losses: 0, matches: 0 };
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

export async function addUserToLeague(leagueId: string, userId: string): Promise<void> {
  const league = leagues.find(l => l.id === leagueId);
  const user = users.find(u => u.id === userId);

  if (league && user && !league.players.some(p => p.id === userId)) {
    const newPlayer: Player = {
      ...user,
      elo: 1000,
      wins: 0,
      losses: 0,
    };
    if (!league.players) league.players = [];
    league.players.push(newPlayer);
  }
  return Promise.resolve();
}

export async function updateUserInLeagues(user: User): Promise<void> {
    users = users.map(u => u.id === user.id ? {...u, ...user} : u);
    
    leagues = leagues.map(league => {
        return {
            ...league,
            players: league.players.map(player => {
                if (player.id === user.id) {
                    return { ...player, name: user.name, email: user.email, showEmail: user.showEmail };
                }
                return player;
            }),
            matches: (league.matches || []).map(match => {
                if (match.playerAId === user.id) {
                    match.playerAName = user.name;
                }
                if (match.playerBId === user.id) {
                    match.playerBName = user.name;
                }
                return match;
            })
        }
    });

    return Promise.resolve();
}
