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
    category_id: string;
    published?: string;
};

type UpdatePostProps = {
    title?: string;
    content?: string;
    image?: File;
    category_id?: string;
    published?: string;
};

export async function getPosts(jwt: any, bearer: any) {
    try {
        if (!bearer) {
            return error(401, {
                success: false,
                message: "Unauthorized",
            });
        }

        const user = await jwt.verify(bearer);

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
            include: {
                user: true,
                category: true,
            },
        });

        return {
            success: true,
            message: "List Data Posts!",
            data: posts.map((post) => ({
                ...post,
                user: {
                    id: post.user.id,
                    name: post.user.name,
                    email: post.user.email,
                },
                category: {
                    id: post.category.id,
                    name: post.category.name,
                },
            })),
        };
    } catch (e: unknown) {
        console.error(`Error getting posts: ${e}`);

        return error(500, {
            success: false,
            message: "Internal server error",
        });
    }
}

export async function getPostsById(jwt: any, bearer: any, id: string) {
    try {
        if (!bearer) {
            return error(401, {
                success: false,
                message: "Unauthorized",
            });
        }

        const user = await jwt.verify(bearer);

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
            include: {
                user: true,
                category: true,
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
            data: {
                ...post,
                user: {
                    id: post.user.id,
                    name: post.user.name,
                    email: post.user.email,
                },
                category: {
                    id: post.category.id,
                    name: post.category.name,
                },
            },
        };
    } catch (e: unknown) {
        console.error(`Error getting posts: ${e}`);

        return error(500, {
            success: false,
            message: "Internal server error",
        });
    }
}

export async function createPost(jwt: any, bearer: any, options: CreatePostProps) {
    try {
        if (!bearer) {
            return error(401, {
                success: false,
                message: "Unauthorized",
            });
        }

        const user = await jwt.verify(bearer);

        if (!user) {
            return error(401, {
                success: false,
                message: "Unauthorized",
            });
        }

        const { title, content, image, category_id, published } = options;

        const categoryId = parseInt(category_id);

        const category = await prisma.category.findUnique({
            where: {
                id: categoryId,
            },
        });

        if (!category) {
            return error(400, {
                success: false,
                message: "Category not found!",
            });
        }

        let imageUrl = "";
        if (image) {
            const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
            if (!allowedMimeTypes.includes(image.type)) {
                return error(400, {
                    success: false,
                    message: "Image type is not supported, accepted types are: " + allowedMimeTypes.join(", "),
                });
            }

            const maxFileSize = 5 * 1024 * 1024; // 5MB
            if (image.size > maxFileSize) {
                return error(400, {
                    success: false,
                    message: "Image size is too large, max allowed size is " + maxFileSize + " bytes",
                });
            }

            const imageId = nanoid();
            const imagePath = join(uploadDir, `${imageId}-${image.name}`);
            const imageBytes = await image.bytes();
            writeFileSync(imagePath, imageBytes);
            imageUrl = `/uploads/${imageId}-${image.name}`;
        }

        const post = await prisma.post.create({
            data: {
                user_id: user.id,
                title,
                content,
                ...(image ? { image: imageUrl } : {}),
                category_id: category.id,
                ...(published ? { published: Boolean(published) } : {}),
            },
        });

        return {
            success: true,
            message: "Create Data Post!",
            data: post,
        };
    } catch (e: unknown) {
        console.error(`Error creating posts: ${e}`);

        return error(500, {
            success: false,
            message: "Internal server error",
        });
    }
}

export async function updatePost(jwt: any, bearer: any, id: string, options: UpdatePostProps) {
    try {
        if (!bearer) {
            return error(401, {
                success: false,
                message: "Unauthorized",
            });
        }

        const user = await jwt.verify(bearer);

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

        const { title, content, image, category_id, published } = options;

        let categoryId;
        if (category_id) {
            categoryId = parseInt(category_id);

            const category = await prisma.category.findUnique({
                where: {
                    id: categoryId,
                },
            });

            if (!category) {
                return error(400, {
                    success: false,
                    message: "Category not found!",
                });
            }
        }

        let imageUrl = "";
        if (image) {
            const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
            if (!allowedMimeTypes.includes(image.type)) {
                return error(400, {
                    success: false,
                    message: "Image type is not supported, accepted types are: " + allowedMimeTypes.join(", "),
                });
            }

            const maxFileSize = 5 * 1024 * 1024; // 5MB
            if (image.size > maxFileSize) {
                return error(400, {
                    success: false,
                    message: "Image size is too large, max allowed size is " + maxFileSize + " bytes",
                });
            }

            const imageId = nanoid();
            const imagePath = join(uploadDir, `${imageId}-${image.name}`);
            const imageBytes = await image.bytes();
            writeFileSync(imagePath, imageBytes);

            imageUrl = `/uploads/${imageId}-${image.name}`;
        }

        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: {
                title,
                content,
                ...(image ? { image: imageUrl } : {}),
                ...(category_id ? { categoryId } : {}),
                ...(published ? { published: Boolean(published) } : {}),
            },
        });

        return {
            success: true,
            message: "Update Data Post!",
            data: updatedPost,
        };
    } catch (e: unknown) {
        console.error(`Error updating posts: ${e}`);

        return error(500, {
            success: false,
            message: "Internal server error",
        });
    }
}

export const deletePost = async (jwt: any, bearer: any, id: string) => {
    try {
        if (!bearer) {
            return error(401, {
                success: false,
                message: "Unauthorized",
            });
        }

        const user = await jwt.verify(bearer);

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

        return error(500, {
            success: false,
            message: "Internal server error",
        });
    }
};
