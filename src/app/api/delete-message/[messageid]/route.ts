// // src/app/api/delete-message/[messageid]/route.ts
// import { getServerSession } from "next-auth";
// import dbConnect from "@/lib/dbConnect";
// import UserModel from "@/model/User";
// import { authOptions } from "../../auth/[...nextauth]/options";

// export async function DELETE(
//   request: Request,
//   { params }: { params: { messageid: string } }
// ) {
//   const messageId = params.messageid;

//   await dbConnect();

//   const session = await getServerSession(authOptions);
//   const userId = (session?.user as any)?._id;

//   if (!session || !session.user || !userId) {
//     return Response.json(
//       {
//         success: false,
//         message: "Unauthorized",
//       },
//       { status: 401 }
//     );
//   }

//   try {
//     const updateResult = await UserModel.updateOne(
//       { _id: userId },
//       { $pull: { messages: { _id: messageId } } }
//     );

//     if (updateResult.modifiedCount === 0) {
//       return Response.json(
//         {
//           success: false,
//           message: "Message not found or already deleted",
//         },
//         { status: 404 }
//       );
//     }

//     return Response.json(
//       {
//         success: true,
//         message: "Message deleted",
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error deleting message:", error);
//     return Response.json(
//       {
//         success: false,
//         message: "Error deleting message",
//       },
//       { status: 500 }
//     );
//   }
// }
// src/app/api/delete-message/[messageid]/route.ts
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { User } from "next-auth";

export async function DELETE(request: Request, context: any) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user = session?.user as User | undefined;

  if (!session || !user) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const messageId = context.params?.messageid as string | undefined;

  if (!messageId) {
    return Response.json(
      { success: false, message: "Message ID is required" },
      { status: 400 }
    );
  }

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      user._id,
      { $pull: { messages: { _id: messageId } } },
      { new: true }
    );

    if (!updatedUser) {
      return Response.json(
        { success: false, message: "Failed to delete message" },
        { status: 404 }
      );
    }

    return Response.json(
      { success: true, message: "Message deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting message:", error);
    return Response.json(
      { success: false, message: "Error deleting message" },
      { status: 500 }
    );
  }
}
