"use server"
import { connectToDatabase } from "@/app/services/mongo";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
    try {
        const id = await req.json()
        console.log("received id: ", id.messageId._id)
        //req sends message ID -> i then add +1 upvote to that message id and return the new amount of upvotes
        const { db } = await connectToDatabase()
        const collection = db.collection("memecoin.delete after sundays")
        const objectId = typeof id.messageId._id === 'string' 
        ? new ObjectId(id.messageId._id) 
        : id.messageId._id
        const result = await collection.findOneAndUpdate(
            { _id: objectId },
            { $inc: { upvotes: 1 } }, 
            { returnDocument: "after" } 
          )
          console.log("returned document: ", result)
        return NextResponse.json({status: 200, body: result})
    } catch (error) {
        return NextResponse.json({status:500, message: "Internal server error."})
    }
}