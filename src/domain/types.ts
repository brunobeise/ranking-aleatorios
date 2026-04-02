export interface PlayerState {
  id: string;
  name: string;
  photoUrl: string | null;
  rating: number;
  rd: number;
  lastMatchDate: Date | null;
  wins: number;
  losses: number;
  streak: number; // positive = win streak, negative = loss streak
}

export interface MatchData {
  id: string;
  createdAt: Date;
  team1: string[]; // player IDs
  team2: string[];
  sets: { team1Score: number; team2Score: number }[];
}

export interface RankedPlayer {
  id: string;
  name: string;
  photoUrl: string | null;
  rating: number;
  wins: number;
  losses: number;
  streak: number;
}

export interface MatchPlayerDelta {
  playerId: string;
  playerName: string;
  photoUrl: string | null;
  team: 1 | 2;
  ratingBefore: number;
  ratingAfter: number;
  delta: number;
}

export interface MatchWithDeltas {
  id: string;
  createdAt: Date;
  sets: { team1Score: number; team2Score: number }[];
  team1Won: boolean;
  players: MatchPlayerDelta[];
}
