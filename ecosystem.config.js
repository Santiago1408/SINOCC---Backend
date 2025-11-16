module.exports = {
  apps: [{
    name: 'sinocc-backend',
    script: './servidor.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 3000
    }
  }]
};