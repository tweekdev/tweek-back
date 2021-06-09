const express = require('express');
const { check } = require('express-validator');
const projectsController = require('../controllers/projects-controller');
const fileUpload = require('../middleware/file-upload');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
router.get('/', projectsController.getProjectsById);
router.get('/:pid', projectsController.getProjectById);

router.get('/user/:uid', projectsController.getProjectsByUserId);

router.use(checkAuth);

router.post(
  '/',
  fileUpload.single('image'),
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    check('technos').not().isEmpty(),
    check('lien').not().isEmpty(),
    check('repository').not().isEmpty(),
  ],
  projectsController.createProject
);

router.patch(
  '/:pid',
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    check('technos').not().isEmpty(),
    check('lien').not().isEmpty(),
    check('repository').not().isEmpty(),
  ],
  projectsController.updateProject
);

router.delete('/:pid', projectsController.deleteProject);

module.exports = router;
