import UserModel from "./user.schema.js";
import nodemailer from "nodemailer";
import fs from "fs";
import { promisify } from "util";
import path from "path";
import handlebars from "handlebars";
import mongoose from "mongoose";
import { ObjectId } from "mongoose";

const readFileAsync = promisify(fs.readFile);

export const createNewUserRepo = async (user) => {
  // return await new UserModel(user).save();
  const foundUser = await UserModel.findOne({
    email: user.email,
  });
  // console.log(foundUser);
  if (foundUser) {
    return {
      success: false,
      error: { statusCode: 400, msg: "email already registered" },
    };
  } else {
    const newUser = new UserModel(user);
    await newUser.save();
    return {
      success: true,
      statusCode: 200,
      user: newUser,
    };
  }
};

export const findUserRepo = async (factor, withPassword = false) => {
  if (withPassword) return await UserModel.findOne(factor).select("+password");
  else return await UserModel.findOne({ email: factor });
};

// sending otp via email using nodemailer - alternate way to send email for resetting password when there is a html email template file
// export const sendMailRepo = async (userEmail) => {
//   try {
//     const user = await UserModel.findOne({ email: userEmail });
//     // console.log(user);
//     if (user) {
//       const token = await user.getResetPasswordToken();
//       user.resetPasswordToken = token.resetToken;
//       user.resetPasswordExpire = token.resetPasswordExpire;
//       await user.save();

//       const htmlTemplate = await readFileAsync(
//         path.resolve("./frontend/email.html"),
//         "utf-8"
//       );

//       const template = handlebars.compile(htmlTemplate);
//       const replacements = {
//         username: user.name,
//         token: user.resetPasswordToken,
//       };
//       const finalHtml = template(replacements);
//       const imageAttachment = await readFileAsync(
//         path.resolve("./frontend/images/logo.png")
//       );

//       // Create an email transporter.
//       const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//           user: "codingninjas2k16@gmail.com",
//           pass: "slwvvlczduktvhdj",
//         },
//       });

//       //Configure email content
//       const mailOptions = {
//         from: "codingninjas2k16@gmail.com",
//         to: userEmail,
//         subject: "Token for Password Reset",
//         html: finalHtml,
//         attachments: [
//           {
//             filename: "logo.png",
//             content: imageAttachment,
//             encoding: "base64",
//             cid: "uniqueImageCID", // Referenced in the HTML template
//           },
//         ],
//       };

//       //Sending the email
//       const result = await transporter.sendMail(mailOptions);
//       console.log("Email sent successfully");
//       return { success: true, res: "Email sent successfully" };
//     }
//   } catch (error) {
//     console.log(error);
//     return { success: false, error: { statusCode: 400, msg: error } };
//   }
// };

export const findUserForPasswordResetRepo = async (hashtoken, password) => {
  const foundUser = await UserModel.findOne({
    resetPasswordToken: hashtoken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  foundUser.password = password;
  foundUser.resetPasswordToken = undefined;
  foundUser.resetPasswordExpire = undefined;
  await foundUser.save();
  // console.log(foundUser);
  return foundUser;
};

export const updateUserProfileRepo = async (_id, data) => {
  return await UserModel.findOneAndUpdate(_id, data, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
};

export const getAllUsersRepo = async () => {
  return UserModel.find({});
};

export const deleteUserRepo = async (_id) => {
  return await UserModel.findByIdAndDelete(_id);
};

export const updateUserRoleAndProfileRepo = async (_id, data) => {
  // Write your code here for updating the roles of other users by admin
  const { name, email, role } = data;
  const foundUserToModifyRole = await UserModel.findById(_id);
  if (foundUserToModifyRole) {
    foundUserToModifyRole.name = name;
    foundUserToModifyRole.email = email;
    foundUserToModifyRole.role = role;
    foundUserToModifyRole.save();
    return foundUserToModifyRole;
  }
};
