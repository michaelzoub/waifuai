import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/services/mongo";

export async function GET() {
    try {
        const { db } = await connectToDatabase()
        const collection = db.collection("memecoin.delete after sundays")
        const totalDocuments = await collection.countDocuments()
        if (totalDocuments > 500) {
            const documentsToDelete = totalDocuments - 500;

            const oldestDocuments = await collection
                .find({})
                .sort({ timestamp: 1 })  
                .limit(documentsToDelete)  
                .toArray();

            console.log("Documents to delete:", oldestDocuments);

        }
        const latestDocuments = await collection
        .find({})
        .sort({ timestamp: 1 })
        .limit(75) 
        .toArray();
        console.log(latestDocuments)
        return NextResponse.json( { status: 200, body: latestDocuments } )
    } catch {
        return NextResponse.json( { status: 500, body: "error" } )
    }
}