// src/app/api/verify-code/route.ts
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";

const VerifyCodeSchema = z.object({
  code: z.string().length(6, { message: "Verification code must be 6 digits" }),
});

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    const parsed = VerifyCodeSchema.safeParse(body);

    if (!parsed.success) {
      const err = parsed.error.flatten();
      const message =
        err.formErrors[0] ||
        err.fieldErrors.code?.[0] ||
        "Invalid input";

      return Response.json({ success: false, message }, { status: 400 });
    }

    const { code } = parsed.data;

    // Find user by verification code
    const user = await UserModel.findOne({ verifyCode: code });

    if (!user) {
      return Response.json(
        { success: false, message: "User not found or invalid code" },
        { status: 404 }
      );
    }

    const now = new Date();
    const isCodeExpired = now > new Date(user.verifyCodeExpiry);

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
