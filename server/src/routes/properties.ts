import { Router } from "express";

export const propertyRouter = Router();

propertyRouter.get("/", (_req, res) => {
    res.json([
        {
            id: 1,
            title: "2 BHK Apartment in Andheri",
            price: 15000000,
            location: "Andheri West, Mumbai",
        },
        {
            id: 2,
            title: "3 BHK Apartment in Powai",
            price: 25000000,
            location: "Powai, Mumbai",
        },
    ]);
});