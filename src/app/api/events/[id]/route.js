import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { handler as authHandler } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(request, context) {
  const { params } = context;
  const session = await getServerSession(authHandler);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
  });
  if (event.userId !== session.user.id) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(event);
}

export async function PUT(request, context) {
  const { params } = context;
  const session = await getServerSession(authHandler);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { title, description, date, reminder } = await request.json();
  const event = await prisma.event.update({
    where: { id: params.id },
    data: {
      title,
      description,
      date: new Date(date),
      reminder,
    },
  });
  return NextResponse.json(event);
}

export async function DELETE(request, context) {
  const { params } = context;
  const session = await getServerSession(authHandler);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
  });
  if (event.userId !== session.user.id) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await prisma.event.delete({
    where: { id: params.id },
  });
  return NextResponse.json({}, { status: 204 });
}
