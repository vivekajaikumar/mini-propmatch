
import { Router } from "express";
import { z } from "zod";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const propertyRouter = Router();

type Property = {
    id: number;
    title: string;
    price: number;
    location: string;
    imageUrl: string;
    ownerId: number | null;
};

const createPropertySchema = z.object({
    title: z.string().trim().min(5).max(255),

    price: z.number().int().positive().safe(),

    location: z.string().trim().min(3).max(255),

    imageUrl: z
        .string()
        .trim()
        .max(2000)
        .refine(
            (value) =>
                value.startsWith("/properties/") ||
                value.startsWith("https://"),
            "Provide a valid property image URL"
        ),
});

const updatePropertySchema = createPropertySchema
    .partial()
    .refine(
        (data) => Object.keys(data).length > 0,
        "Provide at least one field to update"
    );

const searchSchema = z.object({
    search: z.string().max(100).optional(),

    maxPrice: z.coerce
        .number()
        .nonnegative()
        .safe()
        .optional(),

    sort: z
        .enum([
            "default",
            "low-to-high",
            "high-to-low",
        ])
        .default("default"),

    page: z.coerce
        .number()
        .int()
        .min(1)
        .max(1000000)
        .default(1),

    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(50)
        .default(10),
});

function getPropertyId(
    value: string | string[] | undefined
): number | null {
    if (typeof value !== "string" || !/^[0-9]+$/.test(value)) {
        return null;
    }

    const id = Number(value);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return null;
    }

    return id;
}

const propertyColumns = `
    id,
    title,
    price::double precision AS price,
    location,
    image_url AS "imageUrl",
    owner_id AS "ownerId"
`;

// GET /api/properties
// Public: anyone can browse properties.
propertyRouter.get("/", async (req, res) => {
    const parsed = searchSchema.safeParse(req.query);

    if (!parsed.success) {
        res.status(400).json({
            message: "Invalid search parameters",
            errors: z.flattenError(parsed.error),
        });
        return;
    }

    const { search, maxPrice, sort, page, limit } =
        parsed.data;

    const offset = (page - 1) * limit;

    const orderBy =
        sort === "low-to-high"
            ? "price ASC, id ASC"
            : sort === "high-to-low"
                ? "price DESC, id ASC"
                : "id ASC";

    const filters = `
        WHERE
            (
                $1::text IS NULL
                OR title ILIKE '%' || $1 || '%'
                OR location ILIKE '%' || $1 || '%'
            )
            AND (
                $2::bigint IS NULL
                OR price <= $2
            )
    `;

    const filterValues = [
        search?.trim() || null,
        maxPrice ?? null,
    ];

    try {
        const result = await pool.query<Property>(
            `
                SELECT ${propertyColumns}
                FROM properties
                         ${filters}
                ORDER BY ${orderBy}
                    LIMIT $3 OFFSET $4
            `,
            [...filterValues, limit, offset]
        );

        const countResult = await pool.query<{
            total: number;
        }>(
            `
                SELECT COUNT(*)::integer AS total
                FROM properties
                         ${filters}
            `,
            filterValues
        );

        const total = countResult.rows[0]?.total ?? 0;
        const totalPages = Math.ceil(total / limit);

        res.json({
            data: result.rows,
            page,
            limit,
            total,
            totalPages,
            hasMore: page < totalPages,
        });
    } catch (error) {
        console.error("Failed to fetch properties:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
});

// GET /api/properties/:id
// Public: anyone can view a property.
propertyRouter.get("/:id", async (req, res) => {
    const id = getPropertyId(req.params.id);

    if (id === null) {
        res.status(400).json({
            message: "Invalid property ID",
        });
        return;
    }

    try {
        const result = await pool.query<Property>(
            `
                SELECT ${propertyColumns}
                FROM properties
                WHERE id = $1
            `,
            [id]
        );

        const property = result.rows[0];

        if (!property) {
            res.status(404).json({
                message: "Property not found",
            });
            return;
        }

        res.json(property);
    } catch (error) {
        console.error("Failed to fetch property:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
});

// POST /api/properties
// Protected: only logged-in users can create listings.
propertyRouter.post("/", requireAuth, async (req, res) => {
    const parsed = createPropertySchema.safeParse(req.body);

    if (!parsed.success) {
        res.status(400).json({
            message: "Invalid property details",
            errors: z.flattenError(parsed.error),
        });
        return;
    }

    const { title, price, location, imageUrl } =
        parsed.data;

    // Comes from requireAuth, not from req.body.
    const userId: number = res.locals.userId;

    try {
        const result = await pool.query<Property>(
            `
                INSERT INTO properties (
                    title,
                    price,
                    location,
                    image_url,
                    owner_id
                )
                VALUES ($1, $2, $3, $4, $5)
                    RETURNING ${propertyColumns}
            `,
            [
                title,
                price,
                location,
                imageUrl,
                userId,
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Failed to create property:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
});

// PATCH /api/properties/:id
// Protected: only the property's owner can edit it.
propertyRouter.patch(
    "/:id",
    requireAuth,
    async (req, res) => {
        const id = getPropertyId(req.params.id);

        if (id === null) {
            res.status(400).json({
                message: "Invalid property ID",
            });
            return;
        }

        const parsed = updatePropertySchema.safeParse(
            req.body
        );

        if (!parsed.success) {
            res.status(400).json({
                message: "Invalid property details",
                errors: z.flattenError(parsed.error),
            });
            return;
        }

        const { title, price, location, imageUrl } =
            parsed.data;

        const userId: number = res.locals.userId;

        try {
            const result = await pool.query<Property>(
                `
                UPDATE properties
                SET
                    title = COALESCE($1, title),
                    price = COALESCE($2, price),
                    location = COALESCE($3, location),
                    image_url = COALESCE($4, image_url)
                WHERE id = $5
                  AND owner_id = $6
                RETURNING ${propertyColumns}
                `,
                [
                    title ?? null,
                    price ?? null,
                    location ?? null,
                    imageUrl ?? null,
                    id,
                    userId,
                ]
            );

            const property = result.rows[0];

            if (!property) {
                // Check whether the property exists.
                const exists = await pool.query(
                    `
                    SELECT id
                    FROM properties
                    WHERE id = $1
                    `,
                    [id]
                );

                if (exists.rows.length === 0) {
                    res.status(404).json({
                        message: "Property not found",
                    });
                    return;
                }

                res.status(403).json({
                    message: "You do not own this property",
                });
                return;
            }

            res.json(property);
        } catch (error) {
            console.error("Failed to update property:", error);

            res.status(500).json({
                message: "Internal server error",
            });
        }
    }
);
