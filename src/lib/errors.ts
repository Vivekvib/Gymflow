/**
 * Thrown when a record is looked up scoped to a gymId and either doesn't
 * exist, or exists but belongs to a different gym. Callers must not
 * distinguish between the two cases in the error message shown to an
 * admin - "not found" either way - since doing so would leak that a
 * record exists in another tenant.
 */
export class NotFoundError extends Error {
  constructor(entity: string) {
    super(`${entity} not found`);
    this.name = "NotFoundError";
  }
}
