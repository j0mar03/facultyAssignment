// Simple Node.js script to analyze designee faculty loads and time slots
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

// Function to determine load type for designee faculty based on time slot
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

console.log('=== ANALYSIS OF FRESCIAN RUIZ (DESIGNEE) LOAD CALCULATION ===\n');

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
    
    // Determine overall load type for this section based on its time slots
    const loadTypes = section.timeSlots.map(slot => determineDesigneeLoadType(slot));
    const hasRegular = loadTypes.includes('Regular');
    const hasExtra = loadTypes.includes('Extra');
    
    let finalLoadType;
    if (hasRegular && hasExtra) {
      // Mixed schedule - we need to decide how to handle this
      finalLoadType = 'Mixed (Regular + Extra)';
    } else if (hasRegular) {
      finalLoadType = 'Regular';
      totalRegularLoad += section.contactHours;
    } else {
      finalLoadType = 'Extra';
      totalExtraLoad += section.contactHours;
    }
    
    console.log(`  => Final Load Type: ${finalLoadType}`);
    if (finalLoadType !== 'Mixed (Regular + Extra)') {
      console.log(`  => Added ${section.contactHours} contact hours to ${finalLoadType} load`);
    }
  } else {
    console.log(`  => Course already counted (duplicate section)`);
  }
});

console.log(`\n=== LOAD CALCULATION SUMMARY ===`);
console.log(`Total Regular Load: ${totalRegularLoad} hours`);
console.log(`Total Extra Load: ${totalExtraLoad} hours`);
console.log(`Total Combined Load: ${totalRegularLoad + totalExtraLoad} hours`);

console.log(`\n=== DESIGNEE LIMITS (Based on ConstraintService) ===`);
console.log(`Regular Load Limit: 9 hours`);
console.log(`Extra Load Limit: 6 hours`);
console.log(`Maximum Total: 15 hours`);

console.log(`\n=== COMPLIANCE CHECK ===`);
console.log(`Regular Load: ${totalRegularLoad}/9 hours ${totalRegularLoad <= 9 ? '✓' : '✗'}`);
console.log(`Extra Load: ${totalExtraLoad}/6 hours ${totalExtraLoad <= 6 ? '✓' : '✗'}`);
console.log(`Total Load: ${totalRegularLoad + totalExtraLoad}/15 hours ${(totalRegularLoad + totalExtraLoad) <= 15 ? '✓' : '✗'}`);

console.log(`\n=== IDENTIFIED ISSUES ===`);
console.log(`1. Database shows currentRegularLoad: 18, currentExtraLoad: 0`);
console.log(`2. But calculated loads should be: Regular: ${totalRegularLoad}, Extra: ${totalExtraLoad}`);
console.log(`3. Current database calculation appears to be using contactHours incorrectly`);
console.log(`4. Time slot categorization needs to be applied for designee faculty`);

console.log(`\n=== TIME SLOT CATEGORIZATION RULES FOR DESIGNEES ===`);
console.log(`Regular Hours: 9:00 AM - 6:00 PM (weekdays)`);
console.log(`Extra Hours (Part-time): 7:30 AM - 9:00 AM and 6:00 PM - 9:00 PM (weekdays)`);
console.log(`Extra Hours (Temporary): Saturday classes (all times)`);

console.log(`\n=== DETAILED TIME SLOT ANALYSIS ===`);
frescianSections.forEach(section => {
  section.timeSlots.forEach(slot => {
    const loadType = determineDesigneeLoadType(slot);
    const startHour = parseFloat(slot.startTime.replace(':', '.'));
    const endHour = parseFloat(slot.endTime.replace(':', '.'));
    
    console.log(`${getDayName(slot.dayOfWeek)} ${slot.startTime}-${slot.endTime}:`);
    console.log(`  Start: ${startHour}, End: ${endHour}, Day: ${slot.dayOfWeek}`);
    console.log(`  Classification: ${loadType}`);
    
    if (slot.dayOfWeek === 6) {
      console.log(`  Reason: Saturday = Temporary substitution (Extra)`);
    } else if (startHour >= 9.0 && endHour <= 18.0) {
      console.log(`  Reason: Within regular hours 9AM-6PM (Regular)`);
    } else if ((startHour >= 7.5 && endHour <= 9.0) || (startHour >= 18.0 && endHour <= 21.0)) {
      console.log(`  Reason: Part-time hours 7:30AM-9AM or 6PM-9PM (Extra)`);
    } else {
      console.log(`  Reason: Default (Regular)`);
    }
    console.log('');
  });
});