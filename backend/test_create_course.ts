
import axios from 'axios';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = "masterlms-secret-key-2024";
const ADMIN_USER_ID = "42f0defd-08b7-4370-874b-61e4cd3b7595"; // Id found in previous step

async function main() {
    // 1. Create a valid token
    const token = jwt.sign(
        { sub: ADMIN_USER_ID, email: 'gfbrito@gmail.com', role: 'ADMIN' },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    console.log("Generated Token:", token);

    // 2. Try to create a course
    try {
        const response = await axios.post('http://localhost:3001/courses', {
            title: "Test Course via Script 3",
            slug: "test-course-script-2-1765337880520", // Using the slug from the SUCCESSFUL run above
            description: "Created by automated script with duplicate slug",
            thumbnail: "",
            bannerUrl: "",
            hasCertificate: false
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log("Course created successfully!");
        console.log("Status:", response.status);
        console.log("Data:", response.data);
    } catch (error: any) {
        console.error("Failed to create course!");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        } else {
            console.error("Error:", error.message);
        }
    }
}

main();
