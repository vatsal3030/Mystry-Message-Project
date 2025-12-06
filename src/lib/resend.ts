// import { Resend } from 'resend';

// export const resend = new Resend(process.env.RESEND_API_KEY);


// app/api/send/route.ts (Next.js 13+)
import { Resend } from "resend";

 const resend = new Resend(process.env.RESEND_API_KEY);
 
export default resend

// export async function POST() {
//   try {
//     const data = await resend.emails.send({
//       from: "Acme <onboarding@resend.dev>",   // ✅ works without domain setup
//       to: "yourmail@gmail.com",
//       subject: "Test from localhost",
//       html: "<p>Hello from localhost</p>",
//     });

//     return Response.json(data);
//   } catch (error) {
//     console.error(error);
//     return new Response("Error sending email", { status: 500 });
//   }
// }
