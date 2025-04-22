// types/index.ts

// A Battle represents a title comparison contest
export interface Battle {
    id: string;
    title: string;
    createdAt: number;
    voteCount: number;
    titleOptions: TitleOption[];
    type: 'title' | 'thumbnail';
  }

// A TitleOption represents a single title candidate
export interface TitleOption {
  id: string;
  battleId: string;
  content: string;
  scoreElo: number;
  score: number;
}

// API request types
export interface CreateBattleRequest {
  title: string;
  options: string[]; // Array of title text strings or thumbnails paths
  type: 'title' | 'thumbnail';
}

export interface UpdateBattleRequest {
  title: string;
  options: {
    id?: string;
    content: string;
  }[];
  type: 'title' | 'thumbnail';
}

export interface VoteRequest {
  winnerId: string;
  loserId: string;
  winnerCard: 'A' | 'B' | 'AB';
}

// API response types
export interface VoteResponse {
  winner: {
    id: string;
    content: string;
    oldScoreElo: number;
    newScoreElo: number;
    oldScore: number;
    newScore: number;
  };
  loser: {
    id: string;
    content: string;
    oldScoreElo: number;
    newScoreElo: number;
    oldScore: number;
    newScore: number;
  };
}

export interface DeleteBattleResponse {
  success: boolean;
  data: {
    id: string;
    title: string;
    createdAt: number;
    voteCount: number;
    type: 'title' | 'thumbnail';
  };
}
