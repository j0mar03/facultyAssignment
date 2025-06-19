// Debug the exact constraint logic issue
function debugConstraintLogic() {
  const timeSlot = { dayOfWeek: 2, startTime: '07:30', endTime: '09:00' };
  
  const startHour = parseFloat(timeSlot.startTime.replace(':', '.'));
  const endHour = parseFloat(timeSlot.endTime.replace(':', '.'));
  const dayOfWeek = timeSlot.dayOfWeek;
  
  console.log('=== DEBUGGING 7:30AM-9:00AM TIME SLOT ===');
  console.log(`Time Slot: ${timeSlot.startTime}-${timeSlot.endTime}, Day: ${dayOfWeek}`);
  console.log(`Start Hour: ${startHour}, End Hour: ${endHour}`);
  console.log('');
  
  // Check Saturday
  console.log(`Is Saturday (day === 6)? ${dayOfWeek === 6}`);
  if (dayOfWeek === 6) {
    console.log('Result: Extra (Saturday rule)');
    return 'Extra';
  }
  
  // Check regular hours
  const isWithinRegularHours = startHour >= 9.0 && endHour <= 18.0;
  console.log(`Within regular hours (start >= 9.0 AND end <= 18.0)?`);
  console.log(`  start >= 9.0: ${startHour} >= 9.0 = ${startHour >= 9.0}`);
  console.log(`  end <= 18.0: ${endHour} <= 18.0 = ${endHour <= 18.0}`);
  console.log(`  Both conditions: ${isWithinRegularHours}`);
  
  if (isWithinRegularHours) {
    console.log('Result: Regular (within regular hours)');
    return 'Regular';
  }
  
  // Check part-time hours
  const isEarlyPartTime = startHour >= 7.5 && endHour <= 9.0;
  const isEveningPartTime = startHour >= 18.0 && endHour <= 21.0;
  
  console.log(`Early part-time (start >= 7.5 AND end <= 9.0)?`);
  console.log(`  start >= 7.5: ${startHour} >= 7.5 = ${startHour >= 7.5}`);
  console.log(`  end <= 9.0: ${endHour} <= 9.0 = ${endHour <= 9.0}`);
  console.log(`  Both conditions: ${isEarlyPartTime}`);
  
  console.log(`Evening part-time (start >= 18.0 AND end <= 21.0)?`);
  console.log(`  start >= 18.0: ${startHour} >= 18.0 = ${startHour >= 18.0}`);
  console.log(`  end <= 21.0: ${endHour} <= 21.0 = ${endHour <= 21.0}`);
  console.log(`  Both conditions: ${isEveningPartTime}`);
  
  const isPartTime = isEarlyPartTime || isEveningPartTime;
  console.log(`Is any part-time? ${isPartTime}`);
  
  if (isPartTime) {
    console.log('Result: Extra (part-time hours)');
    return 'Extra';
  }
  
  console.log('Result: Regular (default)');
  return 'Regular';
}

const result = debugConstraintLogic();
console.log('');
console.log(`FINAL RESULT: ${result}`);

console.log('');
console.log('=== ANALYSIS ===');
console.log('The 7:30AM-9:00AM slot should be Extra load because:');
console.log('1. startHour = 7.3 >= 7.5 = false (7.3 < 7.5)');
console.log('2. BUT 7:30 = 7.5 in decimal time!');
console.log('');
console.log('BUG FOUND: 7:30 should convert to 7.5, not 7.3!');
console.log('The issue is in the time parsing: "07:30".replace(":", ".") = "07.30"');
console.log('But parseFloat("07.30") = 7.3, not 7.5');
console.log('');
console.log('CORRECT CONVERSION:');
console.log('7:30 = 7 + (30/60) = 7.5');

console.log('');
console.log('=== TESTING CORRECT TIME CONVERSION ===');

function correctTimeToDecimal(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + (minutes / 60);
}

const correctedStartHour = correctTimeToDecimal('07:30');
const correctedEndHour = correctTimeToDecimal('09:00');

console.log(`Corrected start hour: ${correctedStartHour}`);
console.log(`Corrected end hour: ${correctedEndHour}`);

const correctedIsEarlyPartTime = correctedStartHour >= 7.5 && correctedEndHour <= 9.0;
console.log(`Corrected early part-time check: ${correctedStartHour} >= 7.5 AND ${correctedEndHour} <= 9.0 = ${correctedIsEarlyPartTime}`);

if (correctedIsEarlyPartTime) {
  console.log('CORRECTED RESULT: Extra (part-time hours)');
} else {
  console.log('CORRECTED RESULT: Still not part-time');
}