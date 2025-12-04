import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {

    await dbConnect();
    try {
        const { username, code } = await request.json()
        const decodedUsername = decodeURIComponent(username)
        const user = await UserModel.findOne({ username: decodedUsername })
        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                { status: 500 }
            );
        }
        const isCodeValid = user.verifyCode === code;
        const isCodeExpired = new Date() < new Date(user.verifyCodeExpiry)
        if (isCodeValid && isCodeExpired) {
            user.isVerified = true;
            await user.save();
            return Response.json(
                {
                    success: true,
                    message: "Account verified successfully"
                },
                { status: 200 }
            );
        } else if (!isCodeExpired) {
            return Response.json(
                {
                    success: false,
                    message: "verification code has expired, please signup for new code"
                },
                { status: 500 }
            );
        }
        else {
            return Response.json(
                {
                    success: false,
                    message: "Invalid verification code"
                },
                { status: 500 }
            );
        }


    } catch (error) {
        console.error('Error verifying code:', error);
        return Response.json(
            {
                success: false,
                message: "Failed to verify code"
            },
            { status: 500 }
        );
    }

}


