// src/helpers/sendVerificationEmail.tsx
import React from "react";
import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "../types/ApiResponse";
import { render } from "@react-email/render";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    // ⬇️ render returns Promise<string>, so we await it
    const html = await render(
      <VerificationEmail username={username} otp={verifyCode} />
    );

    await resend.emails.send({
      from: "no-reply@yourdomain.com",
      to: email,
      subject: "Verify your email address",
      html, // ✅ now this is a string
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
