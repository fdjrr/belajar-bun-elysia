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
            .get("/", async ({ jwt, bearer }) => getPosts(jwt, bearer))
            .get("/:id", async ({ jwt, bearer, params: { id } }) => getPostsById(jwt, bearer, id))
            .post(
                "/",
                async ({ jwt, bearer, body }) =>
                    createPost(
                        jwt,
                        bearer,
                        body as {
                            title: string;
                            content: string;
                            image?: File;
                            category_id: string;
                            published?: string;
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
                        image: t.Optional(t.File()),
                        category_id: t.String({
                            min: 1,
                        }),
                        published: t.Optional(
                            t.String({
                                min: 1,
                            })
                        ),
                    }),
                }
            )
            .patch(
                "/:id",
                async ({ jwt, bearer, params: { id }, body }) =>
                    updatePost(
                        jwt,
                        bearer,
                        id,
                        body as {
                            title?: string;
                            content?: string;
                            image?: File;
                            category_id?: string;
                            published?: string;
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
                        image: t.Optional(t.File()),
                        category_id: t.Optional(
                            t.String({
                                min: 1,
                            })
                        ),
                        published: t.Optional(
                            t.String({
                                min: 1,
                            })
                        ),
                    }),
                }
            )
            .delete("/:id", async ({ jwt, bearer, params: { id } }) => deletePost(jwt, bearer, id));
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
                async ({ jwt, body }) =>
                    login(
                        jwt,
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
