import { Elysia } from "elysia";
import Routes from "./routes";
import { existsSync, mkdirSync, readFileSync } from "fs";
import { join } from "path";

const app = new Elysia();

export const uploadDir = join(__dirname, "uploads");

if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir);
}

app.get("/uploads/:filename", ({ params }) => {
    const filePath = join(uploadDir, params.filename);
    if (!existsSync(filePath)) {
        return new Response("File not found", { status: 404 });
    }

    const file = readFileSync(filePath);
    return new Response(file, {
        headers: {
            "Content-Type": "image/png",
        },
    });
});

app.group("/api", (app) => app.use(Routes));

app.listen(3000);

console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);
