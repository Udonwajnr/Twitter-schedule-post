import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import { createUser, getUserByEmail } from "@/lib/models/User";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const mongoClient = await clientPromise;
    const db = mongoClient.db("twitboost");

    const existingUser = await getUserByEmail(db, email);
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 12);

    const result = await createUser(db, {
      name,
      email,
      password: hashedPassword,
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: result.insertedId.toString(),
          name,
          email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}
