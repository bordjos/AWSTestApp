interface IRepository<T> {
  getById(id: string): Promise<T | undefined>;
  create(item: T): Promise<void>;
  update(id: string, item: T): Promise<void>;
  delete(id: string): Promise<void>;
}
