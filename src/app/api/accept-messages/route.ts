import { getServerSession } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";


export async function POST(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return Response.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    const userId = (session.user as any)._id;
    const { acceptMessages } = await request.json(); // ✅ match frontend

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessages: acceptMessages },
            { new: true }
        );

        if (!updatedUser) {
            return Response.json(
                {
                    success: false,
                    message: "Failed to update accept message setting",
                },
                { status: 404 }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Accept message setting updated successfully",
                isAcceptingMessages: updatedUser.isAcceptingMessages,
            },
            { status: 200 }
        );
    } catch (error) {
        console.log("Failed to update accept message setting:", error);
        return Response.json(
            {
                success: false,
                message: "Failed to update accept message setting",
            },
            { status: 500 }
        );
    }
}


export async function GET(request: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions)
    const user: User = session?.user as User
    if (!session || !session.user) {
        return Response.json(
            {
                success: false,
                message: "Unauthorized"
            },
            { status: 401 }
        );
    }
    const userId = user._id

    try {
        const foundUser = await UserModel.findById(userId);
        if (!foundUser) {
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                { status: 404 }
            );
        }

        return Response.json(
            {
                success: true,
                isAcceptingMessages: foundUser.isAcceptingMessages
            },
            { status: 200 }
        );
    } catch (error) {
        console.log("Error in getting accept message setting", error);
        return Response.json(
            {
                success: false,
                message: "Error in getting accept message setting"
            },
            { status: 500 }
        );
    }

}






