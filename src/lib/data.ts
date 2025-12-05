
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

const g = globalThis as unknown as { dataStore: { users: User[], leagues: League[] } };

function generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

if (!g.dataStore) {
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
      privacy: 'public',
      adminIds: ['user-1'],
      players: [
        { id: 'user-1', name: 'AlpacaRacer', email: 'john.doe@example.com', showEmail: false, elo: 1016, wins: 1, losses: 0, status: 'active', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { ...initialPlayers[1], elo: 984, wins: 0, losses: 1, showEmail: false, status: 'active', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { ...initialPlayers[2], elo: 984, wins: 0, losses: 1, showEmail: false, status: 'active', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { ...initialPlayers[3], elo: 1016, wins: 1, losses: 0, showEmail: false, status: 'active', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      ],
      matches: initialMatches,
    },
    {
      id: 'league-2',
      name: 'Weekend Warriors',
      description: 'A casual league for weekend games.',
      privacy: 'private',
      leaderboardVisible: true,
      inviteCode: generateInviteCode(),
      adminIds: ['user-1', 'user-3'],
      players: initialUsers.slice(2, 5).map(user => ({...user, elo: 1000, wins: 0, losses: 0, status: 'active', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()})),
      matches: [],
    }
  ];

  g.dataStore = {
    users: initialUsers,
    leagues: initialLeagues
  };
}


// API-like functions
export async function getLeagues(): Promise<League[]> {
  // Create a deep copy to avoid mutations affecting the original data store
  const leagues = JSON.parse(JSON.stringify(g.dataStore.leagues));
  return Promise.resolve(leagues.map(league => ({
    ...league,
    activePlayerCount: league.players.filter(p => p.status === 'active').length
  })));
}

export async function getLeagueById(id: string): Promise<League | undefined> {
  const league = g.dataStore.leagues.find(l => l.id === id);
  return Promise.resolve(league ? JSON.parse(JSON.stringify(league)) : undefined);
}

export async function createLeague(leagueData: Omit<League, 'id' | 'players' | 'matches' | 'inviteCode' | 'activePlayerCount'>): Promise<League> {
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
    status: 'active',
    createdAt: new Date().toISOString()
  };

  const newLeague: League = {
    id: `league-${Date.now()}`,
    ...leagueData,
    inviteCode: leagueData.privacy === 'private' ? generateInviteCode() : undefined,
    players: [newPlayer],
    matches: [],
  };
  g.dataStore.leagues.push(newLeague);
  return Promise.resolve(JSON.parse(JSON.stringify(newLeague)));
}

export async function updateLeague(id: string, updates: Partial<Pick<League, 'name' | 'description' | 'privacy' | 'leaderboardVisible'>>): Promise<League> {
  const leagueIndex = g.dataStore.leagues.findIndex(l => l.id === id);
  if (leagueIndex === -1) {
    throw new Error("League not found");
  }

  const league = g.dataStore.leagues[leagueIndex];
  league.name = updates.name ?? league.name;
  league.description = updates.description ?? league.description;
  league.leaderboardVisible = updates.leaderboardVisible ?? league.leaderboardVisible;
  
  if (updates.privacy && updates.privacy !== league.privacy) {
    league.privacy = updates.privacy;
    if (league.privacy === 'private' && !league.inviteCode) {
        league.inviteCode = generateInviteCode();
    }
  }

  g.dataStore.leagues[leagueIndex] = league;
  return Promise.resolve(JSON.parse(JSON.stringify(g.dataStore.leagues[leagueIndex])));
}

export async function regenerateInviteCode(leagueId: string): Promise<string | undefined> {
    const leagueIndex = g.dataStore.leagues.findIndex(l => l.id === leagueId);
    if (leagueIndex === -1) throw new Error("League not found");

    const league = g.dataStore.leagues[leagueIndex];
    if (league.privacy !== 'private') return undefined;

    league.inviteCode = generateInviteCode();
    g.dataStore.leagues[leagueIndex] = league;
    return Promise.resolve(league.inviteCode);
}

export async function deleteLeague(leagueId: string): Promise<void> {
  const leagueIndex = g.dataStore.leagues.findIndex(l => l.id === leagueId);
  if (leagueIndex > -1) {
    g.dataStore.leagues.splice(leagueIndex, 1);
  }
  return Promise.resolve();
}

export async function getPlayerStats(leagueId: string, playerId: string): Promise<PlayerStats | undefined> {
  const league = await getLeagueById(leagueId);
  if (!league || !league.players) return undefined;

  const playerInfo = league.players.find(p => p.id === playerId);
  if (!playerInfo) return undefined;

  const allMatchesForPlayer = (league.matches || [])
    .filter(m => m.playerAId === playerId || m.playerBId === playerId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Return undefined if the player has no matches and isn't the one viewing their own new profile
  if (allMatchesForPlayer.length === 0) {
      // Allow viewing profile if there are no matches
  }

  // --- ELO, W/L, and Head-to-Head Calculation ---
  let currentElo = 1000;
  let wins = 0;
  let losses = 0;
  const headToHead: PlayerStats['headToHead'] = {};
  const eloHistory: EloHistory[] = [];
  const joinDate = playerInfo.createdAt ? new Date(playerInfo.createdAt) : new Date();
  const dayBeforeJoin = new Date(joinDate);
  dayBeforeJoin.setDate(dayBeforeJoin.getDate() - 1);
  eloHistory.push({ date: dayBeforeJoin.toISOString().split('T')[0], elo: 1000 });


  allMatchesForPlayer.forEach(match => {
    const isPlayerA = match.playerAId === playerId;
    const eloChange = isPlayerA ? match.eloChangeA : match.eloChangeB;
    const won = match.winnerId === playerId;
    const opponentId = isPlayerA ? match.playerBId : match.playerAId;
    const opponentName = isPlayerA ? match.playerBName : match.playerAName;

    currentElo += eloChange;
    eloHistory.push({ date: new Date(match.createdAt).toISOString().split('T')[0], elo: currentElo });

    if (won) {
      wins++;
    } else {
      losses++;
    }

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
  
  // Create a final player object with all calculated stats
  const player: Player = {
    ...playerInfo,
    elo: currentElo,
    wins: wins,
    losses: losses,
  };
  
  // If no matches, ensure current ELO is represented
  if (allMatchesForPlayer.length === 0) {
       eloHistory.push({ date: new Date().toISOString().split('T')[0], elo: player.elo });
  }


  const activePlayers = league.players.filter(p => p.status === 'active');
  // Recalculate all player ELOs for accurate ranking
  const rankedPlayers = activePlayers.map(p => {
    let elo = 1000;
    (league.matches || []).filter(m => m.playerAId === p.id || m.playerBId === p.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .forEach(m => {
        elo += m.playerAId === p.id ? m.eloChangeA : m.eloChangeB;
      });
    return {...p, elo};
  }).sort((a, b) => b.elo - a.elo);

  const rank = rankedPlayers.findIndex(p => p.id === playerId) + 1;

  const matchHistory = [...allMatchesForPlayer].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return Promise.resolve({
    player,
    leagueId,
    rank: player.status === 'active' ? rank : -1,
    eloHistory,
    matchHistory,
    headToHead,
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
        createdAt: new Date().toISOString(),
      };
      if (!league.players) league.players = [];
      league.players.push(newPlayer);
    }
  }
  return Promise.resolve();
}

export async function joinLeagueByInviteCode(inviteCode: string, userId: string, leagueId: string): Promise<League> {
    const league = g.dataStore.leagues.find(l => l.id === leagueId && l.inviteCode === inviteCode && l.privacy === 'private');
    if (!league) {
        throw new Error("Invalid invite code or league does not match.");
    }
    await addUserToLeague(league.id, userId);
    return Promise.resolve(JSON.parse(JSON.stringify(league)));
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

function calculateEloChange(playerElo: number, opponentElo: number, result: 'win' | 'loss'): number {
  const K = 32; // K-factor determines how much the ELO rating is updated
  const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  const actualScore = result === 'win' ? 1 : 0;
  return Math.round(K * (actualScore - expectedScore));
}

export async function recordMatch(
  leagueId: string,
  formData: {
    playerAId: string;
    playerBId: string;
    playerAScore: number;
    playerBScore: number;
    winnerId: string;
  }
): Promise<Match> {
  const leagueIndex = g.dataStore.leagues.findIndex(l => l.id === leagueId);
  if (leagueIndex === -1) {
    throw new Error('League not found');
  }

  const league = g.dataStore.leagues[leagueIndex];
  const playerA = league.players.find(p => p.id === formData.playerAId);
  const playerB = league.players.find(p => p.id === formData.playerBId);

  if (!playerA || !playerB) {
    throw new Error('One or both players not found in the league');
  }

  const eloChangeA = calculateEloChange(playerA.elo, playerB.elo, formData.winnerId === playerA.id ? 'win' : 'loss');
  const eloChangeB = calculateEloChange(playerB.elo, playerA.elo, formData.winnerId === playerB.id ? 'win' : 'loss');

  // Update player stats
  playerA.elo += eloChangeA;
  playerA.wins += formData.winnerId === playerA.id ? 1 : 0;
  playerA.losses += formData.winnerId === playerA.id ? 0 : 1;

  playerB.elo += eloChangeB;
  playerB.wins += formData.winnerId === playerB.id ? 1 : 0;
  playerB.losses += formData.winnerId === playerB.id ? 0 : 1;

  const newMatch: Match = {
    id: `match-${Date.now()}`,
    leagueId,
    ...formData,
    playerAName: playerA.name,
    playerBName: playerB.name,
    eloChangeA,
    eloChangeB,
    createdAt: new Date().toISOString(),
  };

  league.matches.push(newMatch);

  g.dataStore.leagues[leagueIndex] = league;

  return Promise.resolve(JSON.parse(JSON.stringify(newMatch)));
}
