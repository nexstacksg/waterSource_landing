module.exports = {
  apps: [
    {
      name: "watersource-landing",
      script: "pnpm",
      args: "start",
      cwd: path.resolve(__dirname, "web"),
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "staging",
        PORT: 3000,
      },
    },
  ],
};
