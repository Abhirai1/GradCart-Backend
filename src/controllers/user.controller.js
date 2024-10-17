import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefreshTokes = async (userId) =>{
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await  user.save({validateBeforeSave:false}) // because we are saving the detail without sing required fields so we uses the validatebeforesave set as false        
         
        return {accessToken,refreshToken};
    }catch (error){
        throw new ApiError(500,"Something went wrong while genrating access and refresh token");
    }
}

const registerUser = asyncHandler (async (req,res)  => {
    // get user detail from frontend 
    // validation - not empty
    // check if user already exists - email se check karenge
    // check for avatar
    // upload cloudinary
    // create user objects - db create
    // remove password and refresh tocken from the resposnse
    // check for user creation
    // return response

    const { username, email, password, college } = req.body;
    console.log("email -> ",email);

    if (
        [username, email, password, college].some((fields) => fields?.trim() === "")
    ) {
        throw new ApiError(400,"All fields are required");
    }   

    const exitedUser = await User.findOne({email});

    if(exitedUser) throw new ApiError(409,"User already exists with this email!");

    const profileImageLocalPath = req.files?.profileImage[0]?.path;

    if(!profileImageLocalPath) throw new ApiError(400, "ProfileImage is required");

    const profileImage = await uploadOnCloudinary(profileImageLocalPath);

   const user = await User.create({
      username,
      email,
      password,
      college,
      profileImage:profileImage.url
    });

    const createUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // console.log("createUser - ",createUser);

    if(!createUser){
        throw new ApiError(500,"Something went wrong, while registering the user !");
    }

    return res.status(201).json(
        new ApiResponse(200,createUser,"user create successfully")
    )
})

const loginUser = asyncHandler (async (req,res) => {
    /* 
    1. req.body - data
    2. email
    3. find user
    4. compare password
    5. access and refresh tocken
    6. send kar do cookies me
    */

    const {email, username, password} = req.body;

    if(! (username || email) ) throw new ApiError(400,"email is required");

    const user = await User.findOne(
        {
            $or: [{username},{email}]
        }
    );

    if(!user) throw new ApiError(404,"User doesn't exists");

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid) throw new ApiError(401,"Invalid user credentials");

    const {accessToken,refreshToken} = await generateAccessAndRefreshTokes(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, 
                accessToken , refreshToken
            },
            "user logges in successfully"
        )
    )

})

const logoutUser = asyncHandler (async (req,res) => {
    /*
    1. find kar lo user but id knha se ?
    */

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          refreshToken: 1, // this removes the field from document
        },
      },
      {
        new: true,
      }
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "user logged out successfully"));
})

// Get All Users
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password -refreshToken");
  res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"));
});

// Get User by ID
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "-password -refreshToken"
  );
  if (!user) throw new ApiError(404, "User not found");
  res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
});

// Update User
export const updateUser = asyncHandler(async (req, res) => {
  const { username, college } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  if (username) user.username = username;
  if (college) user.college = college;
  await user.save();
  const updatedUser = await User.findById(req.params.id).select(
    "-password -refreshToken"
  );
  res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

// Delete User
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  res.status(200).json(new ApiResponse(200, {}, "User deleted successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
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

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokes(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };