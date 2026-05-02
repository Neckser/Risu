import { Category, DEFAULT_CATEGORIES } from '@shared/models/category.model';
import { Subscription } from '@shared/models/subscription.model';
import { User } from '@core/auth/models/user.model';

const STORAGE_KEY = 'risu_mock_db_v1';

interface StoredUser extends User {
  passwordHash: string;
}

interface MockDb {
  users: StoredUser[];
  subscriptions: Subscription[];
  categoriesByUser: Record<string, Category[]>;
}

const seedHash = (password: string): string =>
  btoa(unescape(encodeURIComponent(password))).split('').reverse().join('');

const buildSeed = (): MockDb => {
  const demoId = 'demo-user-id';
  const today = new Date();
  const future = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d.toISOString();
  };
  return {
    users: [
      {
        id: demoId,
        email: 'demo@risu.app',
        name: 'Demo User',
        createdAt: today.toISOString(),
        passwordHash: seedHash('demo1234'),
      },
    ],
    categoriesByUser: {
      [demoId]: DEFAULT_CATEGORIES.map((c) => ({ ...c })),
    },
    subscriptions: [
      {
        id: 'seed-1',
        userId: demoId,
        name: 'Netflix',
        price: 599,
        currency: 'RUB',
        category: 'streaming',
        periodicity: 'monthly',
        nextPaymentDate: future(5),
        notifyDaysBefore: 3,
        isActive: true,
        createdAt: today.toISOString(),
      },
      {
        id: 'seed-2',
        userId: demoId,
        name: 'Spotify',
        price: 269,
        currency: 'RUB',
        category: 'streaming',
        periodicity: 'monthly',
        nextPaymentDate: future(12),
        notifyDaysBefore: 2,
        isActive: true,
        createdAt: today.toISOString(),
      },
      {
        id: 'seed-3',
        userId: demoId,
        name: 'PlayStation Plus',
        price: 5999,
        currency: 'RUB',
        category: 'gaming',
        periodicity: 'yearly',
        nextPaymentDate: future(60),
        notifyDaysBefore: 7,
        isActive: true,
        createdAt: today.toISOString(),
      },
      {
        id: 'seed-4',
        userId: demoId,
        name: 'iCloud 200 GB',
        price: 149,
        currency: 'RUB',
        category: 'utility',
        periodicity: 'monthly',
        nextPaymentDate: future(2),
        notifyDaysBefore: 1,
        isActive: true,
        createdAt: today.toISOString(),
      },
      {
        id: 'seed-5',
        userId: demoId,
        name: 'GitHub Copilot',
        price: 10,
        currency: 'USD',
        category: 'work',
        periodicity: 'monthly',
        nextPaymentDate: future(20),
        notifyDaysBefore: 3,
        isActive: false,
        createdAt: today.toISOString(),
      },
    ],
  };
};

export class MockDatabase {
  private db: MockDb;

  constructor() {
    this.db = this.load();
  }

  private load(): MockDb {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as MockDb;
        if (parsed.users && parsed.subscriptions && parsed.categoriesByUser) {
          return parsed;
        }
      }
    } catch {}
    const seed = buildSeed();
    this.persist(seed);
    return seed;
  }

  private persist(db: MockDb = this.db): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {}
  }

  reset(): void {
    this.db = buildSeed();
    this.persist();
  }

  hashPassword(password: string): string {
    return seedHash(password);
  }

  findUserByEmail(email: string): StoredUser | undefined {
    return this.db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): StoredUser | undefined {
    return this.db.users.find((u) => u.id === id);
  }

  addUser(user: StoredUser): void {
    this.db.users.push(user);
    this.db.categoriesByUser[user.id] = DEFAULT_CATEGORIES.map((c) => ({ ...c }));
    this.persist();
  }

  listSubscriptions(userId: string): Subscription[] {
    return this.db.subscriptions.filter((s) => s.userId === userId);
  }

  getSubscription(userId: string, id: string): Subscription | undefined {
    return this.db.subscriptions.find((s) => s.id === id && s.userId === userId);
  }

  addSubscription(sub: Subscription): Subscription {
    this.db.subscriptions.push(sub);
    this.persist();
    return sub;
  }

  updateSubscription(userId: string, id: string, patch: Partial<Subscription>): Subscription | null {
    const idx = this.db.subscriptions.findIndex((s) => s.id === id && s.userId === userId);
    if (idx === -1) return null;
    const updated = { ...this.db.subscriptions[idx], ...patch, id, userId };
    this.db.subscriptions[idx] = updated;
    this.persist();
    return updated;
  }

  deleteSubscription(userId: string, id: string): boolean {
    const before = this.db.subscriptions.length;
    this.db.subscriptions = this.db.subscriptions.filter(
      (s) => !(s.id === id && s.userId === userId),
    );
    if (this.db.subscriptions.length === before) return false;
    this.persist();
    return true;
  }

  listCategories(userId: string): Category[] {
    if (!this.db.categoriesByUser[userId]) {
      this.db.categoriesByUser[userId] = DEFAULT_CATEGORIES.map((c) => ({ ...c }));
      this.persist();
    }
    return this.db.categoriesByUser[userId];
  }

  updateCategory(userId: string, id: string, patch: Partial<Category>): Category | null {
    const list = this.listCategories(userId);
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const updated = { ...list[idx], ...patch, id: list[idx].id };
    list[idx] = updated;
    this.db.categoriesByUser[userId] = list;
    this.persist();
    return updated;
  }
}
