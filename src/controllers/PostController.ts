import prisma from "../../prisma/client";
import { writeFileSync } from "fs";
import { join } from "path";
import { nanoid } from "nanoid";
import { uploadDir } from "../index";

export async function getPosts() {
    try {
        const posts = await prisma.post.findMany({ orderBy: { id: "desc" } });

        return {
            success: true,
            message: "List Data Posts!",
            data: posts,
        };
    } catch (e: unknown) {
        console.error(`Error getting posts: ${e}`);
    }
}

export async function getPostsById(id: string) {
    try {
        const postId = parseInt(id);

        const post = await prisma.post.findUnique({ where: { id: postId } });

        if (!post) {
            return {
                success: false,
                message: "Data not found!",
            };
        }

        return {
            success: true,
            message: "Get Data Post!",
            data: post,
        };
    } catch (e: unknown) {
        console.error(`Error getting posts: ${e}`);
    }
}

export async function createPost(options: { title: string; content: string; image?: File; published?: boolean }) {
    try {
        const { title, content, image, published } = options;
        ``;
        let imageUrl = "";
        if (image) {
            const imageId = nanoid();
            const imagePath = join(uploadDir, `${imageId}-${image.name}`);
            const imageBytes = await image.bytes();
            writeFileSync(imagePath, imageBytes);
            imageUrl = `/uploads/${imageId}-${image.name}`;
        }

        const post = await prisma.post.create({ data: { title, content, ...(image ? { image: imageUrl } : {}), ...(published ? { published } : {}) } });

        return {
            success: true,
            message: "Create Data Post!",
            data: post,
        };
    } catch (e: unknown) {
        console.error(`Error creating posts: ${e}`);
    }
}

export async function updatePost(id: string, options: { title?: string; content?: string; image?: File; published?: boolean }) {
    try {
        const postId = parseInt(id);

        const post = await prisma.post.findUnique({ where: { id: postId } });

        if (!post) {
            return {
                success: false,
                message: "Data not found!",
            };
        }

        const { title, content, image, published } = options;

        let imageUrl = "";
        if (image) {
            const imageId = nanoid();
            const imagePath = join(uploadDir, `${imageId}-${image.name}`);
            const imageBytes = await image.bytes();
            writeFileSync(imagePath, imageBytes);

            console.log(imagePath);

            imageUrl = `/uploads/${imageId}-${image.name}`;
        }

        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: { ...(title ? { title } : {}), ...(content ? { content } : {}), ...(image ? { image: imageUrl } : {}), ...(published ? { published } : {}) },
        });

        return {
            success: true,
            message: "Update Data Post!",
            data: updatedPost,
        };
    } catch (e: unknown) {
        console.error(`Error updating posts: ${e}`);
    }
}

export const deletePost = async (id: string) => {
    try {
        const postId = parseInt(id);

        const post = await prisma.post.findUnique({ where: { id: postId } });

        if (!post) {
            return {
                success: false,
                message: "Data not found!",
            };
        }

        await prisma.post.delete({ where: { id: postId } });

        return {
            success: true,
            message: "Delete Data Post!",
            data: post,
        };
    } catch (e: unknown) {
        console.error(`Error deleting posts: ${e}`);
    }
};
