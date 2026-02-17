const Department = require('../models/Department');

async function getDepartmentForHod(userId) {
  const department = await Department.findOne({ hod: userId });
  if (!department) {
    const err = new Error('HOD not assigned to a department');
    err.status = 403;
    throw err;
  }
  return department;
}

module.exports = {
  getDepartmentForHod,
};
