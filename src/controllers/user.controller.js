import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { validateEmail } from "../helpers/index.js";
import { User } from "../models/user.model.js";
import { uploadFile } from "../utils/FileUploader.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createUser = asyncHandler(async (req, res) => {
  // GET user detail from FE
  // Validation of Body Data
  // Check if user already exist: username, email
  // check for images, check for avatar
  // upload images to cloud
  // create user object - create user entry in db
  // remove password and refresh token from response
  // check for user creation
  // send response

  const { username, fullName, email, password } = req.body;
  console.log({ username, fullName, email, password });

  if (
    [username, fullName, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  } else if (!validateEmail(email)) {
    throw new ApiError(400, "Please enter a valid email");
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with username or email already existed");
  }

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

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadFile(avatarLocalPath);
  const coverImage = await uploadFile(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
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
});

export { createUser };
