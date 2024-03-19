export class RepositoryValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "RepositoryValidationError";
    }
}