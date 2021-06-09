const express = require('express');
const { check } = require('express-validator');
const usersController = require('../controllers/users-controller');
const router = express.Router();

//router.get('/', usersController.getUsers);

/*router.post(
  '/signup',
  [
    check('name').not().isEmpty(),
    check('email').isEmail().normalizeEmail(),
    check('password').trim().isLength({ min: 6 }),
  ],
  usersController.signup
);
*/
router.post(
  '/login',
  [
    check('email').isEmail().normalizeEmail(),
    check('password').trim().isLength({ min: 6 }),
  ],
  usersController.login
);

module.exports = router;
