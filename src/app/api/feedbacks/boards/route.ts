import { privacyResponse, privacyResponseArray } from "@/Utils";
import { ApiError } from "@/Utils/ApiError";
import { ApiResponse } from "@/Utils/ApiResponse";
import { asyncHandler } from "@/Utils/asyncHandler";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  return asyncHandler(async () => {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    const userId = session?.user?.id!;
    if (!userId) {
      throw new ApiError(401, "Unauthorized request");
    }
    const user = await db.users.findUnique({
      where: {
        cuid: userId,
      },
    });
    const body = await req.json();
    const name: string = body.name?.trim();
    if (!name) {
      throw new ApiError(400, "Board name is required");
    }

    if (name.length > 30) {
      throw new ApiError(400, "Board name is too long");
    }

    if (!body.projectsId) {
      throw new ApiError(400, "projects Id is required");
    }

    const project = await db.projects.findUnique({
      where: {
        cuid: body?.projectsId,
      },
    });

    if (!project) {
      throw new ApiError(404, "Project not found");
    }
    const projectUser = await db.projectsUsers.findFirst({
      where: {
        projectsId: project?.id,
        usersId: user?.id,
      },
    });

    if (!projectUser) {
      throw new ApiError(404, "Unauthorized request");
    }
    const newFeedbackBoard = await db.feedbackBoards.create({
      data: {
        name,
        projectsId: project?.id,
      },
      select: {
        id: true,
        cuid: true,
        name: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!newFeedbackBoard) {
      throw new ApiError(500, "Failed to create feedback board");
    }

    return NextResponse.json(
      new ApiResponse(
        200,
        privacyResponse(newFeedbackBoard),
        "Feedback board created successfully"
      )
    );
  });
}

export async function GET(req: NextRequest) {
  return asyncHandler(async () => {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    const userId = session?.user?.id!;
    if (!userId) {
      throw new ApiError(401, "Unauthorized request");
    }
    const user = await db.users.findUnique({
      where: {
        cuid: userId,
      },
    });
    const projectsId = req.nextUrl.searchParams.get("projectsId");
    if (!projectsId) {
      throw new ApiError(400, "projects id is required");
    }

    const project = await db.projects.findFirst({
      where: {
        cuid: projectsId,
      },
    });

    if (!project?.id) {
      throw new ApiError(404, "Project not found");
    }

    const projectUser = await db.projectsUsers.findFirst({
      where: {
        projectsId: project?.id,
        usersId: user?.id,
      },
    });

    if (!projectUser) {
      throw new ApiError(404, "Unauthorized request");
    }

    const feedbackBoards = privacyResponseArray(
      await db.feedbackBoards.findMany({
        where: {
          projectsId: project?.id,
        },
        select: {
          id: true,
          cuid: true,
          name: true,
          isDefault: true,
          createdAt: true,
          updatedAt: true,
        }
      })
    );

    return NextResponse.json(
      new ApiResponse(
        200,
        {
          feedbackBoards,
          total: feedbackBoards.length,
        },
        "Feedback Boards fetched successfully"
      )
    );
  });
}
