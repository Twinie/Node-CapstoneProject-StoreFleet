import ProductModel from "./product.schema.js";

export const addNewProductRepo = async (product) => {
  return await new ProductModel(product).save();
};

export const getAllProductsRepo = async (
  page,
  keyword,
  category,
  pricegte,
  pricelte,
  ratinggte,
  ratinglte
) => {
  // console.log(pricegte);
  // const { page, keyword, category, pricegte, pricelte, ratinggte, ratinglte } =
  //   data;
  const limitCount = 2;
  const skipCount = (page - 1) * limitCount;
  let allProducts = await ProductModel.find({})
    .limit(limitCount)
    .skip(skipCount);
  if (keyword) {
    // console.log(keyword.charAt(0), keyword.split("").slice(1, -1).join(""));
    allProducts = await ProductModel.find({
      name: {
        $regex: `(?i)${keyword.charAt(0)}(?-i)${keyword
          .split("")
          .slice(1, -1)
          .join("")}`,
      },
    })
      .limit(limitCount)
      .skip(skipCount);
  }
  if (category) {
    allProducts = allProducts.filter((product) => {
      return product.category == category;
    });
  }
  if (pricegte) {
    allProducts = allProducts.filter((product) => {
      return product.price >= pricegte && product.price <= pricelte;
    });
  }

  if (ratinggte) {
    allProducts = allProducts.filter((product) => {
      return product.rating >= ratinggte && product.rating <= ratinglte;
    });
  }
  // else {
  //   allProducts = await ProductModel.find({}).limit(limitCount).skip(skipCount);
  // }
  return allProducts;
};

export const updateProductRepo = async (_id, updatedData) => {
  return await ProductModel.findByIdAndUpdate(_id, updatedData, {
    new: true,
    runValidators: true,
    useFindAndModify: true,
  });
};

export const deleProductRepo = async (_id) => {
  return await ProductModel.findByIdAndDelete(_id);
};

export const getProductDetailsRepo = async (_id) => {
  return await ProductModel.findById(_id);
};

export const getTotalCountsOfProduct = async () => {
  return await ProductModel.countDocuments();
};

export const findProductRepo = async (productId) => {
  return await ProductModel.findById(productId);
};
