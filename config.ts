export type ReservationDate = {
  from: Date;
  to: Date;
  name: string;
};

export type Config = {
  fakeCreds: Credentials;
  realCreds: Credentials;

  wordId: number;
  category: string;
  sleepTimeMs: number;
  dateFrom: string;
  dateTo: string;
  webhookURL: string;
  importantWebhookURL: string;
  myIp: string;
  wireguardVPNProfileName: string;
  runChromiumFix: boolean; // See https://chromium.googlesource.com/chromium/src/+/main/docs/security/apparmor-userns-restrictions.md

  autoReservationDates: ReservationDate[];

  personalInfo: {
    firstName: string;
    lastName: string;
    pesel: string;
    phoneNumber: string;
    pkk: string;
  };
};

export type Credentials = {
  login: string;
  password: string;
};
export type CredentialsTypes = "fakeCreds" | "realCreds";
