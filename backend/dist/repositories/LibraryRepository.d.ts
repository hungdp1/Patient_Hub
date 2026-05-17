export interface ILibraryRepository {
    findDiseases(): Promise<unknown[]>;
    findDrugs(): Promise<unknown[]>;
    findProcedures(): Promise<unknown[]>;
    findLabTests(): Promise<unknown[]>;
}
export declare class LibraryRepository implements ILibraryRepository {
    findDiseases(): Promise<unknown[]>;
    findDrugs(): Promise<unknown[]>;
    findProcedures(): Promise<unknown[]>;
    findLabTests(): Promise<unknown[]>;
}
export declare const libraryRepository: LibraryRepository;
//# sourceMappingURL=LibraryRepository.d.ts.map