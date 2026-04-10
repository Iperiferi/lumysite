const errorMap: Record<string, string> = {
  'invalid login credentials':             'Fel e-postadress eller lösenord.',
  'invalid credentials':                   'Fel e-postadress eller lösenord.',
  'email not confirmed':                   'E-postadressen är inte bekräftad. Kolla din inkorg och klicka på bekräftelselänken.',
  'user already registered':               'Det finns redan ett konto med den e-postadressen.',
  'already registered':                    'Det finns redan ett konto med den e-postadressen.',
  'email already exists':                  'Det finns redan ett konto med den e-postadressen.',
  'already in use':                        'Det finns redan ett konto med den e-postadressen.',
  'user not found':                        'Inget konto hittades med den e-postadressen.',
  'password should be at least 6 characters': 'Lösenordet måste vara minst 6 tecken.',
  'at least 6 characters':                 'Lösenordet måste vara minst 6 tecken.',
  'weak password':                         'Lösenordet är för svagt. Välj ett starkare lösenord.',
  'password is too weak':                  'Lösenordet är för svagt. Välj ett starkare lösenord.',
  'invalid email':                         'Ogiltig e-postadress.',
  'email rate limit exceeded':             'För många försök. Vänta en stund och försök igen.',
  'too many requests':                     'För många försök. Vänta en stund och försök igen.',
  'rate limit exceeded':                   'För många försök. Vänta en stund och försök igen.',
  'over_email_send_rate_limit':            'För många försök. Vänta en stund och försök igen.',
  'signup is disabled':                    'Registrering är inte tillgänglig just nu.',
  'signups not allowed':                   'Registrering är inte tillgänglig just nu.',
  'email link is invalid or has expired':  'Länken är ogiltig eller har gått ut. Begär en ny.',
  'token has expired or is invalid':       'Länken har gått ut. Begär en ny återställningslänk.',
  'otp expired':                           'Länken har gått ut. Begär en ny.',
  'same password':                         'Det nya lösenordet kan inte vara samma som det gamla.',
  'network error':                         'Nätverksfel. Kontrollera din internetanslutning.',
  'fetch failed':                          'Nätverksfel. Kontrollera din internetanslutning.',
};

// Supabase v2 error codes (AuthApiError.code)
const codeMap: Record<string, string> = {
  'user_already_exists':      'Det finns redan ett konto med den e-postadressen.',
  'email_exists':             'Det finns redan ett konto med den e-postadressen.',
  'invalid_credentials':      'Fel e-postadress eller lösenord.',
  'email_not_confirmed':      'E-postadressen är inte bekräftad. Kolla din inkorg och klicka på bekräftelselänken.',
  'over_email_send_rate_limit': 'För många försök. Vänta en stund och försök igen.',
  'weak_password':            'Lösenordet är för svagt. Välj ett starkare lösenord.',
  'otp_expired':              'Länken har gått ut. Begär en ny.',
};

export function translateAuthError(error: unknown): string {
  if (!error) return 'Något gick fel. Försök igen.';

  if (typeof error === 'object' && error !== null) {
    // Check error code first (most reliable)
    const code = (error as any).code ?? '';
    if (code && codeMap[code]) return codeMap[code];
  }

  const msg = typeof error === 'string' ? error : ((error as any).message ?? '');
  if (!msg) return 'Något gick fel. Försök igen.';

  const lower = msg.toLowerCase();
  for (const [key, translation] of Object.entries(errorMap)) {
    if (lower.includes(key)) return translation;
  }

  return 'Något gick fel. Försök igen.';
}
