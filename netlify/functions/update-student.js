// const fs = require('fs').promises;
// const path = require('path');

// exports.handler = async function(event, context) {
//     try {
//         if (event.httpMethod !== 'POST') {
//             return {
//                 statusCode: 405,
//                 body: JSON.stringify({ message: 'Method Not Allowed' })
//             };
//         }

//         const { students } = JSON.parse(event.body);
//         const filePath = path.join(__dirname, '../../student.json');

//         // Write updated students to student.json
//         await fs.writeFile(filePath, JSON.stringify(students, null, 2));

//         return {
//             statusCode: 200,
//             body: JSON.stringify({ message: 'Student data updated successfully' })
//         };
//     } catch (error) {
//         console.error('Error updating student.json:', error);
//         return {
//             statusCode: 500,
//             body: JSON.stringify({ message: 'Error updating student data' })
//         };
//     }
// };
