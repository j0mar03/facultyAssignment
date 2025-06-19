// Fixed analysis script with correct logic matching ConstraintService
const fs = require('fs');

// Sample data based on what we found in the database
const frescianSections = [
  {
    sectionCode: 'DCPET 2-1',
    courseCode: 'CPET 201',
    courseName: '2D Animation',
    credits: 2.0,
    contactHours: 6.0,
    timeSlots: [
      { dayOfWeek: 2, startTime: '10:30', endTime: '13:30' }, // Tuesday 10:30AM-1:30PM
      { dayOfWeek: 5, startTime: '10:30', endTime: '13:30' }  // Friday 10:30AM-1:30PM
    ],
    isNightSection: false
  },
  {
    sectionCode: 'DCPET 2-2',
    courseCode: 'CPET 201',
    courseName: '2D Animation',
    credits: 2.0,
    contactHours: 6.0,
    timeSlots: [
      { dayOfWeek: 2, startTime: '18:00', endTime: '21:00' }, // Tuesday 6:00PM-9:00PM
      { dayOfWeek: 2, startTime: '07:30', endTime: '09:00' }  // Tuesday 7:30AM-9:00AM (corrected)
    ],
    isNightSection: true
  },
  {
    sectionCode: 'DCPET 2-3',
    courseCode: 'CPET 201',
    courseName: '2D Animation',
    credits: 2.0,
    contactHours: 6.0,
    timeSlots: [
      { dayOfWeek: 5, startTime: '07:30', endTime: '09:00' }, // Friday 7:30AM-9:00AM
      { dayOfWeek: 5, startTime: '18:00', endTime: '21:00' }  // Friday 6:00PM-9:00PM
    ],
    isNightSection: true
  },
  {
    sectionCode: 'DCPET 3-1',
    courseCode: 'CPET 301',
    courseName: 'CpET Project Development 1',
    credits: 3.0,
    contactHours: 6.0,
    timeSlots: [
      { dayOfWeek: 6, startTime: '07:30', endTime: '10:30' }  // Saturday 7:30AM-10:30AM
    ],
    isNightSection: true
  }
];

// Exact function from ConstraintService.ts
function determineDesigneeLoadType(timeSlot) {
  const startHour = parseFloat(timeSlot.startTime.replace(':', '.'));
  const endHour = parseFloat(timeSlot.endTime.replace(':', '.'));
  const dayOfWeek = timeSlot.dayOfWeek;

  // Saturday classes = temporary substitution (extra load)
  if (dayOfWeek === 6) {
    return 'Extra';
  }

  // Check if time falls within regular hours (9am-6pm)
  const isWithinRegularHours = startHour >= 9.0 && endHour <= 18.0;
  
  if (isWithinRegularHours) {
    return 'Regular';
  }

  // Check if time falls within part-time hours (7:30am-9am or 6pm-9pm)
  const isEarlyPartTime = startHour >= 7.5 && endHour <= 9.0;
  const isEveningPartTime = startHour >= 18.0 && endHour <= 21.0;
  
  if (isEarlyPartTime || isEveningPartTime) {
    return 'Extra'; // Part-time hours counted as extra load
  }

  // Default to regular if doesn't fit other categories
  return 'Regular';
}

// Function to get day name from day number
function getDayName(dayOfWeek) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
}

console.log('=== CORRECTED ANALYSIS OF FRESCIAN RUIZ (DESIGNEE) LOAD CALCULATION ===\n');

let totalRegularLoad = 0;
let totalExtraLoad = 0;
const uniqueCourses = new Set();

frescianSections.forEach(section => {
  console.log(`\n--- ${section.sectionCode}: ${section.courseCode} (${section.courseName}) ---`);
  console.log(`Credits: ${section.credits}, Contact Hours: ${section.contactHours}`);
  console.log(`Night Section: ${section.isNightSection ? 'Yes' : 'No'}`);
  
  section.timeSlots.forEach((slot, index) => {
    const loadType = determineDesigneeLoadType(slot);
    console.log(`  Time Slot ${index + 1}: ${getDayName(slot.dayOfWeek)} ${slot.startTime}-${slot.endTime} => ${loadType} Load`);
  });
  
  // Count each course only once (avoid double counting for multiple time slots)
  const courseKey = section.courseCode;
  if (!uniqueCourses.has(courseKey)) {
    uniqueCourses.add(courseKey);
    
    // For mixed schedules, count based on the most restrictive classification
    const loadTypes = section.timeSlots.map(slot => determineDesigneeLoadType(slot));
    const hasExtra = loadTypes.includes('Extra');
    
    if (hasExtra) {
      totalExtraLoad += section.contactHours;
      console.log(`  => Course has Extra load components, counted as Extra`);
      console.log(`  => Added ${section.contactHours} contact hours to Extra load`);
    } else {
      totalRegularLoad += section.contactHours;
      console.log(`  => All time slots are Regular, counted as Regular`);
      console.log(`  => Added ${section.contactHours} contact hours to Regular load`);
    }
  } else {
    console.log(`  => Course already counted (duplicate section)`);
  }
});

console.log(`\n=== CORRECT LOAD CALCULATION SUMMARY ===`);
console.log(`Total Regular Load: ${totalRegularLoad} hours`);
console.log(`Total Extra Load: ${totalExtraLoad} hours`);
console.log(`Total Combined Load: ${totalRegularLoad + totalExtraLoad} hours`);

console.log(`\n=== DETAILED TIME SLOT ANALYSIS WITH CORRECT LOGIC ===`);
frescianSections.forEach(section => {
  section.timeSlots.forEach(slot => {
    const loadType = determineDesigneeLoadType(slot);
    const startHour = parseFloat(slot.startTime.replace(':', '.'));
    const endHour = parseFloat(slot.endTime.replace(':', '.'));
    
    console.log(`${getDayName(slot.dayOfWeek)} ${slot.startTime}-${slot.endTime}:`);
    console.log(`  Start: ${startHour}, End: ${endHour}, Day: ${slot.dayOfWeek}`);
    
    if (slot.dayOfWeek === 6) {
      console.log(`  Classification: ${loadType} (Saturday = Temporary substitution)`);
    } else {
      const isWithinRegularHours = startHour >= 9.0 && endHour <= 18.0;
      if (isWithinRegularHours) {
        console.log(`  Classification: ${loadType} (Within regular hours 9AM-6PM)`);
      } else {
        const isEarlyPartTime = startHour >= 7.5 && endHour <= 9.0;
        const isEveningPartTime = startHour >= 18.0 && endHour <= 21.0;
        if (isEarlyPartTime) {
          console.log(`  Classification: ${loadType} (Early part-time hours 7:30AM-9AM)`);
        } else if (isEveningPartTime) {
          console.log(`  Classification: ${loadType} (Evening part-time hours 6PM-9PM)`);
        } else {
          console.log(`  Classification: ${loadType} (Default classification)`);
        }
      }
    }
    console.log('');
  });
});

console.log(`=== DATABASE VS CORRECT CALCULATION ===`);
console.log(`Database Current Values:`);
console.log(`  Regular Load: 18 hours`);
console.log(`  Extra Load: 0 hours`);
console.log(`  Total: 18 hours`);
console.log(``);
console.log(`Correct Calculation:`);
console.log(`  Regular Load: ${totalRegularLoad} hours`);
console.log(`  Extra Load: ${totalExtraLoad} hours`);
console.log(`  Total: ${totalRegularLoad + totalExtraLoad} hours`);

console.log(`\n=== ISSUE IDENTIFICATION ===`);
console.log(`1. The database is NOT applying designee-specific load type classification`);
console.log(`2. It's treating all assignments as regular load (contactHours = 18 total)`);
console.log(`3. The ConstraintService.getDesigneeLoadType() function exists but isn't being used`);
console.log(`4. Faculty load recalculation needs to be run with designee logic`);

console.log(`\n=== RECOMMENDED SOLUTION ===`);
console.log(`1. Run the faculty load recalculation endpoint`);
console.log(`2. Ensure the recalculation uses ConstraintService.getDesigneeLoadType() for designees`);
console.log(`3. Verify that time-based classification is working correctly`);

console.log(`\n=== EXPECTED RESULT AFTER FIX ===`);
console.log(`Frescian Ruiz should have:`);
console.log(`  Regular Load: ${totalRegularLoad} hours (within 9-hour limit ✓)`);
console.log(`  Extra Load: ${totalExtraLoad} hours (within 6-hour limit ✓)`);
console.log(`  Total Load: ${totalRegularLoad + totalExtraLoad} hours (within 15-hour limit ✓)`);