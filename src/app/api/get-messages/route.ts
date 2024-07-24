import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect.lib";
import UserModel from "@/model/user.model";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(request: Request) {
  // Connect to the MongoDB database
  await dbConnect();

  // Get the session data from NextAuth.js
  const session = await getServerSession(authOptions);

  // User can be undefined if not authenticated
  const user: User = session?.user as User;

  // Check if the user is authenticated
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

  // Convert the user ID to a MongoDB ObjectId (assuming user._id is a string)
  const userId = new mongoose.Types.ObjectId(user._id);
  try {
    // Perform aggregation to fetch user's messages
    const user = await UserModel.aggregate([
      {
        $match: { if: userId },
      },
      {
        $unwind: "$messages",
      },
      {
        $sort: { "messages.createdAt": -1 },
      },
      {
        $group: { _id: "$_id", messages: { $push: "$messafes" } },
      },
    ]);
    // Handle user not found or no messages
    if (!user || user.length === 0) {
      return Response.json(
        {
          success: false,
          message: "User nor found",
        },
        { status: 401 }
      );
    }
    // Respond with success message and user's messages
    return Response.json(
      {
        success: true,
        messages: user[0].messages,
      },
      { status: 200 }
    );
  } catch (error) {}
}
