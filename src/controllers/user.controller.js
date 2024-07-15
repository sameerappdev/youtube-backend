import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { validateEmail } from "../helpers/index.js";
import { User } from "../models/user.model.js";
import { uploadFile, cleanUpTempFiles } from "../utils/FileUploader.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const options = {
  httpOnly: true,
  secure: true,
};

const generateAccessandRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Saving refreshToken in user data without any validation
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Returning Tokens
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};

const createUser = asyncHandler(async (req, res) => {
  // GET user detail from FE
  // Validation of Body Data
  // check for images, check for avatar
  // Check if user already exist: username, email
  // upload images to cloud
  // create user object - create user entry in db
  // remove password and refresh token from response
  // check for user creation
  // send response

  const { username, fullName, email, password } = req.body;
  console.log({ username, fullName, email, password });

  const avatarLocalPath = req.files?.avatar[0]?.path;
  //   const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
    // Check if coverImage is received or not
    if (
      req.files &&
      Array.isArray(req.files?.coverImage) &&
      req.files.coverImage.length > 0
    ) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  try {
    if ([username, fullName, email, password].some((field) => field?.trim() === "")) {
      throw new ApiError(400, "All fields are required");
    } else if (!validateEmail(email)) {
      throw new ApiError(400, "Please enter a valid email");
    }

    const existedUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existedUser) {
      throw new ApiError(409, "User with username or email already existed");
    }

    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadFile(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadFile(coverImageLocalPath) : null;

    if (!avatar) {
      throw new ApiError(400, "Avatar file upload failed");
    }

    const user = await User.create({
      email,
      fullName,
      password,
      username: username.toLowerCase(),
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
    });

    const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while creating a user");
    }

  return res
    .status(201)
    .json(
      new ApiResponse(200, createdUser, "User has been created successfully")
    );
  } catch (error) {
    // Clean up temp files on any error
    cleanUpTempFiles([avatarLocalPath, coverImageLocalPath]);
    throw new ApiError(500, error?.message || "Something went wrong while creating a user");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  // Get email and password from user from body
  // req body -> data
  // find user via data
  // check password
  // generate access and refresh token
  // send data in cookies

  const { email, username, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exit");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessandRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Send Cookies
  // Cookies can be modified by default from the FE but by sending httpOnly and secure to true it can be only modified from the server
  // const options = {
  //   httpOnly: true,
  //   secure: true,
  // };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken)
    .json(
      new ApiResponse(
        200,
        "User has been logged in successfully",
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        }
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true, // By this the new response will be the updated value after the refreshToken removal
    }
  );

  // Clearing cookies and sending response
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User has been logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthenticated");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken != user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessandRefreshTokens(user?._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(200, "Access token refreshed", {
          accessToken,
          refreshToken: newRefreshToken,
        })
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export { createUser, loginUser, logoutUser, refreshAccessToken };
