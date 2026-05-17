export interface IHospitalServiceRepository {
    findActiveServices(): Promise<unknown[]>;
}
export declare class HospitalServiceRepository implements IHospitalServiceRepository {
    findActiveServices(): Promise<unknown[]>;
}
export declare const hospitalServiceRepository: HospitalServiceRepository;
//# sourceMappingURL=HospitalServiceRepository.d.ts.map