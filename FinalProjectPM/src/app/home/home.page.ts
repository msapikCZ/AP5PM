import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonInput,
  IonSegment,
  IonSegmentButton,
  IonLabel,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { timeOutline, settingsOutline, playOutline } from 'ionicons/icons';

import { MatchService } from '../services/match.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    FormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonInput,
    IonSegment,
    IonSegmentButton,
    IonLabel,
  ],
})
export class HomePage {
  private readonly router = inject(Router);
  private readonly matchService = inject(MatchService);

  homeName = '';
  awayName = '';
  periodMinutes = 20;
  periods = 3;

  constructor() {
    addIcons({ timeOutline, settingsOutline, playOutline });
  }

  get isValid(): boolean {
    return this.periodMinutes > 0 && this.periodMinutes <= 60;
  }

  startMatch(): void {
    this.matchService.config = {
      homeName: this.homeName.trim() || 'Domácí',
      awayName: this.awayName.trim() || 'Hosté',
      periods: this.periods,
      periodMinutes: this.periodMinutes,
    };
    void this.router.navigate(['/timer']);
  }
}
