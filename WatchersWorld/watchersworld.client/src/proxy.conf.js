const PROXY_CONFIG = [
  {
    context: [
      //"/weatherforecast",
      "/api",
    ],
    //target: "https://localhost:7155",
    target: "https://watchers-world-backend.azurewebsites.net",
    secure: false
  }
]

module.exports = PROXY_CONFIG;
