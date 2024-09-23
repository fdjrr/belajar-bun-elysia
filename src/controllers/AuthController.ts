import { error } from "elysia";
import prisma from "../../prisma/client";

type RegisterProps = {
    name: string;
    email: string;
    password: string;
};

type LoginProps = {
    email: string;
    password: string;
};

export async function register(options: RegisterProps) {
    try {
        const { name, email, password } = options;

        const userExists = await prisma.user.findFirst({ where: { email } });
        if (userExists) {
            return error(400, {
                success: false,
                message: "Email already registered",
            });
        }

        const user = await prisma.user.create({ data: { name: name, email: email, password: await Bun.password.hash(password) } });

        return {
            success: true,
            message: "Register success",
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        };
    } catch (e: unknown) {
        console.log(e);

        return error(500, {
            success: false,
            message: "Internal server error",
        });
    }
}

export async function login(jwt: any, options: LoginProps) {
    try {
        const { email, password } = options;

        const user = await prisma.user.findFirst({ where: { email } });

        if (!user || !(await Bun.password.verify(password, user.password))) {
            return error(400, {
                success: false,
                message: "Email or Password is incorrect",
            });
        }

        const access_token = await jwt.sign({ id: user.id, name: user.name, email: user.email });

        return {
            success: true,
            message: "Login success",
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            token_type: "Bearer",
            access_token,
        };
    } catch (e: unknown) {
        console.log(e);

        return error(500, {
            success: false,
            message: "Internal server error",
        });
    }
}
