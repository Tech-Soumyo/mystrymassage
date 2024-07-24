import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect.lib";
import UserModel from "@/model/user.model";
import { senderVerificationEmail } from "@/helper/senderVerificationEmail.helper";

export async function POST(request: Request) {
  await dbConnect();

  try {
    // Extract user data from request body
    const { username, email, password } = await request.json();
    // Check for existing verified user with same username
    const existingUserVerifiedByUserName = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUserName) {
      return Response.json(
        {
          success: false,
          message: "UserName is already taken",
        },
        { status: 400 }
      );
    }
    // Check for existing user with same email
    const existingUserByEmail = await UserModel.findOne({
      email,
    });
    const verifyCode = Math.floor(10000 + Math.random() * 900000).toString();

    // Handle existing user with unverified email
    if (existingUserByEmail) {
      if (existingUserByEmail.isVeryfied) {
        return Response.json(
          {
            success: false,
            message: "User already exist with this email",
          },
          { status: 400 }
        );
      } else {
        // Update existing user with new password and verification details
        const hasedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hasedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existingUserByEmail.save();
      }
    } else {
      // Create a new user
      const hasedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hasedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVeryfied: false,
        isAcceptingMessege: true,
        messages: [],
      });

      await newUser.save();
    }
    // send verification email
    const emailResponse = await senderVerificationEmail(
      email,
      username,
      verifyCode
    );

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }
    // Respond with success message
    return Response.json(
      {
        success: true,
        message: "User registered successfully. Please verify your Email",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering", error);
    return Response.json(
      {
        success: false,
        message: "Error registering user",
      },
      {
        status: 500,
      }
    );
  }
}
