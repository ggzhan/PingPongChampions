
// In a real application, this would be a database.
// For this example, we're using an in-memory store.
// We attach it to the global object to prevent it from being cleared on hot-reloads.
import type { League, User, Match, Player, PlayerStats, EloHistory } from './types';

declare global {
  var dataStore: {
    users: User[];
    leagues: League[];
  }
}

const initialUsers: User[] = [
  { id: 'user-1', name: 'AlpacaRacer', email: 'john.doe@example.com', showEmail: false },
  { id: 'user-2', name: 'Bob', email: 'bob@example.com', showEmail: false },
  { id: 'user-3', name: 'Charlie', email: 'charlie@example.com', showEmail: false },
  { id: 'user-4', name: 'Diana', email: 'diana@example.com', showEmail: false },
  { id: 'user-5', name: 'Eve', email: 'eve@example.com', showEmail: false },
];

const initialPlayers: Player[] = initialUsers.slice(0, 4).map(user => ({
  ...user,
  elo: 1000,
  wins: 0,
  losses: 0,
  status: 'active'
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

const initialLeagues: League[] = [
  {
    id: 'league-1',
    name: 'Office Champions League',
    description: 'The official ping pong league for the office. Settle your disputes over the table.',
    adminIds: ['user-1'],
    players: [
      { id: 'user-1', name: 'AlpacaRacer', email: 'john.doe@example.com', showEmail: false, elo: 1016, wins: 1, losses: 0, status: 'active' },
      { ...initialPlayers[1], elo: 984, wins: 0, losses: 1, showEmail: false, status: 'active' },
      { ...initialPlayers[2], elo: 984, wins: 0, losses: 1, showEmail: false, status: 'active' },
      { ...initialPlayers[3], elo: 1016, wins: 1, losses: 0, showEmail: false, status: 'active' },
    ],
    matches: initialMatches,
  },
  {
    id: 'league-2',
    name: 'Weekend Warriors',
    description: 'A casual league for weekend games.',
    adminIds: ['user-1', 'user-3'],
    players: initialUsers.slice(2, 5).map(user => ({...user, elo: 1000, wins: 0, losses: 0, status: 'active'})),
    matches: [],
  }
];

const g = globalThis as unknown as { dataStore: { users: User[], leagues: League[] } };

if (process.env.NODE_ENV === 'production') {
  g.dataStore = {
    users: initialUsers,
    leagues: initialLeagues
  };
} else {
  if (!g.dataStore) {
    g.dataStore = {
      users: initialUsers,
      leagues: initialLeagues
    };
  }
}

// API-like functions
export async function getLeagues(): Promise<League[]> {
  // In a real app, you'd fetch this from a database
  return Promise.resolve(JSON.parse(JSON.stringify(g.dataStore.leagues)));
}

export async function getLeagueById(id: string): Promise<League | undefined> {
  const league = g.dataStore.leagues.find(l => l.id === id);
  return Promise.resolve(league ? JSON.parse(JSON.stringify(league)) : undefined);
}

export async function createLeague(leagueData: Omit<League, 'id' | 'players' | 'matches'>): Promise<League> {
  const user = g.dataStore.users.find(u => u.id === leagueData.adminIds[0]);
  if (!user) {
    throw new Error("Admin user not found");
  }
  
  const newPlayer: Player = {
    id: user.id,
    name: user.name,
    email: user.email,
    showEmail: !!user.showEmail,
    elo: 1000,
    wins: 0,
    losses: 0,
    status: 'active'
  }

  const newLeague: League = {
    id: `league-${Date.now()}`,
    ...leagueData,
    players: [newPlayer],
    matches: [],
  };
  g.dataStore.leagues.push(newLeague);
  return Promise.resolve(JSON.parse(JSON.stringify(newLeague)));
}

export async function updateLeague(id: string, updates: Partial<Pick<League, 'name' | 'description'>>): Promise<League> {
  const leagueIndex = g.dataStore.leagues.findIndex(l => l.id === id);
  if (leagueIndex === -1) {
    throw new Error("League not found");
  }
  g.dataStore.leagues[leagueIndex] = { ...g.dataStore.leagues[leagueIndex], ...updates };
  return Promise.resolve(JSON.parse(JSON.stringify(g.dataStore.leagues[leagueIndex])));
}

export async function getPlayerStats(leagueId: string, playerId: string): Promise<PlayerStats | undefined> {
  const league = await getLeagueById(leagueId);
  if (!league || !league.players) return undefined;

  const player = league.players.find(p => p.id === playerId);
  if (!player) return undefined;

  const activePlayers = league.players.filter(p => p.status === 'active');
  const sortedPlayers = [...activePlayers].sort((a, b) => b.elo - a.elo);
  const rank = sortedPlayers.findIndex(p => p.id === playerId) + 1;

  const matchHistory = (league.matches || []).filter(m => m.playerAId === playerId || m.playerBId === playerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
  const eloHistory: EloHistory[] = [];
  
  const allMatchesChronological = [...matchHistory].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  
  let currentElo = player.elo;
  let runningElo = currentElo;

  for (let i = allMatchesChronological.length - 1; i >= 0; i--) {
      eloHistory.push({
          date: new Date(allMatchesChronological[i].createdAt).toISOString().split('T')[0],
          elo: runningElo
      });
      const match = allMatchesChronological[i];
      const eloChange = match.playerAId === playerId ? match.eloChangeA : match.eloChangeB;
      runningElo -= eloChange;
  }
  
  eloHistory.push({
    date: allMatchesChronological.length > 0
        ? new Date(new Date(allMatchesChronological[0].createdAt).getTime() - 86400000).toISOString().split('T')[0]
        : new Date(Date.now() - 86400000).toISOString().split('T')[0],
    elo: runningElo
  });

  if (matchHistory.length === 0) {
      eloHistory.push({ date: new Date().toISOString().split('T')[0], elo: player.elo });
  }

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

  return Promise.resolve({
    player,
    leagueId,
    rank: player.status === 'active' ? rank : -1,
    eloHistory: eloHistory.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    matchHistory,
    headToHead
  });
}

export async function addUserToLeague(leagueId: string, userId: string): Promise<void> {
  const league = g.dataStore.leagues.find(l => l.id === leagueId);
  const user = g.dataStore.users.find(u => u.id === userId);

  if (league && user) {
    const existingPlayer = league.players.find(p => p.id === userId);
    if (existingPlayer) {
      existingPlayer.status = 'active';
    } else {
       const newPlayer: Player = {
        ...user,
        elo: 1000,
        wins: 0,
        losses: 0,
        status: 'active',
        showEmail: !!user.showEmail,
      };
      if (!league.players) league.players = [];
      league.players.push(newPlayer);
    }
  }
  return Promise.resolve();
}

export async function removePlayerFromLeague(leagueId: string, userId: string): Promise<void> {
  const league = g.dataStore.leagues.find(l => l.id === leagueId);
  if (league) {
    const player = league.players.find(p => p.id === userId);
    if (player) {
      player.status = 'inactive';
    }
  }
  return Promise.resolve();
}

export async function updateUserInLeagues(user: User): Promise<void> {
    g.dataStore.users = g.dataStore.users.map(u => u.id === user.id ? {...u, ...user} : u);
    
    g.dataStore.leagues = g.dataStore.leagues.map(league => {
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

export async function deleteUserAccount(userId: string): Promise<void> {
  // Anonymize user in the main user list
  const user = g.dataStore.users.find(u => u.id === userId);
  if (user) {
    user.name = "Deleted User";
    user.email = "";
    user.showEmail = false;
  }

  // Anonymize user and set to inactive across all leagues
  g.dataStore.leagues.forEach(league => {
    const player = league.players.find(p => p.id === userId);
    if (player) {
      player.name = "Deleted User";
      player.email = "";
      player.showEmail = false;
      player.status = 'inactive';
    }
    league.matches.forEach(match => {
      if (match.playerAId === userId) {
        match.playerAName = "Deleted User";
      }
      if (match.playerBId === userId) {
        match.playerBName = "Deleted User";
      }
    });
  });

  return Promise.resolve();
}
