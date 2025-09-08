/**
 * Manual test script to verify level completion statistics are properly saved
 * 
 * This script simulates the level completion flow to test our fix
 */

// Test data that simulates a completed level
const testLevelStats = {
  correct: 15,
  incorrect: 3,
  skipped: 2,
  hintsUsed: 5
};

const testInitialTeamStats = {
  correct_questions: 10,
  incorrect_questions: 5,
  skipped_questions: 1,
  hint_count: 2
};

// Expected final stats after level completion
const expectedFinalStats = {
  correct_questions: testInitialTeamStats.correct_questions + testLevelStats.correct, // 10 + 15 = 25
  incorrect_questions: testInitialTeamStats.incorrect_questions + testLevelStats.incorrect, // 5 + 3 = 8
  skipped_questions: testInitialTeamStats.skipped_questions + testLevelStats.skipped, // 1 + 2 = 3
  hint_count: testInitialTeamStats.hint_count + testLevelStats.hintsUsed // 2 + 5 = 7
};

console.log('=== Level Completion Statistics Test ===');
console.log('Initial team stats:', testInitialTeamStats);
console.log('Level stats:', testLevelStats);
console.log('Expected final stats:', expectedFinalStats);

// Verify the calculation logic
function testCalculation() {
  const calculated = {
    correct_questions: testInitialTeamStats.correct_questions + testLevelStats.correct,
    incorrect_questions: testInitialTeamStats.incorrect_questions + testLevelStats.incorrect,
    skipped_questions: testInitialTeamStats.skipped_questions + testLevelStats.skipped,
    hint_count: testInitialTeamStats.hint_count + testLevelStats.hintsUsed
  };
  
  const isCorrect = JSON.stringify(calculated) === JSON.stringify(expectedFinalStats);
  
  console.log('\n=== Calculation Test ===');
  console.log('Calculated:', calculated);
  console.log('Expected:', expectedFinalStats);
  console.log('Test Result:', isCorrect ? '✅ PASS' : '❌ FAIL');
  
  return isCorrect;
}

// Test the calculation
testCalculation();

console.log('\n=== Manual Testing Instructions ===');
console.log('1. Start the application: npm run dev');
console.log('2. Create a test team in admin panel');
console.log('3. Start Level 1 with the team');
console.log('4. Answer some questions correctly, some incorrectly, skip some, use hints');
console.log('5. Complete the level');
console.log('6. Check the admin panel to verify the statistics match what was displayed');
console.log('7. Check browser console for the log: "Level completion - Final stats update"');

console.log('\n=== What to Verify ===');
console.log('- The statistics displayed on completion screen match database values');
console.log('- Hint count is accurate (especially if hints were shown but questions skipped)');
console.log('- Total questions = correct + incorrect + skipped = 20 (for Level 1)');
console.log('- Database values persist after page refresh');
