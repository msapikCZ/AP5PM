import { Injectable, computed, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { SavedCounter } from '../models/saved-counter';

export type CounterSort = 'date' | 'name' | 'value';

@Injectable({
  providedIn: 'root',
})
export class CounterService {
  private readonly storageKey = 'saved-counters';
  private readonly countersState = signal<SavedCounter[]>([]);
  private readonly initializedState = signal(false);
  private readonly sortState = signal<CounterSort>('date');
  private readonly searchState = signal('');
  private initializationPromise: Promise<void> | null = null;

  readonly counters = this.countersState.asReadonly();
  readonly initialized = this.initializedState.asReadonly();
  readonly sort = this.sortState.asReadonly();
  readonly search = this.searchState.asReadonly();

  readonly sortedCounters = computed(() => {
    const counters = [...this.countersState()];
    const sort = this.sortState();

    switch (sort) {
      case 'name':
        return counters.sort((a, b) =>
          a.name.localeCompare(b.name, 'cs'),
        );

      case 'value':
        return counters.sort((a, b) => b.value - a.value);

      case 'date':
      default:
        return counters;
    }
  });

  readonly filteredCounters = computed(() => { 
    const search = this.searchState().trim().toLowerCase(); 
    
    if (search === '') { 
      return this.sortedCounters(); 
    } 
    
    return this.sortedCounters().filter((counter) => 
      counter.name.toLowerCase().includes(search), 
    ); 
  });

  readonly totalValue = computed(() =>
    this.counters().reduce((sum, counter) => sum + counter.value, 0),
  );

  initialize(): Promise<void> {
    this.initializationPromise ??= this.load();
    return this.initializationPromise;
  }

  setSort(sort: CounterSort): void {
    this.sortState.set(sort);
  }

  setSearch(search: string): void { 
    this.searchState.set(search); 
  }

  async add(counter: SavedCounter): Promise<void> {
    await this.initialize();
    this.countersState.update((counters) => [counter, ...counters]);
    await this.persist();
  }

  async remove(id: string): Promise<void> {
    await this.initialize();
    this.countersState.update((counters) =>
      counters.filter((counter) => counter.id !== id),
    );
    await this.persist();
  }

  async clear(): Promise<void> {
    await this.initialize();
    this.countersState.set([]);
    await Preferences.remove({ key: this.storageKey });
  }

  private async load(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: this.storageKey });

      if (value === null) {
        this.countersState.set([]);
        return;
      }

      const parsed: unknown = JSON.parse(value);

      if (!Array.isArray(parsed)) {
        throw new Error('Uložená historie nemá očekávaný formát pole.');
      }

      this.countersState.set(parsed as SavedCounter[]);
    } catch (error) {
      console.error('Historii počítadel se nepodařilo načíst.', error);
      this.countersState.set([]);
    } finally {
      this.initializedState.set(true);
    }
  }

  private async persist(): Promise<void> {
    await Preferences.set({
      key: this.storageKey,
      value: JSON.stringify(this.countersState()),
    });
  }
}