// controllers/postController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, content, imageUrl, classId, userId } = req.body;

    if (!title || !content || !classId || !userId) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    // Check if user exists and get teacher info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { teacher: true },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Create post with or without teacherId
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        imageUrl: imageUrl || null,
        classId,
        userId,
        teacherId: user.teacher?.id || null,
      },
    });

    res.status(201).json(newPost);
    return;
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Failed to create post" });
    return;
  }
};

export const getPostsByClass = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;

    const posts = await prisma.post.findMany({
      where: { classId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            username: true,
            id: true, // Include user id for permission checks
          },
        },
        teacher: {
          select: {
            firstName: true,
            lastName: true,
            id: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                username: true,
                id: true,
              },
            },
            student: {
              select: {
                firstName: true,
                lastName: true,
                id: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            username: true,
          },
        },
        teacher: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                username: true,
              },
            },
            student: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Failed to fetch post" });
  }
};

export const addComment = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { content, userId, studentId } = req.body;

    if (!content || !userId) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const newComment = await prisma.comment.create({
      data: {
        content,
        postId,
        userId,
        studentId: studentId || null,
      },
    });

    const commentWithUser = await prisma.comment.findUnique({
      where: { id: newComment.id },
      include: {
        user: {
          select: {
            username: true,
          },
        },
        student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(201).json(commentWithUser);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

export const getCommentsByPost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            username: true,
          },
        },
        student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};
// Add these new controller methods to your postController.ts

export const updateComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
      res.status(400).json({ message: "Content is required" });
      return;
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        user: { select: { username: true } },
        student: { select: { firstName: true, lastName: true } },
      },
    });

    res.status(200).json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ message: "Failed to update comment" });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;

    await prisma.comment.delete({
      where: { id: commentId },
    });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Failed to delete comment" });
  }
};
// Add to your postController.ts
export const getPostsByTeacher = async (req: Request, res: Response) => {
  try {
    const { teacherId } = req.params;

    const posts = await prisma.post.findMany({
      where: { teacherId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            username: true,
            id: true,
          },
        },
        teacher: {
          select: {
            firstName: true,
            lastName: true,
            id: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                username: true,
                id: true,
              },
            },
            student: {
              select: {
                firstName: true,
                lastName: true,
                id: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching teacher posts:", error);
    res.status(500).json({ message: "Failed to fetch teacher posts" });
  }
};
