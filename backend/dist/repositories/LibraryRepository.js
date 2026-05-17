import prisma from '../lib/prismaClient';
export class LibraryRepository {
    async findDiseases() {
        return prisma.disease.findMany({
            where: { isPublished: true },
            orderBy: { publishedDate: 'desc' },
        });
    }
    async findDrugs() {
        return prisma.drug.findMany({
            where: { isPublished: true },
            orderBy: { publishedDate: 'desc' },
        });
    }
    async findProcedures() {
        return prisma.procedure.findMany({
            where: { isPublished: true },
            orderBy: { publishedDate: 'desc' },
        });
    }
    async findLabTests() {
        return prisma.labTest.findMany({
            where: { isPublished: true },
            orderBy: { publishedDate: 'desc' },
        });
    }
}
export const libraryRepository = new LibraryRepository();
//# sourceMappingURL=LibraryRepository.js.map