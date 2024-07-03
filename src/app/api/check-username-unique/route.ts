import dbConnect from "@/lib/dbConnect.lib";
import UserModel from "@/model/user.model";
import { userNameValidation } from "@/schema/signup.schema";
import { z } from "zod";

const UsernameQuerySchema = z.object({
  username: userNameValidation,
});

export async function GET(request: Request) {
  // if(request.method !== 'GET'){
  //   return Response.json(
  //     {
  //       success: false,
  //       message: "Only GET Method is allowed",
  //     },
  //     { status: 405 }
  //   );
  // }
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const queryParam = {
      username: searchParams.get("username"),
    };
    // validate with ZOD
    const result = UsernameQuerySchema.safeParse(queryParam);
    // console.log(result);

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(", ")
              : "Invalid query parameters",
        },
        { status: 400 }
      );
    }

    const { username } = result.data;

    const existingVarifiedUser = await UserModel.findOne({
      username,
      isvarified: true,
    });
    if (existingVarifiedUser) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 }
      );
    }
    return Response.json(
      {
        success: true,
        message: "Username is unique",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error checking username", error);
    return Response.json(
      {
        success: false,
        message: "Error checking username",
      },
      {
        status: 500,
      }
    );
  }
}
