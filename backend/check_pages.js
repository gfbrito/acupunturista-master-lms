const axios = require('axios');

async function checkPages() {
    try {
        // Login to get token (assuming hardcoded admin credentials or just checking public endpoint if possible)
        // Since I don't have easy access to login flow here, I'll try to hit the endpoint without auth if possible,
        // but the controller has @UseGuards(JwtAuthGuard) for POST but GET might be public?
        // Let's check controller again.

        // Controller:
        // @Get()
        // findAll(@Query('visible') visible?: string) { ... }
        // It does NOT have @UseGuards(JwtAuthGuard) on findAll!

        const response = await axios.get('http://localhost:3000/pages?visible=true');
        console.log('Visible Pages:', JSON.stringify(response.data, null, 2));

        const allResponse = await axios.get('http://localhost:3000/pages');
        console.log('All Pages:', JSON.stringify(allResponse.data, null, 2));

    } catch (error) {
        console.error('Error fetching pages:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

checkPages();
