const express = require('express');
const Department = require('../models/Department');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const departments = await Department.find().sort('name').select('_id name code description');
    res.json(departments);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
