module.exports = {
  apps: [
    {
      name: 'luna-app',
      port: '1339',
      exec_mode: 'cluster',
      instances: 1,
      script: './.output/server/index.mjs'
    }
  ]
}
