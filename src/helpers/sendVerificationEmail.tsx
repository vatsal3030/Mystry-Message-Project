// src/helpers/sendVerificationEmail.ts
import React from "react";
import resend from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "../types/ApiResponse";
import { render } from "@react-email/render";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    const html = await render(
      <VerificationEmail username={username} otp={verifyCode} />
    );

    const toEmail =
      process.env.NODE_ENV === "development"
        ? "vatsalvadgama04@gmail.com" // 👈 only your email in dev
        : email;                       // 👈 real user in production

    await resend.emails.send({
      from:
        process.env.NODE_ENV === "development"
          ? "onboarding@resend.dev"                // dev safe
          : "Mystery <no-reply@yourdomain.com>",   // 👈 your verified domain for prod
      to: toEmail,
      subject: "Verify your email address",
      html,
    });

    return {
      success: true,
      message: "Verification email sent successfully",
    };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return {
      success: false,
      message: "Failed to send verification email",
    };
  }
}
