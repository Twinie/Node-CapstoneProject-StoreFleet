// Please don't change the pre-written code
// Import the necessary modules here

import { ErrorHandler } from "../../../utils/errorHandler.js";
import {
  addNewProductRepo,
  deleProductRepo,
  findProductRepo,
  getAllProductsRepo,
  getProductDetailsRepo,
  getTotalCountsOfProduct,
  updateProductRepo,
} from "../model/product.repository.js";
import { ObjectId } from "mongodb";
import ProductModel from "../model/product.schema.js";

export const addNewProduct = async (req, res, next) => {
  try {
    const product = await addNewProductRepo({
      ...req.body,
      createdBy: req.user._id,
    });
    if (product) {
      res.status(201).json({ success: true, product });
    } else {
      return next(new ErrorHandler(400, "some error occured!"));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const getAllProducts = async (req, res, next) => {
  // Implement the functionality for search, filter and pagination this function.
  try {
    const page = req.query.page;
    const keyword = req.query.keyword;
    const category = req.query.category;
    let pricegte;
    let pricelte;
    let ratinggte;
    let ratinglte;

    if (req.query.price) {
      console.log(req.query.price["gte"], req.query.price["lte"]);
      pricegte = req.query.price["gte"];
      pricelte = req.query.price["lte"];
    }
    if (req.query.rating) {
      console.log(req.query.rating["gte"]);
      ratinggte = req.query.rating["gte"];
      ratinglte = req.query.rating["lte"];
    }

    const getProducts = await getAllProductsRepo(
      page,
      keyword,
      category,
      pricegte,
      pricelte,
      ratinggte,
      ratinglte
    );
    res.status(201).json({ success: true, getProducts });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler(400, error));
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const updatedProduct = await updateProductRepo(req.params.id, req.body);
    if (updatedProduct) {
      res.status(200).json({ success: true, updatedProduct });
    } else {
      return next(new ErrorHandler(400, "Product not found!"));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const deletedProduct = await deleProductRepo(req.params.id);
    if (deletedProduct) {
      res.status(200).json({ success: true, deletedProduct });
    } else {
      return next(new ErrorHandler(400, "Product not found!"));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const getProductDetails = async (req, res, next) => {
  try {
    const productDetails = await getProductDetailsRepo(req.params.id);
    if (productDetails) {
      res.status(200).json({ success: true, productDetails });
    } else {
      return next(new ErrorHandler(400, "Product not found!"));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const rateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const { rating, comment } = req.body;
    const user = req.user._id;
    const name = req.user.name;
    const review = {
      user,
      name,
      rating: Number(rating),
      comment,
    };
    if (!rating) {
      return next(new ErrorHandler(400, "rating can't be empty"));
    }
    const product = await findProductRepo(productId);
    if (!product) {
      return next(new ErrorHandler(400, "Product not found!"));
    }
    const findRevieweIndex = product.reviews.findIndex((rev) => {
      return rev.user.toString() === user.toString();
    });
    if (findRevieweIndex >= 0) {
      product.reviews.splice(findRevieweIndex, 1, review);
    } else {
      product.reviews.push(review);
    }
    let avgRating = 0;
    product.reviews.forEach((rev) => {
      avgRating += rev.rating;
    });
    const updatedRatingOfProduct = avgRating / product.reviews.length;
    product.rating = updatedRatingOfProduct;
    await product.save({ validateBeforeSave: false });
    res
      .status(201)
      .json({ success: true, msg: "thx for rating the product", product });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

export const getAllReviewsOfAProduct = async (req, res, next) => {
  try {
    const product = await findProductRepo(req.params.id);
    if (!product) {
      return next(new ErrorHandler(400, "Product not found!"));
    }
    res.status(200).json({ success: true, reviews: product.reviews });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const deleteReview = async (req, res, next) => {
  // Insert the essential code into this controller wherever necessary to resolve issues related to removing reviews and updating product ratings.
  try {
    const userId = req.user._id;
    const { productId, reviewId } = req.query;
    if (!productId || !reviewId) {
      return next(
        new ErrorHandler(
          400,
          "pls provide productId and reviewId as query params"
        )
      );
    }
    const product = await findProductRepo(productId);
    if (!product) {
      return next(new ErrorHandler(400, "Product not found!"));
    }
    const reviews = product.reviews;

    const isReviewExistIndex = reviews.findIndex((rev) => {
      return rev._id.toString() === reviewId.toString();
    });
    if (isReviewExistIndex < 0) {
      return next(new ErrorHandler(400, "review doesn't exist"));
    }
    const reviewToBeDeleted = reviews[isReviewExistIndex];
    // console.log(reviewToBeDeleted.user, userId.toString());

    // only the user who created can delete the review
    if (reviewToBeDeleted.user === userId.toString()) {
      let avgRating = 0;
      reviews.splice(isReviewExistIndex, 1);
      product.reviews.forEach((review) => {
        avgRating += review.rating;
      });
      let updatedRatingOfProduct = 0;
      if (!product.reviews.length) {
        product.rating = updatedRatingOfProduct;
      } else {
        updatedRatingOfProduct = avgRating / product.reviews.length;
        product.rating = updatedRatingOfProduct;
        // console.log(updatedRatingOfProduct);
      }
      await product.save({ validateBeforeSave: false });
      res.status(200).json({
        success: true,
        msg: "review deleted successfully",
        deletedReview: reviewToBeDeleted,
        product,
      });
    } else {
      res.status(400).json({
        success: false,
        msg: "Cannot delete the review",
      });
    }
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};
