import prisma from "../../prisma/client";
import { writeFileSync } from "fs";
import { join } from "path";
import { nanoid } from "nanoid";
import { uploadDir } from "../index";
import { error } from "elysia";

type CreatePostProps = {
    title: string;
    content: string;
    image?: File;
    published?: boolean;
};

type UpdatePostProps = {
    title?: string;
    content?: string;
    image?: File;
    published?: boolean;
};

export async function getPosts(jwt: any, auth: any) {
    try {
        const user = await jwt.verify(auth.value);

        if (!user) {
            return error(401, {
                success: false,
                message: "Unauthorized",
            });
        }

        const posts = await prisma.post.findMany({
            where: {
                user_id: user.id,
            },
            orderBy: { id: "desc" },
        });

        return {
            success: true,
            message: "List Data Posts!",
            data: posts,
        };
    } catch (e: unknown) {
        console.error(`Error getting posts: ${e}`);
    }
}

export async function getPostsById(jwt: any, auth: any, id: string) {
    try {
        const user = await jwt.verify(auth.value);

        if (!user) {
            return error(401, {
                success: false,
                message: "Unauthorized",
            });
        }

        const postId = parseInt(id);

        const post = await prisma.post.findUnique({
            where: {
                id: postId,
                user_id: user.id,
            },
        });

        if (!post) {
            return error(400, {
                success: false,
                message: "Data not found!",
            });
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

export async function createPost(jwt: any, auth: any, options: CreatePostProps) {
    try {
        const user = await jwt.verify(auth.value);

        if (!user) {
            return error(401, {
                success: false,
                message: "Unauthorized",
            });
        }

        const { title, content, image, published } = options;

        let imageUrl = "";
        if (image) {
            const imageId = nanoid();
            const imagePath = join(uploadDir, `${imageId}-${image.name}`);
            const imageBytes = await image.bytes();
            writeFileSync(imagePath, imageBytes);
            imageUrl = `/uploads/${imageId}-${image.name}`;
        }

        const post = await prisma.post.create({ data: { user_id: user.id, title, content, ...(image ? { image: imageUrl } : {}), ...(published ? { published } : {}) } });

        return {
            success: true,
            message: "Create Data Post!",
            data: post,
        };
    } catch (e: unknown) {
        console.error(`Error creating posts: ${e}`);
    }
}

export async function updatePost(jwt: any, auth: any, id: string, options: UpdatePostProps) {
    try {
        const user = await jwt.verify(auth.value);

        if (!user) {
            return error(401, {
                success: false,
                message: "Unauthorized",
            });
        }

        const postId = parseInt(id);

        const post = await prisma.post.findUnique({
            where: {
                id: postId,
                user_id: user.id,
            },
        });

        if (!post) {
            return error(400, {
                success: false,
                message: "Data not found!",
            });
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

export const deletePost = async (jwt: any, auth: any, id: string) => {
    try {
        const user = await jwt.verify(auth.value);

        if (!user) {
            return error(401, {
                success: false,
                message: "Unauthorized",
            });
        }

        const postId = parseInt(id);

        const post = await prisma.post.findUnique({
            where: {
                id: postId,
                user_id: user.id,
            },
        });

        if (!post) {
            return error(400, {
                success: false,
                message: "Data not found!",
            });
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
