const fs = require("fs/promises");
const path = require("path");

const Glimpse = require("../models/Glimpse");

const rootDir = path.resolve(__dirname, "../..");

const seededItems = [
    {
        title: "Stress Relieving Live Session",
        type: "video",
        fileName: "Stress Reliving live session.mp4",
        description: "Live stress relieving session shared from the program archive.",
        isFeatured: true,
        displayOrder: 1
    },
    {
        title: "Seminar Session",
        type: "video",
        fileName: "seminar.mp4",
        description: "Seminar highlight from one of the interactive programs.",
        displayOrder: 2
    },
    {
        title: "Prashant Gandhi Poster",
        type: "image",
        fileName: "infoPoster.jpg",
        description: "Profile poster for Prashant Gandhi.",
        isFeatured: true,
        displayOrder: 3
    },
    {
        title: "Inspirational Quote Banner",
        type: "image",
        fileName: "quotes.jpg",
        description: "Inspirational quote banner used on the homepage.",
        displayOrder: 4
    }
];

const getContentType = (fileName) => {
    const extension = path.extname(fileName).toLowerCase();

    if (extension === ".mp4") {
        return "video/mp4";
    }

    if (extension === ".jpg" || extension === ".jpeg") {
        return "image/jpeg";
    }

    if (extension === ".png") {
        return "image/png";
    }

    return "application/octet-stream";
};

const seedGlimpses = async () => {
    for (const item of seededItems) {
        const existingGlimpse = await Glimpse.findOne({ title: item.title });

        if (existingGlimpse) {
            continue;
        }

        const filePath = path.join(rootDir, item.fileName);
        const mediaBuffer = await fs.readFile(filePath);

        await Glimpse.create({
            title: item.title,
            type: item.type,
            category: "showcase",
            media: {
                data: mediaBuffer,
                contentType: getContentType(item.fileName),
                filename: item.fileName
            },
            description: item.description,
            eventDate: null,
            tags: ["homepage", "seeded"],
            isFeatured: Boolean(item.isFeatured),
            isPublished: true,
            displayOrder: item.displayOrder
        });
    }
};

module.exports = seedGlimpses;