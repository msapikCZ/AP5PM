import { Component, inject, OnInit, signal } from '@angular/core';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { DatePipe } from '@angular/common';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonAlert,
  ToastController
} from '@ionic/angular';
import { CounterService, CounterSort, ValueFilter, } from '../services/counter.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    DatePipe,
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonTitle,
    IonToolbar,
    IonSearchbar,
    IonAlert,
  ],
})
export class Tab2Page implements OnInit {
  readonly counterService = inject(CounterService);
  readonly auth = inject(FirebaseAuthService);
  readonly authError = signal('');

  readonly alertButtons = [
    {
      text: 'Ne',
      role: 'cancel',
    },
    {
      text: 'Ano',
      role: 'confirm',
      handler: () => {
        this.clear();
      },
    },
  ];

  constructor(private toastController: ToastController) { }

  async presentToast(position: 'top') {
    const toast = await this.toastController.create({
      message: 'Záznam byl úspěšně odstraněn!',
      duration: 1500,
      position: position,
    });

    await toast.present();
  }

  async ngOnInit(): Promise<void> {
    await this.counterService.initialize();

    try {
      await this.auth.initialize();
    } catch (error) {
      console.error(error);
      this.authError.set('Přihlášení se nezdařilo. Zkontrolujte konfiguraci.');
    }
  }

  async remove(id: string): Promise<void> {
    await this.counterService.remove(id);
  }

  async clear(): Promise<void> {
    await this.counterService.clear();
  }

  async changeSort(sort: CounterSort): Promise<void> {
    await this.counterService.setSort(sort);
  }

  async changeValueFilter(filter: ValueFilter): Promise<void> {
    await this.counterService.setValueFilter(filter);
  }

  async handleInput(event: Event): Promise<void> {
    const target = event.target as HTMLIonSearchbarElement;
    const query = target.value ?? '';
    this.counterService.setSearch(query);
  }
}