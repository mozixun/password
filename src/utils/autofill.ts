export interface AutofillEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url: string;
  icon?: string;
}

export interface FieldInfo {
  type: 'username' | 'password' | 'email' | 'credit_card' | 'unknown';
  element: HTMLInputElement;
  form?: HTMLFormElement;
}

export function findFormFields(): FieldInfo[] {
  const inputs = document.querySelectorAll('input');
  const fields: FieldInfo[] = [];

  inputs.forEach((input) => {
    const element = input as HTMLInputElement;
    const type = element.type.toLowerCase();
    const id = element.id.toLowerCase();
    const name = element.name.toLowerCase();
    const placeholder = (element.placeholder || '').toLowerCase();

    let fieldType: FieldInfo['type'] = 'unknown';

    if (type === 'email' || 
        name.includes('email') || 
        id.includes('email') || 
        placeholder.includes('email')) {
      fieldType = 'email';
    } else if (type === 'password' ||
               name.includes('password') ||
               id.includes('password') ||
               placeholder.includes('password')) {
      fieldType = 'password';
    } else if (name.includes('username') ||
               id.includes('username') ||
               name.includes('user') ||
               id.includes('user') ||
               placeholder.includes('username') ||
               placeholder.includes('user') ||
               placeholder.includes('登录') ||
               placeholder.includes('账户')) {
      fieldType = 'username';
    }

    if (fieldType !== 'unknown') {
      fields.push({
        type: fieldType,
        element,
        form: element.form,
      });
    }
  });

  return fields;
}

export function fillField(element: HTMLInputElement, value: string): void {
  element.value = value;
  
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  
  if ('reportValidity' in element) {
    element.reportValidity();
  }
}

export function fillCredentials(username: string, password: string): void {
  const fields = findFormFields();
  
  const usernameField = fields.find(f => f.type === 'username' || f.type === 'email');
  const passwordField = fields.find(f => f.type === 'password');
  
  if (usernameField) {
    fillField(usernameField.element, username);
  }
  
  if (passwordField) {
    fillField(passwordField.element, password);
  }
}

export function detectCurrentDomain(): string {
  try {
    return window.location.hostname;
  } catch {
    return '';
  }
}

export function matchEntriesByDomain(entries: AutofillEntry[], domain: string): AutofillEntry[] {
  if (!domain) return entries;
  
  return entries.filter(entry => {
    if (!entry.url) return false;
    
    try {
      const entryDomain = new URL(entry.url).hostname;
      return entryDomain === domain || 
             entryDomain.endsWith(`.${domain}`) ||
             domain.endsWith(`.${entryDomain}`);
    } catch {
      return entry.url.includes(domain);
    }
  });
}

export function isLoginForm(): boolean {
  const fields = findFormFields();
  const hasUsername = fields.some(f => f.type === 'username' || f.type === 'email');
  const hasPassword = fields.some(f => f.type === 'password');
  
  return hasUsername && hasPassword;
}

export function submitForm(): boolean {
  const fields = findFormFields();
  const passwordField = fields.find(f => f.type === 'password');
  
  if (passwordField && passwordField.form) {
    passwordField.form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    return true;
  }
  
  return false;
}