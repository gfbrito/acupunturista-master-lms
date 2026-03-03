const axios = require('axios');

async function testSpaceCreation() {
    try {
        // 1. Login to get token (assuming admin user exists or we can just use a test user if auth is disabled or we have credentials)
        // For now, let's assume we can hit the endpoint. If auth is required, we might need to register/login first.
        // Let's try to register a temp admin user first.
        const email = `admin_${Date.now()}@test.com`;
        const password = 'password123';

        console.log('Registering user...');
        const registerRes = await axios.post('http://localhost:3000/auth/register', {
            name: 'Test Admin',
            email,
            password
        });
        const token = registerRes.data.access_token;
        console.log('Got token:', token);

        // 2. Create Space Group
        console.log('Creating Space Group...');
        const groupRes = await axios.post('http://localhost:3000/space-groups', {
            title: 'Test Group',
            slug: `test-group-${Date.now()}`,
            isVisible: true
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const groupId = groupRes.data.id;
        console.log('Created Group ID:', groupId);

        // 3. Create Space
        console.log('Creating Space...');
        const spaceRes = await axios.post('http://localhost:3000/spaces', {
            spaceGroupId: groupId,
            title: 'Test Space',
            slug: `test-space-${Date.now()}`,
            type: 'DISCUSSION'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Created Space:', spaceRes.data);

        console.log('SUCCESS: Space creation flow works.');
    } catch (error) {
        console.error('FAILED:', error.response ? error.response.data : error.message);
    }
}

testSpaceCreation();
