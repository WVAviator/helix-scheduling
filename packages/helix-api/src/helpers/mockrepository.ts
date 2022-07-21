interface FindOptions {
  where: {
    [key: string]: any;
  };
}

export class MockRepository<T> {
  constructor(private data: T[] = []) {}

  create(item: T): T {
    return item;
  }

  async find(options: FindOptions): Promise<T[]> {
    if (!options) {
      return this.data;
    }
    return this.data.filter((item) => {
      for (const key in options.where) {
        if (item[key] !== options.where[key]) {
          return false;
        }
      }
      return true;
    });
  }
  async findOne(options: FindOptions): Promise<T> {
    const result = await this.find(options);
    if (result.length === 0) {
      throw new Error('Not found');
    }
    return result[0];
  }
  async save(item: T): Promise<T> {
    if (this.data.includes(item)) {
      this.remove(item);
    }
    this.data.push(item);
    return item;
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
