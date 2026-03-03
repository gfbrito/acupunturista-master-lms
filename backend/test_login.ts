
import axios from 'axios';

async function main() {
    console.log("Testing login with: gfbrito@gmail.com / 123456");

    try {
        const response = await axios.post('http://localhost:3001/auth/login', {
            email: "gfbrito@gmail.com",
            password: "123456"
        });

        console.log("Login successful!");
        console.log("Status:", response.status);
        console.log("Access Token:", response.data.access_token);
        console.log("User:", response.data.user);
    } catch (error: any) {
        console.error("Login failed!");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        } else {
            console.error("Error:", error.message);
        }
    }
}

main();
