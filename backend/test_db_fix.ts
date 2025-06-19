import 'reflect-metadata';
import { AppDataSource } from './src/config/database';
import { Faculty } from './src/entities/Faculty';
import { Section } from './src/entities/Section';
import { ConstraintService } from './src/services/ConstraintService';

async function testLoadCalculation() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected successfully');

    const facultyRepo = AppDataSource.getRepository(Faculty);
    const sectionRepo = AppDataSource.getRepository(Section);

    // Find Frescian Ruiz
    const frescian = await facultyRepo.findOne({
      where: { firstName: 'Frescian C.', lastName: 'Ruiz' },
      relations: ['sections', 'sections.course']
    });

    if (!frescian) {
      console.log('Frescian Ruiz not found');
      return;
    }

    console.log('\n=== FRESCIAN RUIZ LOAD ANALYSIS ===');
    console.log(`Name: ${frescian.fullName}`);
    console.log(`Type: ${frescian.type}`);
    console.log(`Current Database Values:`);
    console.log(`  Regular Load: ${frescian.currentRegularLoad}`);
    console.log(`  Extra Load: ${frescian.currentExtraLoad}`);

    console.log('\n=== SECTIONS ASSIGNED TO FRESCIAN ===');
    
    let calculatedRegularLoad = 0;
    let calculatedExtraLoad = 0;
    const processedCourses = new Set<string>();

    for (const section of frescian.sections) {
      console.log(`\nSection: ${section.sectionCode} - ${section.course.code} (${section.course.name})`);
      console.log(`Contact Hours: ${section.course.contactHours}`);
      console.log(`Time Slots: ${JSON.stringify(section.timeSlots)}`);
      
      // Test each time slot with the fixed constraint service
      if (section.timeSlots) {
        section.timeSlots.forEach((slot: any, index: number) => {
          const loadType = ConstraintService.getDesigneeLoadType(slot);
          console.log(`  Slot ${index + 1}: Day ${slot.dayOfWeek}, ${slot.startTime}-${slot.endTime} => ${loadType} Load`);
        });
      }

      // Count each course only once
      const courseKey = section.course.code;
      if (!processedCourses.has(courseKey)) {
        processedCourses.add(courseKey);
        
        // Check if any time slot is Extra load
        const hasExtraLoad = section.timeSlots?.some((slot: any) => 
          ConstraintService.getDesigneeLoadType(slot) === 'Extra'
        );
        
        if (hasExtraLoad) {
          calculatedExtraLoad += parseInt(section.course.contactHours.toString());
          console.log(`  => Course classified as Extra Load (+${section.course.contactHours} hours)`);
        } else {
          calculatedRegularLoad += parseInt(section.course.contactHours.toString());
          console.log(`  => Course classified as Regular Load (+${section.course.contactHours} hours)`);
        }
      } else {
        console.log(`  => Course already counted (multiple sections)`);
      }
    }

    console.log('\n=== CALCULATED LOADS (Fixed Logic) ===');
    console.log(`Regular Load: ${calculatedRegularLoad} hours`);
    console.log(`Extra Load: ${calculatedExtraLoad} hours`);
    console.log(`Total Load: ${calculatedRegularLoad + calculatedExtraLoad} hours`);

    console.log('\n=== DESIGNEE LIMITS ===');
    console.log(`Regular Limit: 9 hours`);
    console.log(`Extra Limit: 6 hours`);
    console.log(`Total Limit: 15 hours`);

    console.log('\n=== COMPLIANCE CHECK ===');
    console.log(`Regular: ${calculatedRegularLoad}/9 ${calculatedRegularLoad <= 9 ? '✓' : '✗'}`);
    console.log(`Extra: ${calculatedExtraLoad}/6 ${calculatedExtraLoad <= 6 ? '✓' : '✗'}`);
    console.log(`Total: ${calculatedRegularLoad + calculatedExtraLoad}/15 ${(calculatedRegularLoad + calculatedExtraLoad) <= 15 ? '✓' : '✗'}`);

    console.log('\n=== UPDATE NEEDED ===');
    const needsUpdate = frescian.currentRegularLoad !== calculatedRegularLoad || 
                       frescian.currentExtraLoad !== calculatedExtraLoad;
    
    if (needsUpdate) {
      console.log('✗ Database values need to be updated');
      console.log(`Should update to: Regular=${calculatedRegularLoad}, Extra=${calculatedExtraLoad}`);
      
      // Update the database
      frescian.currentRegularLoad = calculatedRegularLoad;
      frescian.currentExtraLoad = calculatedExtraLoad;
      await facultyRepo.save(frescian);
      console.log('✓ Database updated successfully');
    } else {
      console.log('✓ Database values are correct');
    }

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
  }
}

testLoadCalculation();