const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const Course = require('../models/course');
const User = require('../models/user');
const mongoose = require('mongoose');
const fs = require('fs');

const getCourseById = async (req, res, next) => {
  const courseId = req.params.pid; //{pid: p1}
  let course;
  try {
    course = await Course.findById(courseId);
  } catch (e) {
    const error = new HttpError(
      'Something went wrong, could not find a course.',
      500
    );
    return next(error);
  }
  if (!course) {
    const error = new HttpError(
      'Could not find course for the provided id.',
      404
    );
    return next(error);
  }
  res.json({ course: course.toObject({ getters: true }) }); //{id: place} => { place: place}
};

const getCoursesByUserId = async (req, res, next) => {
  const userId = req.params.uid; //{pid: p1}

  let courses;
  try {
    courses = await Course.find({ creator: userId });
  } catch (e) {
    const error = new HttpError(
      'Fetching courses failed, please try again.',
      500
    );
    return next(error);
  }
  if (!courses || courses.length === 0) {
    return next(
      new HttpError('Could not find courses for the provided user id.', 404)
    );
  }
  res.json({
    courses: courses.map((course) => course.toObject({ getters: true })),
  }); //{creactor: place} => { place: place}
};

const createCourse = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid input passed, please check your data.', 422)
    );
  }
  const { title, lien, pourcentage } = req.body;

  // const title = req.body.title
  const createdCourse = new Course({
    title,
    lien,
    pourcentage,
    image: req.file.path,
    creator: req.userData.userId,
  });

  let user;

  try {
    user = await User.findById(req.userData.userId);
  } catch (e) {
    const error = new HttpError(
      'Creating course failed, please try again.',
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id.', 404);
    return next(error);
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await createdCourse.save({ session: session });
    user.courses.push(createdCourse);
    await user.save({ session: session });
    await session.commitTransaction();
  } catch (error) {
    return next(new HttpError('Create course failed, please try again.', 500));
  }

  res.status(201).json({ course: createdCourse });
};

const updateCourse = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      'Invalid input passed, please check your data.',
      422
    );
    return next(error);
  }
  const { title, lien, pourcentage } = req.body;
  const courseId = req.params.pid; //{pid: p1}

  let course;
  try {
    course = await Course.findById(courseId);
  } catch (e) {
    const error = new HttpError(
      'Something went wrong, could not update course.',
      500
    );
    return next(error);
  }

  if (course.creator.toString() !== req.userData.userId) {
    const error = new HttpError(
      'You are not allowed to edit this course.',
      401
    );
    return next(error);
  }
  course.title = title;
  course.lien = lien;
  course.pourcentage = pourcentage;

  try {
    await course.save();
  } catch (e) {
    const error = new HttpError(
      'Something went wrong, could not update course.',
      500
    );
    return next(error);
  }

  res.status(200).json({ course: (await course).toObject({ getters: true }) });
};

const deleteCourse = async (req, res, next) => {
  const courseId = req.params.pid; //{pid: p1}
  let course;
  try {
    course = await Course.findById(courseId).populate('creator');
  } catch (e) {
    const error = new HttpError(
      'Something went wrong, could not delete course.',
      500
    );
    return next(error);
  }

  if (!course) {
    const error = new HttpError('Could not find course.', 404);
    return next(error);
  }

  if (course.creator.id !== req.userData.userId) {
    const error = new HttpError(
      'You are not allowed to delete this course.',
      401
    );
    return next(error);
  }

  const imagePath = course.image;

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await course.remove({ session: session });
    course.creator.courses.pull(course);
    await course.creator.save({ session: session });
    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete course.',
      500
    );
    return next(error);
  }

  fs.unlink(imagePath, (err) => {
    console.log(err);
  });

  res.status(200).json({ message: 'Course deleted.' });
};

exports.getCourseById = getCourseById;
exports.getCoursesByUserId = getCoursesByUserId;
exports.createCourse = createCourse;
exports.updateCourse = updateCourse;
exports.deleteCourse = deleteCourse;
