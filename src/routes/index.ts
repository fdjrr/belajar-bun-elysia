import { Elysia, t } from "elysia";
import { getPosts, getPostsById, createPost, updatePost, deletePost } from "../controllers/PostController";

const Routes = new Elysia().group("/posts", (app) => {
    return app
        .get("/", () => getPosts())
        .get("/:id", ({ params: { id } }) => getPostsById(id))
        .post(
            "/",
            ({ body }) =>
                createPost(
                    body as {
                        title: string;
                        content: string;
                        image?: File;
                        published?: boolean;
                    }
                ),
            {
                body: t.Object({
                    title: t.String({
                        minLength: 3,
                        maxLength: 100,
                        error: "Title must be between 3 and 100 characters",
                    }),
                    content: t.String({
                        minLength: 3,
                        maxLength: 1000,
                        error: "Content must be between 3 and 1000 characters",
                    }),
                    image: t.Optional(
                        t.File({
                            maxFileSize: 5 * 1024 * 1024,
                            allowedMimeTypes: ["image/jpeg", "image/png", "image/gif"],
                            error: "Image must be a jpeg, png or gif file",
                        })
                    ),
                    published: t.Optional(t.Boolean()),
                }),
            }
        )
        .patch(
            "/:id",
            ({ params: { id }, body }) =>
                updatePost(
                    id,
                    body as {
                        title?: string;
                        content?: string;
                        image?: File;
                        published?: boolean;
                    }
                ),
            {
                body: t.Object({
                    title: t.Optional(
                        t.String({
                            minLength: 3,
                            maxLength: 100,
                            error: "Title must be between 3 and 100 characters",
                        })
                    ),
                    content: t.Optional(
                        t.String({
                            minLength: 3,
                            maxLength: 1000,
                            error: "Content must be between 3 and 1000 characters",
                        })
                    ),
                    image: t.Optional(
                        t.File({
                            maxFileSize: 5 * 1024 * 1024,
                            allowedMimeTypes: ["image/jpeg", "image/png", "image/gif"],
                            error: "Image must be a jpeg, png or gif file",
                        })
                    ),
                    published: t.Optional(t.Boolean()),
                }),
            }
        )
        .delete("/:id", ({ params: { id } }) => deletePost(id));
});

export default Routes;
