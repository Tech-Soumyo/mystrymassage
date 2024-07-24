import dbConnect from "@/lib/dbConnect.lib";
import UserModel from "@/model/user.model";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

// Update user's message acceptance status
export async function POST(request: Request) {
  await dbConnect();

  // Get user session data
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User; // User can be undefined if not authenticated

  // Check for authentication
  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not authenticated",
      },
      {
        status: 401,
      }
    );
  }

  // Extract user ID from session
  const userId = user._id;
  // Extract data from request body
  const { acceptMessages } = await request.json();

  try {
    // Update user document with new message acceptance status
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessege: acceptMessages },
      { new: true } // Return the updated document
    );
    // Handle unsuccessful update
    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "failed to update user status to accept messages",
        },
        { status: 401 }
      );
    }
    // Respond with success message
    return Response.json(
      {
        success: true,
        message: "Message acceptence status is updated successfully ",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("failed to update user status to accept messages");
    return Response.json(
      {
        success: false,
        message: "failed to update user status to accept messages",
      },
      { status: 500 }
    );
  }
}

// Get user's message acceptance status
export async function GET(request: Request) {
  await dbConnect();

  // Get user session data
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  // Check for authentication
  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not authenticated",
      },
      {
        status: 401,
      }
    );
  }

  const userId = user._id;
  try {
    // Find user document by ID
    const foundUser = await UserModel.findById(userId);
    // Handle user not found
    if (!foundUser) {
      return Response.json(
        {
          success: false,
          message: "failed to found user",
        },
        { status: 401 }
      );
    }
    // Respond with user's message acceptance status
    return Response.json(
      {
        success: true,
        isAcceptingMessages: foundUser.isAcceptingMessege,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error in getting messages acceptence in status");
    return Response.json(
      {
        success: false,
        message: "Error in getting messages acceptence in status",
      },
      { status: 500 }
    );
  }
}
