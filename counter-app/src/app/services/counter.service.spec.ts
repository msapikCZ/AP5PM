import { TestBed } from '@angular/core/testing';
import { Preferences } from '@capacitor/preferences';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SavedCounter } from '../models/saved-counter';
import { CounterService } from './counter.service';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('CounterService', () => {
  let service: CounterService;

  const getMock = vi.mocked(Preferences.get);
  const setMock = vi.mocked(Preferences.set);
  const removeMock = vi.mocked(Preferences.remove);

  const first: SavedCounter = {
    id: 'first',
    name: 'První',
    value: 1,
    createdAt: '2026-09-17T08:00:00.000Z',
  };

  const second: SavedCounter = {
    id: 'second',
    name: 'Druhé',
    value: 2,
    createdAt: '2026-09-17T09:00:00.000Z',
  };

  beforeEach(() => {
    // Vynulujeme počty volání mocků z předchozího testu.
    vi.clearAllMocks();

    // Výchozí stav: v Preferences zatím není uložená historie.
    getMock.mockResolvedValue({ value: null });

    // Zápis i odstranění ve výchozím stavu úspěšně skončí.
    setMock.mockResolvedValue(undefined);
    removeMock.mockResolvedValue(undefined);

    // Pro každý test vytvoříme nové prostředí Angular dependency injection.
    TestBed.configureTestingModule({
      providers: [CounterService],
    });

    // Z testovacího injectoru získáme čerstvou instanci služby.
    service = TestBed.inject(CounterService);
  });

  it('should initialize only once', async () => {
    // Dvě volání bez čekání simulují souběžné požadavky na inicializaci.
    await Promise.all([service.initialize(), service.initialize()]);

    // Další volání proběhne až po dokončení první inicializace.
    await service.initialize();

    // Všechna volání musí sdílet jedinou operaci načtení Preferences.
    expect(getMock).toHaveBeenCalledTimes(1);

    // Služba dokončila inicializaci a při value: null má prázdnou historii.
    expect(service.initialized()).toBe(true);
    expect(service.counters()).toEqual([]);
  });

  // TODO: samostatně doplňte testy scénářů 1–5 ze zadání.
  it('should load saved counters', async () => {
    // Určíme, co má falešná metoda Preferences.get() vrátit.
    getMock.mockResolvedValue({
      // Preferences ukládají pouze řetězce, proto pole převedeme na JSON.
      value: JSON.stringify([first, second]),
    });

    // Počkáme, až služba hodnotu načte, převede z JSON a aktualizuje signal.
    await service.initialize();

    // Signal musí po inicializaci obsahovat stejné dva objekty.
    expect(service.counters()).toEqual([first, second]);

    // Současně ověříme, že služba četla správný klíč Preferences.
    expect(getMock).toHaveBeenCalledWith({ key: 'saved-counters' });
  });

  it('should add a counter', async () => {
    
    // Metoda add() nejprve zajistí inicializaci, přidá objekt a potom stav uloží.
    await service.add(first);

    expect(service.counters()).toEqual([first]);

    // Ověříme přesný objekt předaný do Preferences.set().
    expect(setMock).toHaveBeenCalledWith({
      // Služba musí pro čtení i zápis používat stejný klíč.
      key: 'saved-counters',

      // Pole ve stavu služby musí být před uložením převedeno na JSON řetězec.
      value: JSON.stringify([first]),
    });
  });

  it('should remove only the counter with the given id', async () => {
    getMock.mockResolvedValue({
      value: JSON.stringify([first, second]),
    });

    await service.initialize();
    await service.remove(first.id);

    expect(service.counters()).toEqual([second]);

    expect(setMock).toHaveBeenCalledWith({
      key: 'saved-counters',
      value: JSON.stringify([second]),
    });
  });

  it('should clear the history', async () => {
    getMock.mockResolvedValue({
      value: JSON.stringify([first, second]),
    });

    await service.initialize();
    await service.clear();

    expect(service.counters()).toEqual([]);
    expect(removeMock).toHaveBeenCalledWith({
      key: 'saved-counters',
    });
    expect(removeMock).toHaveBeenCalledTimes(1);
  });

  it('should recover from invalid JSON', async () => {
    getMock.mockResolvedValue({
      value: 'this is not a valid JSON',
    });

    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    await service.initialize();

    expect(service.counters()).toEqual([]);
    expect(service.initialized()).toBe(true);

    expect(errorSpy).toHaveBeenCalledWith(
      'Historii počítadel se nepodařilo načíst.',
      expect.any(Error),
    );

    errorSpy.mockRestore();
  });
});