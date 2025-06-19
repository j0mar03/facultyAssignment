// Test the fixed constraint logic
function timeToDecimalHours(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours + (minutes / 60);
}

function determineDesigneeLoadType(timeSlot) {
  const startHour = timeToDecimalHours(timeSlot.startTime);
  const endHour = timeToDecimalHours(timeSlot.endTime);
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

// Test the problematic time slots
const testSlots = [
  { dayOfWeek: 2, startTime: '07:30', endTime: '09:00', description: 'Tuesday 7:30AM-9:00AM' },
  { dayOfWeek: 2, startTime: '10:30', endTime: '13:30', description: 'Tuesday 10:30AM-1:30PM' },
  { dayOfWeek: 2, startTime: '18:00', endTime: '21:00', description: 'Tuesday 6:00PM-9:00PM' },
  { dayOfWeek: 5, startTime: '07:30', endTime: '09:00', description: 'Friday 7:30AM-9:00AM' },
  { dayOfWeek: 5, startTime: '10:30', endTime: '13:30', description: 'Friday 10:30AM-1:30PM' },
  { dayOfWeek: 5, startTime: '18:00', endTime: '21:00', description: 'Friday 6:00PM-9:00PM' },
  { dayOfWeek: 6, startTime: '07:30', endTime: '10:30', description: 'Saturday 7:30AM-10:30AM' },
];

console.log('=== TESTING FIXED CONSTRAINT LOGIC ===\n');

testSlots.forEach(slot => {
  const loadType = determineDesigneeLoadType(slot);
  const startDecimal = timeToDecimalHours(slot.startTime);
  const endDecimal = timeToDecimalHours(slot.endTime);
  
  console.log(`${slot.description}:`);
  console.log(`  Time range: ${startDecimal} - ${endDecimal} (decimal hours)`);
  console.log(`  Load type: ${loadType}`);
  
  if (slot.dayOfWeek === 6) {
    console.log(`  Reason: Saturday = temporary substitution`);
  } else {
    const isRegular = startDecimal >= 9.0 && endDecimal <= 18.0;
    const isEarlyPartTime = startDecimal >= 7.5 && endDecimal <= 9.0;
    const isEveningPartTime = startDecimal >= 18.0 && endDecimal <= 21.0;
    
    if (isRegular) {
      console.log(`  Reason: Within regular hours (9AM-6PM)`);
    } else if (isEarlyPartTime) {
      console.log(`  Reason: Early part-time hours (7:30AM-9AM)`);
    } else if (isEveningPartTime) {
      console.log(`  Reason: Evening part-time hours (6PM-9PM)`);
    } else {
      console.log(`  Reason: Default (outside specific categories)`);
    }
  }
  console.log('');
});

// Recalculate Frescian's loads with fixed logic
const frescianCourses = [
  {
    code: 'CPET 201',
    contactHours: 6,
    timeSlots: [
      { dayOfWeek: 2, startTime: '10:30', endTime: '13:30' }, // Regular
      { dayOfWeek: 5, startTime: '10:30', endTime: '13:30' }, // Regular
      { dayOfWeek: 2, startTime: '18:00', endTime: '21:00' }, // Extra
      { dayOfWeek: 2, startTime: '07:30', endTime: '09:00' }, // Extra (FIXED!)
      { dayOfWeek: 5, startTime: '07:30', endTime: '09:00' }, // Extra (FIXED!)
      { dayOfWeek: 5, startTime: '18:00', endTime: '21:00' }, // Extra
    ]
  },
  {
    code: 'CPET 301',
    contactHours: 6,
    timeSlots: [
      { dayOfWeek: 6, startTime: '07:30', endTime: '10:30' }, // Extra (Saturday)
    ]
  }
];

let correctedRegularLoad = 0;
let correctedExtraLoad = 0;

console.log('=== CORRECTED LOAD CALCULATION FOR FRESCIAN RUIZ ===\n');

frescianCourses.forEach(course => {
  const loadTypes = course.timeSlots.map(slot => determineDesigneeLoadType(slot));
  const hasRegular = loadTypes.includes('Regular');
  const hasExtra = loadTypes.includes('Extra');
  
  console.log(`Course ${course.code} (${course.contactHours} contact hours):`);
  course.timeSlots.forEach((slot, i) => {
    const loadType = determineDesigneeLoadType(slot);
    console.log(`  ${slot.startTime}-${slot.endTime} (Day ${slot.dayOfWeek}): ${loadType}`);
  });
  
  if (hasExtra) {
    correctedExtraLoad += course.contactHours;
    console.log(`  => Classified as Extra Load (has extra load time slots)`);
  } else {
    correctedRegularLoad += course.contactHours;
    console.log(`  => Classified as Regular Load (all regular time slots)`);
  }
  console.log('');
});

console.log(`CORRECTED TOTALS:`);
console.log(`Regular Load: ${correctedRegularLoad} hours`);
console.log(`Extra Load: ${correctedExtraLoad} hours`);
console.log(`Total Load: ${correctedRegularLoad + correctedExtraLoad} hours`);

console.log(`\nCOMPLIANCE CHECK (Designee limits: 9 regular, 6 extra):`);
console.log(`Regular: ${correctedRegularLoad}/9 hours ${correctedRegularLoad <= 9 ? '✓' : '✗'}`);
console.log(`Extra: ${correctedExtraLoad}/6 hours ${correctedExtraLoad <= 6 ? '✓' : '✗'}`);
console.log(`Total: ${correctedRegularLoad + correctedExtraLoad}/15 hours ${(correctedRegularLoad + correctedExtraLoad) <= 15 ? '✓' : '✗'}`);