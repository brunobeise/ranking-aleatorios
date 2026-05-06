import { PlayerState, MatchData, RankedPlayer, MatchWithDeltas, MatchPlayerDelta } from "./types";

const INITIAL_RATING = 1000;
const INITIAL_RD = 350;
const MIN_RD = 50;
const MAX_RD = 350;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function applyInactivity(player: PlayerState, matchDate: Date): void {
  if (player.lastMatchDate) {
    const days = daysBetween(player.lastMatchDate, matchDate);
    if (days > 0) {
      player.rd = Math.min(MAX_RD, player.rd + days * 2);
    }
  }
}

function expectedScore(teamRating: number, opponentRating: number): number {
  return 1 / (1 + Math.pow(10, (opponentRating - teamRating) / 400));
}

function calculateMatchResult(
  sets: { team1Score: number; team2Score: number }[]
): { team1Won: boolean; bonus1: number; bonus2: number } {
  let team1Sets = 0;
  let team2Sets = 0;
  let team1Games = 0;
  let team2Games = 0;

  for (const set of sets) {
    if (set.team1Score > set.team2Score) team1Sets++;
    else team2Sets++;
    team1Games += set.team1Score;
    team2Games += set.team2Score;
  }

  // Se sets empatados (número par de sets), desempata pelo saldo de games
  const team1Won =
    team1Sets !== team2Sets ? team1Sets > team2Sets : team1Games > team2Games;

  const totalGames = team1Games + team2Games;
  let bonus1 = 0;
  let bonus2 = 0;

  if (totalGames > 0) {
    const diff1 = team1Games - team2Games;
    const diff2 = team2Games - team1Games;
    bonus1 = team1Won ? clamp((diff1 / totalGames) * 0.5, 0, 0.25) : 0;
    bonus2 = !team1Won ? clamp((diff2 / totalGames) * 0.5, 0, 0.25) : 0;
  }

  return { team1Won, bonus1, bonus2 };
}

function processMatch(
  players: Map<string, PlayerState>,
  match: MatchData
): MatchPlayerDelta[] {
  const team1Players = match.team1.map((id) => players.get(id)!);
  const team2Players = match.team2.map((id) => players.get(id)!);

  // Apply inactivity
  for (const p of [...team1Players, ...team2Players]) {
    applyInactivity(p, match.createdAt);
  }

  // Capture ratings before
  const ratingsBefore = new Map<string, number>();
  for (const p of [...team1Players, ...team2Players]) {
    ratingsBefore.set(p.id, p.rating);
  }

  // Team ratings
  const team1Rating =
    team1Players.reduce((sum, p) => sum + p.rating, 0) / team1Players.length;
  const team2Rating =
    team2Players.reduce((sum, p) => sum + p.rating, 0) / team2Players.length;
  const team1RD =
    team1Players.reduce((sum, p) => sum + p.rd, 0) / team1Players.length;
  const team2RD =
    team2Players.reduce((sum, p) => sum + p.rd, 0) / team2Players.length;

  // Expected scores
  const expected1 = expectedScore(team1Rating, team2Rating);
  const expected2 = expectedScore(team2Rating, team1Rating);

  // Actual scores
  const { team1Won, bonus1, bonus2 } = calculateMatchResult(match.sets);
  const score1 = (team1Won ? 1 : 0) + bonus1;
  const score2 = (team1Won ? 0 : 1) + bonus2;

  // K factors
  const k1 = team1RD / 5;
  const k2 = team2RD / 5;

  // Team deltas
  const deltaTeam1 = k1 * (score1 - expected1);
  const deltaTeam2 = k2 * (score2 - expected2);

  // Apply to individual players
  for (const p of team1Players) {
    const factor = team1Rating / p.rating;
    p.rating += deltaTeam1 * factor;
    p.rd = Math.max(MIN_RD, p.rd * 0.95);
    p.lastMatchDate = match.createdAt;
    if (team1Won) {
      p.wins++;
      p.streak = p.streak > 0 ? p.streak + 1 : 1;
    } else {
      p.losses++;
      p.streak = p.streak < 0 ? p.streak - 1 : -1;
    }
  }

  for (const p of team2Players) {
    const factor = team2Rating / p.rating;
    p.rating += deltaTeam2 * factor;
    p.rd = Math.max(MIN_RD, p.rd * 0.95);
    p.lastMatchDate = match.createdAt;
    if (!team1Won) {
      p.wins++;
      p.streak = p.streak > 0 ? p.streak + 1 : 1;
    } else {
      p.losses++;
      p.streak = p.streak < 0 ? p.streak - 1 : -1;
    }
  }

  // Build deltas
  const playerDeltas: MatchPlayerDelta[] = [];
  for (const p of team1Players) {
    const before = ratingsBefore.get(p.id)!;
    playerDeltas.push({
      playerId: p.id,
      playerName: p.name,
      photoUrl: p.photoUrl,
      team: 1,
      ratingBefore: Math.round(before),
      ratingAfter: Math.round(p.rating),
      delta: Math.round(p.rating - before),
    });
  }
  for (const p of team2Players) {
    const before = ratingsBefore.get(p.id)!;
    playerDeltas.push({
      playerId: p.id,
      playerName: p.name,
      photoUrl: p.photoUrl,
      team: 2,
      ratingBefore: Math.round(before),
      ratingAfter: Math.round(p.rating),
      delta: Math.round(p.rating - before),
    });
  }

  return playerDeltas;
}

export function computeRanking(
  playerList: { id: string; name: string; photoUrl: string | null }[],
  matches: MatchData[]
): RankedPlayer[] {
  const players = new Map<string, PlayerState>();

  // Initialize all players
  for (const p of playerList) {
    players.set(p.id, {
      id: p.id,
      name: p.name,
      photoUrl: p.photoUrl,
      rating: INITIAL_RATING,
      rd: INITIAL_RD,
      lastMatchDate: null,
      wins: 0,
      losses: 0,
      streak: 0,
    });
  }

  // Sort matches by date and process sequentially
  const sortedMatches = [...matches].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  for (const match of sortedMatches) {
    processMatch(players, match);
  }

  // Return sorted ranking
  return Array.from(players.values())
    .map((p) => ({
      id: p.id,
      name: p.name,
      photoUrl: p.photoUrl,
      rating: Math.round(p.rating),
      wins: p.wins,
      losses: p.losses,
      streak: p.streak,
    }))
    .sort((a, b) => b.rating - a.rating);
}

export function computePlayerStates(
  playerList: { id: string; name: string; photoUrl: string | null }[],
  matches: MatchData[]
): PlayerState[] {
  const players = new Map<string, PlayerState>();

  for (const p of playerList) {
    players.set(p.id, {
      id: p.id,
      name: p.name,
      photoUrl: p.photoUrl,
      rating: INITIAL_RATING,
      rd: INITIAL_RD,
      lastMatchDate: null,
      wins: 0,
      losses: 0,
      streak: 0,
    });
  }

  const sortedMatches = [...matches].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  for (const match of sortedMatches) {
    processMatch(players, match);
  }

  return Array.from(players.values());
}

export function previewMatchDeltas(
  states: PlayerState[],
  match: MatchData
): MatchPlayerDelta[] {
  const clone = new Map<string, PlayerState>();
  for (const s of states) {
    clone.set(s.id, {
      ...s,
      lastMatchDate: s.lastMatchDate ? new Date(s.lastMatchDate) : null,
    });
  }
  return processMatch(clone, match);
}

export function computeRankingWithHistory(
  playerList: { id: string; name: string; photoUrl: string | null }[],
  matches: MatchData[]
): { ranking: RankedPlayer[]; matchHistory: MatchWithDeltas[] } {
  const players = new Map<string, PlayerState>();

  for (const p of playerList) {
    players.set(p.id, {
      id: p.id,
      name: p.name,
      photoUrl: p.photoUrl,
      rating: INITIAL_RATING,
      rd: INITIAL_RD,
      lastMatchDate: null,
      wins: 0,
      losses: 0,
      streak: 0,
    });
  }

  const sortedMatches = [...matches].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  const matchHistory: MatchWithDeltas[] = [];

  for (const match of sortedMatches) {
    const deltas = processMatch(players, match);
    const { team1Won } = calculateMatchResult(match.sets);
    matchHistory.push({
      id: match.id,
      createdAt: match.createdAt,
      sets: match.sets,
      team1Won,
      players: deltas,
    });
  }

  const ranking = Array.from(players.values())
    .map((p) => ({
      id: p.id,
      name: p.name,
      photoUrl: p.photoUrl,
      rating: Math.round(p.rating),
      wins: p.wins,
      losses: p.losses,
      streak: p.streak,
    }))
    .sort((a, b) => b.rating - a.rating);

  return { ranking, matchHistory: matchHistory.reverse() };
}
