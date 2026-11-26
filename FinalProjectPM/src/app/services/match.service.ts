import { Injectable } from '@angular/core';

export interface MatchConfig {
  homeName: string;
  awayName: string;
  periods: number;
  periodMinutes: number;
}

@Injectable({ providedIn: 'root' })
export class MatchService {
  config: MatchConfig | null = null;
}
