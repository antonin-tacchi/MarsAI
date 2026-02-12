import { body, param } from "express-validator";


export const validateCreateRating = [
  body("film_id")
    .isInt({ min: 1 })
    .withMessage("film_id must be a positive integer"),
  
  body("rating")
    .isInt({ min: 1, max: 10 })
    .withMessage("Rating must be an integer between 1 and 10"),
  
  body("comment")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Comment must be a string with maximum 2000 characters"),
];


export const validateUpdateRating = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Rating ID must be a positive integer"),
  
  body("rating")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Rating must be an integer between 1 and 10"),
  
  body("comment")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Comment must be a string with maximum 2000 characters"),
];


export const validateGetRatingsByFilm = [
  param("filmId")
    .isInt({ min: 1 })
    .withMessage("Film ID must be a positive integer"),
];


export const validateGetRatingById = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Rating ID must be a positive integer"),
];
