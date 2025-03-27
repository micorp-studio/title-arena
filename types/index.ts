// types/index.ts
/**
 * Core data types for Title Arena application
 */

// A Battle represents a title comparison contest
export interface Battle {
    id: string;
    title: string;
    createdAt: number;
    voteCount: number;
    titleOptions: TitleOption[]; // Renamed from "options" to match database schema
  }
  
  // A TitleOption represents a single title candidate
  export interface TitleOption {
    id: string;
    battleId: string;
    content: string;
    score: number;
  }
  
  // API request types
  export interface CreateBattleRequest {
    title: string;
    options: string[]; // Array of title text strings
  }
  
  export interface UpdateBattleRequest {
    title: string;
    options: {
      id?: string;
      content: string;
    }[];
  }
  
  export interface VoteRequest {
    winnerId: string;
    loserId: string;
  }
  
  // API response types
  export interface VoteResponse {
    winner: {
      id: string;
      content: string;
      oldScore: number;
      newScore: number;
    };
    loser: {
      id: string;
      content: string;
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
    };
  }
  