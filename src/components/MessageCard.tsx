// import React from 'react'
// import {
//     Card,
//     CardAction,
//     CardContent,
//     CardDescription,
//     CardFooter,
//     CardHeader,
//     CardTitle,
// } from "@/components/ui/card"
// import {
//     AlertDialog,
//     AlertDialogAction,
//     AlertDialogCancel,
//     AlertDialogContent,
//     AlertDialogDescription,
//     AlertDialogFooter,
//     AlertDialogHeader,
//     AlertDialogTitle,
//     AlertDialogTrigger,
// } from "@/components/ui/alert-dialog"
// import { Button } from './ui/button'
// import { X } from 'lucide-react'
// import { Message } from '@/model/User'
// import { toast } from 'sonner'
// import axios from 'axios'
// import { ApiResponse } from '@/types/ApiResponse'

// type MessageCardProps = {
//     message:Message;
//     onMessageDelete : (messageId:string) => void
// }


// function MessageCard({message,onMessageDelete}:MessageCardProps) {
// const handleDeleteConfirm= async () =>{
//    const response = axios.delete<ApiResponse>(`/api/delete-message/${message._id}`)
//    toast('response.data.message')
//    onMessageDelete(message._id as string)
// }


//     return (
//         <Card>
//             <CardHeader>
//                 <CardTitle>Card Title</CardTitle>
//                 <AlertDialog>
//                     <AlertDialogTrigger>
//                         <Button variant="destructive"><X className='w-5 h-5'></X></Button>
//                     </AlertDialogTrigger>
//                     <AlertDialogContent>
//                         <AlertDialogHeader>
//                             <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
//                             <AlertDialogDescription>
//                                 This action cannot be undone. This will permanently delete your account
//                                 and remove your data from our servers.
//                             </AlertDialogDescription>
//                         </AlertDialogHeader>
//                         <AlertDialogFooter>
//                             <AlertDialogCancel>Cancel</AlertDialogCancel>
//                             <AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
//                         </AlertDialogFooter>
//                     </AlertDialogContent>
//                 </AlertDialog>
//                 <CardDescription>Card Description</CardDescription>
//                 <CardAction>Card Action</CardAction>
//             </CardHeader>
//             <CardContent>
//                 <p>Card Content</p>
//             </CardContent>
//             <CardFooter>
//                 <p>Card Footer</p>
//             </CardFooter>
//         </Card>
//     )
// }

// export default MessageCard

// src/components/MessageCard.tsx
"use client";

import React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { Message } from "@/model/User";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";

type MessageCardProps = {
    message: Message;
    onMessageDelete: (messageId: string) => void;
};

function MessageCard({ message, onMessageDelete }: MessageCardProps) {
    const handleDeleteConfirm = async () => {
        try {
            const response = await axios.delete<ApiResponse>(
                `/api/delete-message/${message._id}`
            );

            toast("Message deleted", {
                description: response.data.message ?? "The message has been removed.",
            });

            onMessageDelete(message._id as string);
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast("Error", {
                description:
                    axiosError.response?.data.message ||
                    "Failed to delete message. Please try again.",
            });
        }
    };

    //   const formattedDate = new Date(message.createdAt).toLocaleString();
    const formattedDate = new Date(message.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",  // "Dec"
        day: "numeric"   // "6"
    });

    const formattedTime = new Date(message.createdAt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

    const displayDate = `${formattedDate} • ${formattedTime}`;


    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                    <CardTitle className="text-base font-semibold">
                        Anonymous Message
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                        {displayDate}
                    </CardDescription>
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete this message?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. The message will be permanently
                                removed from your inbox.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteConfirm}>
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardHeader>

            <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                </p>
            </CardContent>
        </Card>
    );
}

export default MessageCard;

