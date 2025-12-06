// import dbConnect from "@/lib/dbConnect";
// import UserModel from "@/model/User";

// export async function POST(request: Request) {

//     await dbConnect();
//     try {
//         const { username, code } = await request.json()
//         const decodedUsername = decodeURIComponent(username)
//         const user = await UserModel.findOne({ username: decodedUsername })
//         if (!user) {
//             return Response.json(
//                 {
//                     success: false,
//                     message: "User not found"
//                 },
//                 { status: 500 }
//             );
//         }
//         const isCodeValid = user.verifyCode === code;
//         const isCodeExpired = new Date() < new Date(user.verifyCodeExpiry)
//         if (isCodeValid && isCodeExpired) {
//             user.isVerified = true;
//             await user.save();
//             return Response.json(
//                 {
//                     success: true,
//                     message: "Account verified successfully"
//                 },
//                 { status: 200 }
//             );
//         } else if (!isCodeExpired) {
//             return Response.json(
//                 {
//                     success: false,
//                     message: "verification code has expired, please signup for new code"
//                 },
//                 { status: 500 }
//             );
//         }
//         else {
//             return Response.json(
//                 {
//                     success: false,
//                     message: "Invalid verification code"
//                 },
//                 { status: 500 }
//             );
//         }


//     } catch (error) {
//         console.error('Error verifying code:', error);
//         return Response.json(
//             {
//                 success: false,
//                 message: "Failed to verify code"
//             },
//             { status: 500 }
//         );
//     }

// }

// src/app/api/verify-code/route.ts


import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";

const VerifyCodeSchema = z.object({
    username: z.string().min(1),
    code: z.string().length(6, { message: "Verification code must be 6 digits" }),
});

export async function POST(request: Request) {
    await dbConnect();

    try {
        const body = await request.json();
        const parsed = VerifyCodeSchema.safeParse(body);

        if (!parsed.success) {
            const err = parsed.error.flatten();
            const message = err.formErrors[0] || err.fieldErrors.username?.[0] || "Invalid input";

            return Response.json({ success: false, message }, { status: 400 });

        }

        const { username, code } = parsed.data;
        const decodedUsername = decodeURIComponent(username);

        const user = await UserModel.findOne({ username: decodedUsername });

        if (!user) {
            return Response.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeExpired = new Date() > new Date(user.verifyCodeExpiry);

        if (!isCodeValid) {
            return Response.json(
                { success: false, message: "Invalid verification code" },
                { status: 400 }
            );
        }

        if (isCodeExpired) {
            return Response.json(
                {
                    success: false,
                    message: "Verification code has expired. Please sign up again.",
                },
                { status: 410 } // Gone
            );
        }

        // Code valid & not expired → verify user
        user.isVerified = true;
        await user.save();

        return Response.json(
            {
                success: true,
                message: "Account verified successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error verifying code:", error);

        return Response.json(
            {
                success: false,
                message: "Failed to verify code",
            },
            { status: 500 }
        );
    }
}

