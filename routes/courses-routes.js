const express = require('express');
const { check } = require('express-validator');
const coursesController = require('../controllers/courses-controller');
const fileUpload = require('../middleware/file-upload');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
router.get('/:pid', coursesController.getCourseById);

router.get('/user/:uid', coursesController.getCoursesByUserId);

router.use(checkAuth);

router.post(
  '/',
  fileUpload.single('image'),
  [
    check('title').not().isEmpty(),
    check('pourcentage').not().isEmpty(),
    check('lien').not().isEmpty(),
  ],
  coursesController.createCourse
);

router.patch(
  '/:pid',
  [
    check('title').not().isEmpty(),
    check('pourcentage').not().isEmpty(),
    check('lien').not().isEmpty(),
  ],
  coursesController.updateCourse
);

router.delete('/:pid', coursesController.deleteCourse);

module.exports = router;
