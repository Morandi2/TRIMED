import axios from 'axios';

async function testLogin() {
  try {
    console.log('Testing login with CORRECT credentials of potential inactive account...');
    const response = await axios.post('https://trimedh-service.onrender.com/api/comptes/login/', {
      email: 'morandigital@gmail.com',
      password: 'bwaKale20$'
    });
    console.log('LOGIN SUCCESSFUL:', response.data);
  } catch (error) {
    console.log('STATUS:', error.response?.status);
    console.log('BODY:', JSON.stringify(error.response?.data));
  }
}

testLogin();
