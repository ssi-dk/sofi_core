module.exports = {
  externalRequests: {
      secret: process.env.MICROREACT_ENCRYPTION_SECRET
    },
  auth: {
    openidconnect: {
      id: "keycloak",
      name: "Keycloak",
      wellKnown: process.env.AUTH_WELLKNOWN_URI,
      type: "oauth",
      authorization: {
        params: {
          scope: "openid email profile"
        }
      },
      checks:[],
      idToken: true,
      clientSecret: "can-be-any-thing-not-used",
      clientId: "SOFI_APP",
      idAttribute: "sub"      
    },
    email: {
      server: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),     
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },   
        secure: process.env.SMTP_SECURE === "true"
      },
      from: "Microreact <noreply@microreact.org>",
      subject: "Login link for Microreact",
      text: "Hello!\nAccess your account here: http://localhost:80/auth/passwordless/callback?token=<%= tokenToSend %>&uid=",
      html: "views/emails/passwordless.html"
    },    
    secret: process.env.AUTH_SECRET,
    session: {
      maxAge: 2592000,
      updateAge: 86400
    }
  },
  baseUrl: process.env.BASE_URL,
  bodySizeLimit: "16mb",
  experimentalFlags: {
    publicFolders: false
  },
  helpDesk: {
    email: "support@microreact.org",
    subject: "Feedback from Microreact.org"
  },
  mapboxApiAccessToken: "NOT-USED",
  mongodb: {
    url: process.env.MONGODB_CONNECTION,
    database: process.env.MONGODB_DATABASE
  },
  repoPath: "./files",
  showcaseFolders: [],
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),     
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },   
    secure: process.env.SMTP_SECURE === "true",
    from: "Microreact <noreply@microreact.org>"
  }
};