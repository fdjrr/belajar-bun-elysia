import { Elysia, t } from "elysia";
import { getPosts, getPostsById, createPost, updatePost, deletePost } from "../controllers/PostController";
import { bearer } from "@elysiajs/bearer";
import { login, register } from "../controllers/AuthController";
import jwt from "@elysiajs/jwt";

const Routes = new Elysia()
    .use(bearer())
    .use(
        jwt({
            name: "jwt",
            secret: "Fischl von Luftschloss Narfidort",
        })
    )
    .group("/posts", (app) => {
        return app
            .get("/", async ({ jwt, cookie: { auth } }) => getPosts(jwt, auth))
            .get("/:id", async ({ jwt, cookie: { auth }, params: { id } }) => getPostsById(jwt, auth, id))
            .post(
                "/",
                async ({ jwt, cookie: { auth }, body }) =>
                    createPost(
                        jwt,
                        auth,
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
                async ({ jwt, cookie: { auth }, params: { id }, body }) =>
                    updatePost(
                        jwt,
                        auth,
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
            .delete("/:id", async ({ jwt, cookie: { auth }, params: { id } }) => deletePost(jwt, auth, id));
    })
    .group("/auth", (app) => {
        return app
            .post(
                "/register",
                ({ body }) =>
                    register(
                        body as {
                            name: string;
                            email: string;
                            password: string;
                        }
                    ),
                {
                    body: t.Object({
                        name: t.String({
                            minLength: 3,
                            maxLength: 100,
                            error: "Name must be between 3 and 100 characters",
                        }),
                        email: t.String({
                            error: "Email is required",
                        }),
                        password: t.String({
                            error: "Password is required",
                        }),
                    }),
                }
            )
            .post(
                "/login",
                async ({ jwt, cookie: { auth }, body }) =>
                    login(
                        jwt,
                        auth,
                        body as {
                            email: string;
                            password: string;
                        }
                    ),
                {
                    body: t.Object({
                        email: t.String({
                            error: "Email is required",
                        }),
                        password: t.String({
                            error: "Password is required",
                        }),
                    }),
                }
            );
    });

export default Routes;
