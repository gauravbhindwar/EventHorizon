import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { handler } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(handler);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const events = await prisma.event.findMany({
    where: { userId: session.user.id },
  });
  return NextResponse.json(events);
}

export async function POST(req) {
  const session = await getServerSession(handler);

  if (!session || !session.user) {
    return NextResponse.json(
      { message: "User not authenticated" },
      { status: 401 }
    );
  }

  const { title, description, date, reminder } = await req.json();
  const userId = session.user.id;

  if (!userId) {
    return NextResponse.json(
      { message: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        reminder,
        userId,
      },
    });
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  const session = await getServerSession(handler);

  if (!session || !session.user) {
    return NextResponse.json(
      { message: "User not authenticated" },
      { status: 401 }
    );
  }

  let id;
  try {
    const body = await req.json();
    id = body.id;
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 400 });
  }

  const userId = session.user.id;

  if (!userId) {
    return NextResponse.json(
      { message: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    if (event.userId !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Event deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
