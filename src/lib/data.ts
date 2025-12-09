
'use client';

import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from '@/firebase';
import type { League, User, Match, Player, PlayerStats, EloHistory } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

function generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// API-like functions
export async function getLeagues(): Promise<League[]> {
    const leaguesCol = collection(db, 'leagues');
    
    // Always query all leagues. Security rules will enforce what the user can see.
    // For list, we've set it to `true` so everyone can see all leagues on the homepage.
    const q = query(leaguesCol);
    
    const leagueSnapshot = await getDocs(q).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: leaguesCol.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        // Return null to indicate failure, which will result in an empty array below.
        return null;
    });

    if (!leagueSnapshot) return [];

    const leagues = leagueSnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            // Ensure createdAt is a string
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        } as League;
    });
    
    const result = leagues.map(league => {
        let lastActivityDate: Date;
        const leagueCreationDate = new Date(league.createdAt as string);

        if (league.matches && league.matches.length > 0) {
            const lastMatchDate = new Date(Math.max(...league.matches.map(m => new Date(m.createdAt).getTime())));
            lastActivityDate = lastMatchDate > leagueCreationDate ? lastMatchDate : leagueCreationDate;
        } else {
            lastActivityDate = leagueCreationDate;
        }
        
        return {
            ...league,
            activePlayerCount: league.players.filter(p => p.status === 'active').length,
            lastActivity: lastActivityDate.toISOString(),
        }
    });

    result.sort((a,b) => a.name.localeCompare(b.name));
    return result;
}

export async function getLeagueById(id: string): Promise<League | undefined> {
    const leagueDocRef = doc(db, 'leagues', id);

    // If user is not logged in, don't even try to fetch, because it will fail due to security rules.
    // This prevents the "permission-denied" toast from showing to visitors.
    if (!auth.currentUser) {
        return undefined;
    }
    
    const leagueDoc = await getDoc(leagueDocRef).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: leagueDocRef.path,
            operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        return null;
    });

    if (!leagueDoc || !leagueDoc.exists()) {
        return undefined;
    }
    const data = leagueDoc.data();
    return { 
        id: leagueDoc.id, 
        ...data,
        // Ensure createdAt is a string
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    } as League;
}

export async function createLeague(leagueData: Omit<League, 'id' | 'players' | 'matches' | 'inviteCode' | 'activePlayerCount'> & { creator: User }): Promise<League> {
    const { creator, ...restOfLeagueData } = leagueData;
    
    const newPlayer: Player = {
        id: creator.id,
        name: creator.name,
        email: creator.email,
        showEmail: !!creator.showEmail,
        elo: 1000,
        wins: 0,
        losses: 0,
        status: 'active',
        createdAt: new Date().toISOString()
    };

    const newLeagueData = {
        ...restOfLeagueData,
        adminIds: [creator.id], // Always make the creator an admin
        inviteCode: leagueData.privacy === 'private' ? generateInviteCode() : null,
        players: [newPlayer],
        matches: [],
        createdAt: serverTimestamp(),
    };

    const leaguesCol = collection(db, 'leagues');
    const docRef = await addDoc(leaguesCol, newLeagueData)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: leaguesCol.path,
            operation: 'create',
            requestResourceData: newLeagueData,
        });
        errorEmitter.emit('permission-error', permissionError);
        return null;
    });

    if (!docRef) {
        throw new Error("Failed to create league due to permissions.");
    }

    return {
        id: docRef.id,
        ...newLeagueData,
        createdAt: new Date().toISOString(),
    } as League;
}

export async function updateLeague(id: string, updates: Partial<Pick<League, 'name' | 'description' | 'privacy' | 'leaderboardVisible'>>): Promise<League> {
    const leagueDocRef = doc(db, 'leagues', id);

    const leagueToUpdate = { ...updates };

    if (updates.privacy && updates.privacy === 'private') {
        const currentLeague = await getLeagueById(id);
        if (currentLeague && !currentLeague.inviteCode) {
            (leagueToUpdate as any).inviteCode = generateInviteCode();
        }
    }

    await updateDoc(leagueDocRef, leagueToUpdate).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: leagueDocRef.path,
            operation: 'update',
            requestResourceData: updates,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw new Error("Failed to update league due to permissions.");
    });
    
    const updatedLeague = await getLeagueById(id);
    if (!updatedLeague) throw new Error("Could not fetch updated league");

    return updatedLeague;
}

export async function regenerateInviteCode(leagueId: string): Promise<string | undefined> {
    const leagueDocRef = doc(db, 'leagues', leagueId);
    const league = await getLeagueById(leagueId);
    if (!league) throw new Error("League not found");

    if (league.privacy !== 'private') return undefined;

    const newCode = generateInviteCode();
    await updateDoc(leagueDocRef, { inviteCode: newCode }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: leagueDocRef.path,
            operation: 'update',
            requestResourceData: { inviteCode: newCode },
        });
        errorEmitter.emit('permission-error', permissionError);
        throw new Error("Failed to regenerate code due to permissions.");
    });

    return newCode;
}

export async function deleteLeague(leagueId: string): Promise<void> {
    const leagueDocRef = doc(db, 'leagues', leagueId);
    await deleteDoc(leagueDocRef).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: leagueDocRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw new Error("Failed to delete league due to permissions.");
    });
}

export async function getPlayerStats(leagueId: string, playerId: string): Promise<PlayerStats | undefined> {
  const league = await getLeagueById(leagueId);
  if (!league) return undefined;
  
  const player = league.players.find(p => p.id === playerId);
  if (!player || player.status === 'inactive') return undefined;
  
  const sortedPlayers = [...league.players]
    .filter(p => p.status === 'active')
    .sort((a, b) => b.elo - a.elo);
  const rank = sortedPlayers.findIndex(p => p.id === playerId) + 1;
  
  const matchHistory = (league.matches || [])
    .filter(m => m.playerAId === playerId || m.playerBId === playerId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Calculate ELO history
  const eloHistory: EloHistory[] = [{ date: 'Start', elo: 1000, matchIndex: 0 }];
  let currentElo = 1000;
  matchHistory.forEach((match, index) => {
    const eloChange = match.playerAId === playerId ? match.eloChangeA : match.eloChangeB;
    currentElo += eloChange;
    eloHistory.push({
      date: new Date(match.createdAt).toLocaleDateString(),
      elo: currentElo,
      matchIndex: index + 1,
    });
  });

  // Calculate Head-to-Head stats
  const headToHead: { [opponentId: string]: { opponentName: string, wins: number, losses: number } } = {};
  matchHistory.forEach(match => {
    const isPlayerA = match.playerAId === playerId;
    const opponentId = isPlayerA ? match.playerBId : match.playerAId;
    const opponentName = isPlayerA ? match.playerBName : match.playerAName;
    const didWin = match.winnerId === playerId;

    if (!headToHead[opponentId]) {
      headToHead[opponentId] = { opponentName, wins: 0, losses: 0 };
    }
    if (didWin) {
      headToHead[opponentId].wins += 1;
    } else {
      headToHead[opponentId].losses += 1;
    }
  });

  return {
    player: JSON.parse(JSON.stringify(player)),
    leagueId,
    rank,
    matchHistory: matchHistory.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    eloHistory,
    headToHeadStats: Object.entries(headToHead).map(([opponentId, stats]) => ({ opponentId, ...stats })),
  };
}


export async function addUserToLeague(leagueId: string, user: User): Promise<void> {
  const league = await getLeagueById(leagueId);

  if (league && user) {
    const existingPlayer = league.players.find(p => p.id === user.id);
    let newPlayers;

    if (existingPlayer) {
      newPlayers = league.players.map(p => p.id === user.id ? { ...p, status: 'active' } : p);
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
      newPlayers = [...(league.players || []), newPlayer];
    }
    const leagueDocRef = doc(db, 'leagues', leagueId);
    await updateDoc(leagueDocRef, { players: newPlayers }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: leagueDocRef.path,
            operation: 'update',
            requestResourceData: { players: newPlayers }
        });
        errorEmitter.emit('permission-error', permissionError);
        throw new Error("Failed to add user due to permissions.");
    });
  }
}

export async function joinLeagueByInviteCode(inviteCode: string, user: User, leagueId: string): Promise<League> {
    const q = query(collection(db, "leagues"), where("inviteCode", "==", inviteCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        throw new Error("Invalid invite code or league does not match.");
    }
    
    // Although we filter by invite code, a malicious user could guess one.
    // We double-check that the invite code corresponds to the league they are trying to join.
    const leagueDoc = querySnapshot.docs.find(doc => doc.id === leagueId);
    if (!leagueDoc) {
        throw new Error("Invalid invite code for this league.");
    }

    const league = { id: leagueDoc.id, ...leagueDoc.data() } as League;

    await addUserToLeague(league.id, user);
    return league;
}


export async function removePlayerFromLeague(leagueId: string, userId: string): Promise<void> {
  const league = await getLeagueById(leagueId);
  if (league) {
    const newPlayers = league.players.map(p => p.id === userId ? { ...p, status: 'inactive' } : p);
    const leagueDocRef = doc(db, 'leagues', leagueId);
    await updateDoc(leagueDocRef, { players: newPlayers }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: leagueDocRef.path,
            operation: 'update',
            requestResourceData: { players: newPlayers }
        });
        errorEmitter.emit('permission-error', permissionError);
        throw new Error("Failed to remove player due to permissions.");
    });
  }
}

export async function updateUserInLeagues(user: User): Promise<void> {
    const userDocRef = doc(db, 'users', user.id);
    await setDoc(userDocRef, { ...user }, { merge: true }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'update',
            requestResourceData: user
        });
        errorEmitter.emit('permission-error', permissionError);
    });

    const leagues = await getLeagues();
    const batch = writeBatch(db);

    leagues.forEach(league => {
        let leagueWasUpdated = false;
        const newPlayers = league.players.map(player => {
            if (player.id === user.id) {
                leagueWasUpdated = true;
                return { ...player, name: user.name, email: user.email, showEmail: user.showEmail };
            }
            return player;
        });
        const newMatches = (league.matches || []).map(match => {
            if (match.playerAId === user.id) {
                leagueWasUpdated = true;
                match.playerAName = user.name;
            }
            if (match.playerBId === user.id) {
                leagueWasUpdated = true;
                match.playerBName = user.name;
            }
            return match;
        });

        if(leagueWasUpdated) {
            const leagueRef = doc(db, 'leagues', league.id);
            batch.update(leagueRef, { players: newPlayers, matches: newMatches });
        }
    });

    await batch.commit().catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: "batch write",
            operation: 'update',
        });
        errorEmitter.emit('permission-error', permissionError);
    });
}

/**
 * Anonymizes a user's data across all leagues and deletes their main user document.
 * @param userId The ID of the user to anonymize and delete.
 */
export async function deleteUserAccount(userId: string): Promise<void> {
    const leagues = await getLeagues();
    const batch = writeBatch(db);

    leagues.forEach(league => {
        let leagueWasUpdated = false;
        
        const newPlayers = league.players.map(player => {
            if (player.id === userId) {
                leagueWasUpdated = true;
                return {
                    ...player,
                    name: "Deleted User",
                    email: "",
                    showEmail: false,
                    status: 'inactive' as 'inactive'
                };
            }
            return player;
        });

        const newMatches = (league.matches || []).map(match => {
            if (match.playerAId === userId) {
                match.playerAName = "Deleted User";
                leagueWasUpdated = true;
            }
            if (match.playerBId === userId) {
                match.playerBName = "Deleted User";
                leagueWasUpdated = true;
            }
            return match;
        });

        if (leagueWasUpdated) {
            const leagueRef = doc(db, 'leagues', league.id);
            batch.update(leagueRef, { players: newPlayers, matches: newMatches });
        }
    });

    await batch.commit().catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: "batch write for user deletion cleanup",
            operation: 'update',
        });
        errorEmitter.emit('permission-error', permissionError);
    });

    const userRef = doc(db, 'users', userId);
    // Delete the main user document.
    await deleteDoc(userRef).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw new Error("Failed to delete user document due to permissions.");
    });
}

export function calculateEloChange(playerElo: number, opponentElo: number, playerMatchesPlayed: number, result: 'win' | 'loss'): number {
  const K = playerMatchesPlayed < 30 ? 40 : 20;
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
  const league = await getLeagueById(leagueId);
  if (!league) {
    throw new Error('League not found');
  }

  const playerAIndex = league.players.findIndex(p => p.id === formData.playerAId);
  const playerBIndex = league.players.findIndex(p => p.id === formData.playerBId);
  const playerA = league.players[playerAIndex];
  const playerB = league.players[playerBIndex];

  if (!playerA || !playerB) {
    throw new Error('One or both players not found in the league');
  }

  const playerAMatchesPlayed = playerA.wins + playerA.losses;
  const playerBMatchesPlayed = playerB.wins + playerB.losses;

  const eloChangeA = calculateEloChange(playerA.elo, playerB.elo, playerAMatchesPlayed, formData.winnerId === playerA.id ? 'win' : 'loss');
  const eloChangeB = calculateEloChange(playerB.elo, playerA.elo, playerBMatchesPlayed, formData.winnerId === playerB.id ? 'win' : 'loss');

  // Update player stats
  playerA.elo += eloChangeA;
  playerA.wins += formData.winnerId === playerA.id ? 1 : 0;
  playerA.losses += formData.winnerId === playerA.id ? 0 : 1;

  playerB.elo += eloChangeB;
  playerB.wins += formData.winnerId === playerB.id ? 1 : 0;
  playerB.losses += formData.winnerId === playerB.id ? 0 : 1;
  
  const newPlayers = [...league.players];
  newPlayers[playerAIndex] = playerA;
  newPlayers[playerBIndex] = playerB;

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

  const newMatches = [...(league.matches || []), newMatch];
  
  const leagueDocRef = doc(db, 'leagues', leagueId);
  await updateDoc(leagueDocRef, { players: newPlayers, matches: newMatches }).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
        path: leagueDocRef.path,
        operation: 'update',
        requestResourceData: { players: newPlayers, matches: newMatches }
    });
    errorEmitter.emit('permission-error', permissionError);
    throw new Error("Failed to record match due to permissions.");
  });


  return newMatch;
}

export async function getUserById(userId: string): Promise<User | null> {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
}

export async function getAllUsers(): Promise<User[]> {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: usersCol.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        return null;
    });

    if (!userSnapshot) return [];

    return userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
}

export async function createUserProfile(user: User): Promise<void> {
    const userDocRef = doc(db, 'users', user.id);
    const data = {
        id: user.id,
        name: user.name,
        email: user.email,
        showEmail: user.showEmail ?? false,
    };
    await setDoc(userDocRef, data, { merge: true }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'create',
            requestResourceData: data
        });
        errorEmitter.emit('permission-error', permissionError);
        throw new Error("Failed to create user profile due to permissions.");
    });
}
