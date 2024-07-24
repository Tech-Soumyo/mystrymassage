import dbConnect from "@/lib/dbConnect.lib";
import UserModel from "@/model/user.model";
import { Message } from "@/model/user.model";

export async function POST(request: Request) {
  await dbConnect();

  // Extract username and message content from request body
  const { username, content } = await request.json();
  try {
    // Find user by username
    const user = await UserModel.findOne({ username });

    // Handle user not found
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }
    // Check if user is accepting messages
    if (!user.isAcceptingMessege) {
      return Response.json(
        {
          success: false,
          message: "User is not accepting the messages ",
        },
        { status: 403 }
      );
    }

    // Create a new message object
    const newMessage = { content, createdAt: new Date() };

    // Add the new message to the user's messages array
    user.messages.push(newMessage as Message);

    // Save the updated user document
    await user.save();

    // Respond with success message
    return Response.json(
      {
        success: true,
        message: "Message Sent Succesfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error adding messages", error);
    return Response.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
