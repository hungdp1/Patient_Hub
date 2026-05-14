import prisma from '../lib/prismaClient';

export interface ILibraryRepository {
  findDiseases(): Promise<unknown[]>;
  findDrugs(): Promise<unknown[]>;
  findProcedures(): Promise<unknown[]>;
  findLabTests(): Promise<unknown[]>;
}

export class LibraryRepository implements ILibraryRepository {
  public async findDiseases(): Promise<unknown[]> {
    return prisma.disease.findMany({
      where: { isPublished: true },
      orderBy: { publishedDate: 'desc' },
    });
  }

  public async findDrugs(): Promise<unknown[]> {
    return prisma.drug.findMany({
      where: { isPublished: true },
      orderBy: { publishedDate: 'desc' },
    });
  }

  public async findProcedures(): Promise<unknown[]> {
    return prisma.procedure.findMany({
      where: { isPublished: true },
      orderBy: { publishedDate: 'desc' },
    });
  }

  public async findLabTests(): Promise<unknown[]> {
    return prisma.labTest.findMany({
      where: { isPublished: true },
      orderBy: { publishedDate: 'desc' },
    });
  }
}

export const libraryRepository = new LibraryRepository();
