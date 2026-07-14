export interface BreachResult {
  id: string;
  name: string;
  title: string;
  domain: string;
  breachDate: string;
  description: string;
  dataClasses: string[];
  isVerified: boolean;
  isFabricated: boolean;
  isSensitive: boolean;
  isRetired: boolean;
  isSpamList: boolean;
}

export interface PasswordLeakCheck {
  found: boolean;
  count: number;
  hashPrefix: string;
  hashSuffixes: string[];
}

const MOCK_BREACHES: BreachResult[] = [
  {
    id: 'Adobe',
    name: 'Adobe',
    title: 'Adobe',
    domain: 'adobe.com',
    breachDate: '2013-10-04',
    description: 'In October 2013, 153 million Adobe accounts were breached with each containing an internal ID, username, email, encrypted password and a password hint in plain text. The password cryptography was poorly done and many were quickly resolved back to plain text. The unencrypted hints also disclosed much about the passwords adding further to the risk that hundreds of millions of Adobe customers already faced.',
    dataClasses: ['Email addresses', 'Password hints', 'Passwords', 'Usernames'],
    isVerified: true,
    isFabricated: false,
    isSensitive: false,
    isRetired: false,
    isSpamList: false,
  },
  {
    id: 'Facebook',
    name: 'Facebook',
    title: 'Facebook',
    domain: 'facebook.com',
    breachDate: '2019-04-09',
    description: 'In September 2019, Facebook disclosed that "hundreds of millions" of passwords were stored in plain text and accessible to thousands of Facebook employees.',
    dataClasses: ['Passwords', 'Usernames'],
    isVerified: true,
    isFabricated: false,
    isSensitive: false,
    isRetired: false,
    isSpamList: false,
  },
  {
    id: 'LinkedIn',
    name: 'LinkedIn',
    title: 'LinkedIn',
    domain: 'linkedin.com',
    breachDate: '2021-06-02',
    description: 'In June 2021, approximately 700 million LinkedIn records were posted for sale on a hacking forum. The data included personal information such as names, email addresses, phone numbers, physical addresses, and employment details.',
    dataClasses: ['Email addresses', 'Phone numbers', 'Physical addresses', 'Names', 'Employers'],
    isVerified: true,
    isFabricated: false,
    isSensitive: false,
    isRetired: false,
    isSpamList: false,
  },
  {
    id: 'MySpace',
    name: 'MySpace',
    title: 'MySpace',
    domain: 'myspace.com',
    breachDate: '2008-07-01',
    description: 'In May 2016, a massive data dump containing over 360 million MySpace accounts was discovered being distributed across the web. The data included usernames, email addresses and passwords (stored as SHA1 hashes with no salt).',
    dataClasses: ['Email addresses', 'Passwords', 'Usernames'],
    isVerified: true,
    isFabricated: false,
    isSensitive: false,
    isRetired: false,
    isSpamList: false,
  },
  {
    id: 'Sony',
    name: 'Sony',
    title: 'Sony',
    domain: 'sony.com',
    breachDate: '2011-04-16',
    description: 'In April 2011, Sony suffered a major breach affecting 77 million PlayStation Network and Qriocity accounts. The breach exposed usernames, passwords, email addresses, home addresses, and credit card information.',
    dataClasses: ['Email addresses', 'Passwords', 'Usernames', 'Physical addresses', 'Credit card data'],
    isVerified: true,
    isFabricated: false,
    isSensitive: false,
    isRetired: false,
    isSpamList: false,
  },
];

const KNOWN_LEAKED_PASSWORDS = ['password', '123456', 'qwerty', 'abc123', 'monkey', 'letmein', 'dragon', 'baseball', 'iloveyou', 'trustno1'];

function sha1(message: string): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const crypto = window.crypto || (window as any).msCrypto;
  const buffer = new TextEncoder().encode(message);
  return crypto.subtle.digest('SHA-1', buffer).then((hash: ArrayBuffer) => {
    const hexCodes: string[] = [];
    const view = new Uint8Array(hash);
    for (let i = 0; i < view.length; i++) {
      const hex = view[i].toString(16);
      const paddedHex = hex.padStart(2, '0');
      hexCodes.push(paddedHex);
    }
    return hexCodes.join('').toUpperCase();
  });
}

export async function checkEmailBreaches(email: string): Promise<BreachResult[]> {
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700));

  const emailLower = email.toLowerCase();
  const mockResults: BreachResult[] = [];

  if (emailLower.includes('test') || emailLower.includes('example')) {
    mockResults.push(MOCK_BREACHES[0]);
    if (Math.random() > 0.5) {
      mockResults.push(MOCK_BREACHES[2]);
    }
  }

  if (emailLower.includes('gmail')) {
    mockResults.push(MOCK_BREACHES[1]);
  }

  if (Math.random() > 0.7) {
    mockResults.push(MOCK_BREACHES[3]);
  }

  return mockResults;
}

export async function checkPasswordLeak(password: string): Promise<PasswordLeakCheck> {
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));

  const hash = await sha1(password);
  const prefix = hash.substring(0, 5);
  const suffix = hash.substring(5);

  const isLeaked = KNOWN_LEAKED_PASSWORDS.includes(password.toLowerCase()) || password.length < 6;

  const count = isLeaked ? Math.floor(Math.random() * 100000) + 1000 : 0;

  return {
    found: isLeaked,
    count,
    hashPrefix: prefix,
    hashSuffixes: isLeaked ? [suffix] : [],
  };
}

export async function getBreachDetails(breachId: string): Promise<BreachResult | null> {
  await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 300));
  return MOCK_BREACHES.find((b) => b.id === breachId) || null;
}

export async function searchBreaches(domain: string): Promise<BreachResult[]> {
  await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400));
  return MOCK_BREACHES.filter((b) => b.domain.toLowerCase().includes(domain.toLowerCase()));
}

export function generateBreachReport(emails: string[]): Promise<{
  totalChecked: number;
  totalBreaches: number;
  affectedEmails: number;
  breaches: BreachResult[];
}> {
  return Promise.all(emails.map(checkEmailBreaches)).then((results) => {
    const allBreaches: BreachResult[] = [];
    const seenIds = new Set<string>();

    results.forEach((breaches) => {
      breaches.forEach((breach) => {
        if (!seenIds.has(breach.id)) {
          seenIds.add(breach.id);
          allBreaches.push(breach);
        }
      });
    });

    return {
      totalChecked: emails.length,
      totalBreaches: allBreaches.length,
      affectedEmails: results.filter((r) => r.length > 0).length,
      breaches: allBreaches,
    };
  });
}