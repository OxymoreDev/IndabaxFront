export interface MatchResult {
  candidateId: string;
  candidate_name: string;
  rank : string;
  jobId: string;
  job_title: string;
  company_name : string;
  score: number;
  common_skills: string[];
  missing_skills: string[]; // Ajoute ceci
}

export interface EvaluationMetrics {
  precisionAt5: number;
  recallAt5: number;
  totalCandidatesEvaluated: number;
  ndcgAt5: number;   // <--- Vérifie bien l'orthographe (A majuscule)
  ndcgAt10: number;  // <--- Vérifie bien l'orthographe (A majuscule)
  status: string;
}