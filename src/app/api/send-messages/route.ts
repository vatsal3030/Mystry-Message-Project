// import dbConnect from "@/lib/dbConnect";
// import UserModel from "@/model/User";
// import { Message } from "@/model/User";

// export async function POST(request: Request) {
//     await dbConnect()
//     const { username, content } = await request.json()
//     try {
//         const user = await UserModel.findOne({ username })
//         if (!user) {
//             return Response.json(
//                 {
//                     success: false,
//                     message: "User not found"
//                 },
//                 { status: 404 }
//             );
//         }

//         if (!user.isAcceptingMessages) {
//             return Response.json(
//                 {
//                     success: false,
//                     message: "User is not accepting messages"
//                 },
//                 { status: 403 }
//             );
//         }
//         const newMessage = { content, createdAt: new Date() }
//         user.messages.push(newMessage as Message)
//         await user.save()

//         return Response.json(
//             {
//                 success: true,
//                 message: "Message sent successfully"
//             },
//             { status: 200 }
//         );
//     } catch (error) {
//         console.log("Error in sending message", error);
//         return Response.json(
//             {
//                 success: false,
//                 message: "Error in sending message"
//             },
//             { status: 500   }
//         );
//     }
// }

// src/app/api/send-message/route.ts
import dbConnect from "@/lib/dbConnect";
import UserModel, { Message } from "@/model/User";
import { z } from "zod";

const SendMessageSchema = z.object({
    username: z.string().min(1, { message: "Username is required" }),
    content: z.string().min(1, { message: "Message content cannot be empty" }),
});

export async function POST(request: Request) {
    await dbConnect();

    try {
        const body = await request.json();

        // Validate input
        const result = SendMessageSchema.safeParse(body);

        if (!result.success) {
            const err = result.error.flatten();
            const message = err.formErrors[0] || err.fieldErrors.username?.[0] || "Invalid input";
            return Response.json({ success: false, message }, { status: 400 });

        }

        const { username, content } = result.data;

        const user = await UserModel.findOne({ username });

        if (!user) {
            return Response.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        if (!user.isAcceptingMessages) {
            return Response.json(
                { success: false, message: "User is not accepting messages" },
                { status: 403 }
            );
        }

        const newMessage: Message = {
            content,
            createdAt: new Date(),
        } as Message;

        user.messages.push(newMessage);
        await user.save();

        return Response.json(
            { success: true, message: "Message sent successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error in sending message:", error);

        return Response.json(
            { success: false, message: "Error in sending message" },
            { status: 500 }
        );
    }
}
