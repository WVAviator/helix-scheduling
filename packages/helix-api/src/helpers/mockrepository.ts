interface FindOptions {
  where: {
    [key: string]: any;
  };
}

interface HasId {
  id: number;
}

export class MockRepository<T extends HasId> {
  constructor(private data: T[] = []) {}

  create(item: T): T {
    return item;
  }

  compare<T>(whole: T, partial: Partial<T>): boolean {
    if (typeof whole !== 'object' || typeof partial !== 'object') {
      return whole === partial;
    }
    for (const key in partial) {
      if (!this.compare(whole[key], partial[key])) {
        return false;
      }
    }
    return true;
  }

  async find(options: FindOptions): Promise<T[]> {
    if (!options) {
      return this.data;
    }
    const results = this.data.filter((item) => {
      return this.compare(item, options.where as Partial<typeof item>);
    });

    return results;
  }
  async findOne(options: FindOptions): Promise<T> {
    const result = await this.find(options);
    if (result.length === 0) {
      return null;
    }
    return result[0];
  }
  async save(item: T): Promise<T> {
    const oldItemIndex = this.data.findIndex((i) => i.id === item.id);
    if (oldItemIndex > -1) {
      this.data[oldItemIndex] = item;
    } else {
      item.id = Math.floor(Math.random() * 10000);
      this.data.push(item);
    }
    return Promise.resolve(item);
  }

  async remove(item: T): Promise<T> {
    const index = this.data.indexOf(item);
    if (index === -1) {
      throw new Error('Not found');
    }
    this.data.splice(index, 1);
    return item;
  }
}
