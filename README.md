Śledzenie terminów na egzamin praktyczny na prawo jazdy

# How to configure?

1. Create config.ts file
2. Configure it like in example below

```typescript
export const config = {
  // This credentials are used for checking the dates really often - so it's better to use a separate account for that
  fakeCreds: {
    login: "joe@example.com",
    password: "password",
  },

  // This credentials are used for reserving the date - so it's better to use your own account
  realCreds: {
    login: "john@example.com",
    password: "password",
  },

  wordId: 0, // ID of the WORD
  category: "B", // Category of the driving license
  sleepTimeMs: 5000, // Time between each check in milliseconds

  // Those following 2 dates are used for sending the notification
  dateFrom: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(), // Date from which the dates will be checked - here it's midnight of the current day
  dateTo: new Date("2024-11-24T00:00:00.000Z").toISOString(), // Date to which the dates will be checked

  webhookURL: "https://discord.com/api/webhooks/myWebhook", // Webhook URL to which the message will be sent
  importantWebhookURL: "https://discord.com/api/webhooks/myWebhook2", // Webhook URL to which the message about the reservation of the exam will be additionally sent (besides the base webhook)

  myIp: "127.0.0.1", // Your IP address, used for controlling the VPN state
  wireguardVPNProfileName: "myVPN", // Name of the Wireguard VPN profile
  runChromiumFix: true, // See https://chromium.googlesource.com/chromium/src/+/main/docs/security/apparmor-userns-restrictions.md. Recommended way is to add a AppArmor profile, see the link for more details,

  // Specify the dates within which you want to automatically reserve the exams. The script will automatically reserve the first available date within the specified ranges, if available
  autoReservationDates: [
    {
      name: "Dzień wolny szkoły", // A friendly name that tells you when it is
      from: new Date("2024-11-04T07:00:00"), // Make sure not to use the ISO format (so please use "2024-11-04T07:00:00" instead of "2024-11-04T07:00:00.000Z")
      to: new Date("2024-11-04T15:00:00"),
    },
  ],

  // Personal information used for reserving the exam
  personalInfo: {
    firstName: "John",
    lastName: "Doe",
    pesel: "12345678901",
    phoneNumber: "123456789",
    pkk: "12345678901",
  },
};
```

3. Make sure user has the sufficient permissions to run the commands, e.g. for wh-quick up command - see: https://superuser.com/a/1823621

- wg-quick up
- wg-quick down
- Puppeteer

4. Make sure you have the Wireguard VPN profile configured and the wg-quick command is available in the PATH

Personally, I recommend using ProtonVPN, as it's free and has a good reputation. You can find the configuration files here: https://protonvpn.com/support/wireguard-linux
