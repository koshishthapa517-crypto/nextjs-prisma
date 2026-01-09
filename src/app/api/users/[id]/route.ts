import { NextResponse } from "next/server";
import prisma  from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

// GET single user
export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

// UPDATE user
export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const data: any = {};
    if (body.username !== undefined && body.username !== "") data.username = body.username;
    if (body.fullname !== undefined && body.fullname !== "") data.fullname = body.fullname;
    if (body.email !== undefined && body.email !== "") data.email = body.email;
    if (body.age !== undefined && body.age !== "") data.age = body.age ? Number(body.age) : null;
    if (body.profilepic !== undefined && body.profilepic !== "") data.profilepic = body.profilepic;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data,
    });

    return NextResponse.json(user);
  } catch (error: any) {
    if (error.code === "P2002") {
      const target = error.meta?.target?.[0];
      if (target === "email") {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 409 }
        );
      }
    }
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE user
export async function DELETE(_: Request, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}
