import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/services/mongo";

export async function GET() {
    try {
        const { db } = await connectToDatabase()
        const collection = db.collection("memecoin.delete after sundays")
        const gotten = await collection.find( {} ).toArray()
        console.log(gotten)
        return NextResponse.json( { status: 200, body: gotten } )
    } catch {
        return NextResponse.json( { status: 500, body: "error" } )
    }
}