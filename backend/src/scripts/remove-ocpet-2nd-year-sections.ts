import { In } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Section } from '../entities/Section';
import { Assignment } from '../entities/Assignment';

async function removeOcpetSecondYearSections() {
  await AppDataSource.initialize();
  const sectionRepo = AppDataSource.getRepository(Section);
  const assignmentRepo = AppDataSource.getRepository(Assignment);

  const semester = 'Second';
  const academicYear = '2025-2026';

  console.log('🔎 Finding OCPET 2nd year sections (Second Sem 2025-2026)...');
  const sections = await sectionRepo.find({
    where: {
      sectionCode: In(['OCPET 2-1', 'OCPET 2-2', 'OCPET 2-3']),
      semester,
      academicYear,
      isActive: true
    }
  });

  if (sections.length === 0) {
    console.log('No active OCPET sections found. Nothing to remove.');
    await AppDataSource.destroy();
    return;
  }

  const sectionIds = sections.map((s) => s.id);
  console.log(`Found ${sections.length} sections. Removing related assignments...`);

  const deleteResult = await assignmentRepo.delete({ sectionId: In(sectionIds) });
  console.log(`Deleted ${deleteResult.affected || 0} assignments linked to OCPET sections.`);

  console.log('Soft-deactivating OCPET sections...');
  await sectionRepo.update({ id: In(sectionIds) }, { isActive: false });

  console.log('✅ Completed. OCPET sections are now inactive and their assignments removed.');
  await AppDataSource.destroy();
}

if (require.main === module) {
  removeOcpetSecondYearSections().catch((err) => {
    console.error('❌ Error removing OCPET sections:', err);
    process.exit(1);
  });
}

