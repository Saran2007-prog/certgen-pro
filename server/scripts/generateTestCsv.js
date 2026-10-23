const fs = require('fs');
const path = require('path');

// Target CSV output path in the workspace root
const outputPath = path.resolve(__dirname, '../../test_participants.csv');

// Header row
const headers = 'participantName,email,role';

// Sample participant rows
const participants = [
  'John Doe,john.doe@example.com,Winner',
  'Jane Smith,jane.smith@techsummit.org,Runner Up',
  'Michael Brown,michael.b@cyberlabs.io,Speaker',
  'Emily Davis,emily.davis@designcore.com,Participant',
  'Alex Vance,alex.vance@blackmesa.gov,Honorable Mention',
  'Sophia Jenkins,sophia.j@academy.edu,Attendee',
  'Lucas Grey,lucas.grey@securitynet.org,Special Recognition',
  'Elena Fisher,elena.fisher@adventurepress.com,Participant'
];

const csvContent = [headers, ...participants].join('\n') + '\n';

try {
  fs.writeFileSync(outputPath, csvContent, 'utf8');
  console.log(`[Success]: Generated test CSV file at: ${outputPath}`);
  console.log(`[Records Created]: ${participants.length} participant rows.`);
} catch (error) {
  console.error('[Error] Failed to generate test CSV file:', error.message);
  process.exit(1);
}
