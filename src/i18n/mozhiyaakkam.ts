/**
 * Mozhiyaakkam (மொழியாக்கம்) Script Converter
 * Direct TypeScript port of Tolkappiyam / Neram script conversion rules from
 * com.elvan.neram.ui.mozhiyaakkam (Ta.kt & Ml.kt)
 */

function preprocessSandhi(text: string): string {
  const sb: string[] = [];
  let i = 0;
  const n = text.length;
  const sandhiConsonants = new Set(['\u0B95', '\u0B9A', '\u0BA4', '\u0BAA']); // க, ச, த, ப

  while (i < n) {
    const c = text[i];
    if (
      sandhiConsonants.has(c) &&
      i + 2 < n &&
      text[i + 1] === '\u0BCD' &&
      text[i + 2] === ' ' &&
      i + 3 < n &&
      text[i + 3] === c
    ) {
      // "C + ் + ' ' + C" -> shift space before C + ் so it joins as a geminated ligature in Malayalam (e.g. "சங்கத் தமிழ்" -> "സങ്ക ത്തമിഴ്")
      sb.push(' ');
      sb.push(c);
      sb.push('\u0BCD');
      i += 3;
    } else {
      sb.push(c);
      i++;
    }
  }
  return sb.join('');
}

/**
 * Transliterates pure Tamil script into exact 1-to-1 letter-by-letter Malayalam script.
 * Preserves exact Tamil spelling without Sanskritization or Malayalam lexical adaptation.
 */
export function taToMlym(text: string): string {
  if (!text) return '';
  const processed = preprocessSandhi(text);
  const sb: string[] = [];
  let i = 0;
  const n = processed.length;

  while (i < n) {
    const c = processed[i];

    // Modern Tamil Fa (ஃ + ப -> Malayalam ഫ)
    if (c === '\u0B83' && i + 1 < n && processed[i + 1] === '\u0BAA') {
      sb.push('\u0D2B'); // ഫ
      i += 2;
      continue;
    }

    const hasVirama = i + 1 < n && processed[i + 1] === '\u0BCD';
    const nextAfterVirama = hasVirama && i + 2 < n ? processed[i + 2] : null;

    if (hasVirama) {
      if (c === '\u0BAE') { // ம் (ம + ்)
        if (nextAfterVirama !== null && (nextAfterVirama === '\u0BAA' || nextAfterVirama === '\u0BAE')) {
          sb.push('\u0D2E\u0D4D');
        } else if (nextAfterVirama === null || nextAfterVirama === ' ' || "\n\t.,;:!?()[]{}\"'-_/".includes(nextAfterVirama)) {
          sb.push('\u0D02'); // Anusvara ം
        } else {
          sb.push('\u0D02'); // ം
        }
        i += 2;
        continue;
      }

      if (c === '\u0BA9') { // ன் (ன + ்)
        if (nextAfterVirama === '\u0BB1') {
          sb.push('\u0D28\u0D4D\u0D31'); // ന്റ
          i += 3;
          continue;
        } else if (nextAfterVirama === '\u0BA9') {
          sb.push('\u0D28\u0D4D\u0D28'); // ന്ന
          i += 3;
          continue;
        } else {
          sb.push('\u0D7B'); // Chillu N ൻ
          i += 2;
          continue;
        }
      }

      if (c === '\u0B9E') { // ஞ் (ஞ + ்)
        if (nextAfterVirama === '\u0B9A') {
          sb.push('\u0D1E\u0D4D\u0D1A'); // ഞ്ച
          i += 3;
          continue;
        } else if (nextAfterVirama === '\u0B9E') {
          sb.push('\u0D1E\u0D4D\u0D1E'); // ഞ്ഞ
          i += 3;
          continue;
        } else {
          sb.push('\u0D1E\u0D4D');
          i += 2;
          continue;
        }
      }

      if (c === '\u0BA3') { // ண் (ண + ்)
        if (nextAfterVirama === '\u0B9F') {
          sb.push('\u0D23\u0D4D\u0D1F'); // ണ്ട
          i += 3;
          continue;
        } else if (nextAfterVirama === '\u0BA3') {
          sb.push('\u0D23\u0D4D\u0D23'); // ண்ண -> ണ്ണ
          i += 3;
          continue;
        } else {
          sb.push('\u0D7A'); // Chillu NN ൺ
          i += 2;
          continue;
        }
      }

      if (c === '\u0BB0') { // ர் (ர + ்)
        sb.push('\u0D7C'); // Chillu R ർ
        i += 2;
        continue;
      }

      if (c === '\u0BB2') { // ல் (ல + ்)
        if (nextAfterVirama === '\u0BB2') {
          sb.push('\u0D32\u0D4D\u0D32'); // ല്ല
          i += 3;
          continue;
        } else {
          sb.push('\u0D7D'); // Chillu L ൽ
          i += 2;
          continue;
        }
      }

      if (c === '\u0BB3') { // ள் (ள + ்)
        if (nextAfterVirama === '\u0BB3') {
          sb.push('\u0D33\u0D4D\u0D33'); // ള്ള
          i += 3;
          continue;
        } else {
          sb.push('\u0D7E'); // Chillu LL ൾ
          i += 2;
          continue;
        }
      }
    }

    // Direct 1-to-1 letter mapping
    const directMap: Record<string, string> = {
      // Independent vowels
      '\u0B85': '\u0D05', // அ -> അ
      '\u0B86': '\u0D06', // ஆ -> ആ
      '\u0B87': '\u0D07', // இ -> ഇ
      '\u0B88': '\u0D08', // ஈ -> ഈ
      '\u0B89': '\u0D09', // உ -> ഉ
      '\u0B8A': '\u0D0A', // ஊ -> ഊ
      '\u0B8E': '\u0D0E', // எ -> എ
      '\u0B8F': '\u0D0F', // ஏ -> ഏ
      '\u0B90': '\u0D10', // ஐ -> ഐ
      '\u0B92': '\u0D12', // ஒ -> ഒ
      '\u0B93': '\u0D13', // ஓ -> ഓ
      '\u0B94': '\u0D14', // ஔ -> ഔ

      // Aytham preserved as Tamil Aytham (not corrupted to Sanskrit visarga)
      '\u0B83': '\u0B83', // ஃ -> ஃ

      // Consonants
      '\u0B95': '\u0D15', // க -> ക
      '\u0B99': '\u0D19', // ங -> ങ
      '\u0B9A': '\u0D1A', // ச -> ച
      '\u0B9C': '\u0D1C', // ஜ -> ജ
      '\u0B9E': '\u0D1E', // ஞ -> ഞ
      '\u0B9F': '\u0D1F', // ட -> ട
      '\u0BA3': '\u0D23', // ண -> ണ
      '\u0BA4': '\u0D24', // த -> ത
      '\u0BA8': '\u0D28', // ந -> ന
      '\u0BA9': '\u0D28', // ன -> ന
      '\u0BAA': '\u0D2A', // ப -> പ
      '\u0BAE': '\u0D2E', // ம -> മ
      '\u0BAF': '\u0D2F', // ய -> യ
      '\u0BB0': '\u0D30', // ர -> ര
      '\u0BB1': '\u0D31', // ற -> റ
      '\u0BB2': '\u0D32', // ல -> ല
      '\u0BB3': '\u0D33', // ள -> ള
      '\u0BB4': '\u0D34', // ழ -> ഴ
      '\u0BB5': '\u0D35', // வ -> വ
      '\u0BB6': '\u0D36', // ஶ -> ശ
      '\u0BB7': '\u0D37', // ஷ -> ഷ
      '\u0BB8': '\u0D38', // ஸ -> സ
      '\u0BB9': '\u0D39', // ஹ -> ഹ

      // Vowel signs
      '\u0BBE': '\u0D3E', // ா -> ാ
      '\u0BBF': '\u0D3F', // ி -> ി
      '\u0BC0': '\u0D40', // ீ -> ീ
      '\u0BC1': '\u0D41', // ு -> ു
      '\u0BC2': '\u0D42', // ூ -> ൂ
      '\u0BC6': '\u0D46', // ெ -> െ
      '\u0BC7': '\u0D47', // ே -> േ
      '\u0BC8': '\u0D48', // ை -> ൈ
      '\u0BCA': '\u0D4A', // ொ -> ൊ
      '\u0BCB': '\u0D4B', // ோ -> ോ
      '\u0BCC': '\u0D4C', // ௌ -> ൌ
      '\u0BCD': '\u0D4D', // ் -> ്
      '\u0BD7': '\u0D57', // ௗ -> ൗ

      // Symbols
      '\u0BD0': '\u0D13\u0D02' // ௐ -> ഓം
    };

    sb.push(directMap[c] ?? c);
    i++;
  }
  return sb.join('');
}

function isMlymVallinam(c: string): boolean {
  const code = c.charCodeAt(0);
  return (
    (code >= 0x0D15 && code <= 0x0D18) || // ക, ഖ, ഗ, ഘ (க)
    (code >= 0x0D1A && code <= 0x0D1D && c !== '\u0D1C') || // ച, ഛ, ഝ (ச, excluding Grantha Ja)
    (code >= 0x0D1F && code <= 0x0D22) || // ட
    (code >= 0x0D24 && code <= 0x0D27) || // த
    (code >= 0x0D2A && code <= 0x0D2D && c !== '\u0D2B') || // ப (excluding fa)
    c === '\u0D31' // ற
  );
}

function takesKutriyalukaram(c: string): boolean {
  return (
    isMlymVallinam(c) ||
    c === '\u0D23' || // ണ (ண)
    c === '\u0D28' || // ന (ந)
    c === '\u0D29' || // ഩ (ன)
    c === '\u0D30' || // ര (ர)
    c === '\u0D32' || // ല (ல)
    c === '\u0D33'    // ള (ள)
  );
}

function isLetterChar(c: string): boolean {
  return /\p{L}/u.test(c);
}

/**
 * Transliterates Malayalam script into authentic Tamil script, applying
 * classical Kutriyalukaram (Samvruthokaram), Chillu-pulli, and phonological folding rules.
 */
export function mlymToTaml(text: string): string {
  if (!text) return '';
  const sb: string[] = [];
  let i = 0;
  const n = text.length;

  while (i < n) {
    const c = text[i];

    // Word-final Virama '്':
    // - After Vallinam and Chillu-capable consonants -> Tamil 'ு' (Kutriyalukaram: അത്, വീട്, എന്താണ്, അവന്, കണ്ണ്)
    // - After consonants without chillu (ழ, ய, வ) and Grantha -> Tamil '்' (Pure pulli: തമിഴ്, താഴ്, ബസ്)
    if (c === '\u0D4D') {
      const isWordEnd = i === n - 1 || !isLetterChar(text[i + 1]);
      if (isWordEnd && i > 0 && takesKutriyalukaram(text[i - 1])) {
        // If previous letter was dental na (ந) taking word-final ugaram, adjust to ன for natural Tamil orthography (e.g. அவனு)
        if (text[i - 1] === '\u0D28' && sb.length > 0 && sb[sb.length - 1] === '\u0BA8') {
          sb[sb.length - 1] = '\u0BA9';
        }
        sb.push('\u0BC1');
        i++;
        continue;
      }
    }

    const directMap: Record<string, string> = {
      // Independent Vowels
      '\u0D05': '\u0B85', // അ -> அ
      '\u0D06': '\u0B86', // ആ -> ஆ
      '\u0D07': '\u0B87', // ഇ -> இ
      '\u0D08': '\u0B88', // ഈ -> ஈ
      '\u0D09': '\u0B89', // ഉ -> உ
      '\u0D0A': '\u0B8A', // ഊ -> ஊ
      '\u0D0B': '\u0BB0\u0BBF', // ഋ -> ரி
      '\u0D0E': '\u0B8E', // എ -> எ
      '\u0D0F': '\u0B8F', // ഏ -> ஏ
      '\u0D10': '\u0B90', // ഐ -> ஐ
      '\u0D12': '\u0B92', // ഒ -> ஒ
      '\u0D13': '\u0B93', // ഓ -> ஓ
      '\u0D14': '\u0B94', // ഔ -> ஔ

      // Anusvara & Visarga
      '\u0D02': '\u0BAE\u0BCD', // ം -> ம்
      '\u0D03': '\u0B83',       // ഃ -> ஃ (Aytham)

      // Chillu letters
      '\u0D7B': '\u0BA9\u0BCD', // ൻ -> ன்
      '\u0D7A': '\u0BA3\u0BCD', // ൺ -> ண்
      '\u0D7C': '\u0BB0\u0BCD', // ർ -> ர்
      '\u0D7D': '\u0BB2\u0BCD', // ൽ -> ல்
      '\u0D7E': '\u0BB3\u0BCD', // ൾ -> ள்
      '\u0D7F': '\u0B95\u0BCD', // ൿ -> க்

      // Consonants
      '\u0D15': '\u0B95', '\u0D16': '\u0B95', '\u0D17': '\u0B95', '\u0D18': '\u0B95', // க
      '\u0D19': '\u0B99', // ங
      '\u0D1A': '\u0B9A', '\u0D1B': '\u0B9A', '\u0D1D': '\u0B9A', // ச
      '\u0D1C': '\u0B9C', // ஜ (Grantha Ja)
      '\u0D1E': '\u0B9E', // ஞ
      '\u0D1F': '\u0B9F', '\u0D20': '\u0B9F', '\u0D21': '\u0B9F', '\u0D22': '\u0B9F', // ட
      '\u0D23': '\u0BA3', // ண
      '\u0D24': '\u0BA4', '\u0D25': '\u0BA4', '\u0D26': '\u0BA4', '\u0D27': '\u0BA4', // த
      '\u0D28': '\u0BA8', // ந
      '\u0D29': '\u0BA9', // ன
      '\u0D2A': '\u0BAA', '\u0D2C': '\u0BAA', '\u0D2D': '\u0BAA', // ப
      '\u0D2B': '\u0B83\u0BAA', // ഫ -> ஃப
      '\u0D2E': '\u0BAE', // ம
      '\u0D2F': '\u0BAF', // ய
      '\u0D30': '\u0BB0', // ர
      '\u0D31': '\u0BB1', // ற
      '\u0D32': '\u0BB2', // ல
      '\u0D33': '\u0BB3', // ள
      '\u0D34': '\u0BB4', // ழ
      '\u0D35': '\u0BB5', // வ
      '\u0D36': '\u0BB6', // ஶ
      '\u0D37': '\u0BB7', // ஷ
      '\u0D38': '\u0BB8', // ஸ
      '\u0D39': '\u0BB9', // ஹ

      // Vowel signs
      '\u0D3E': '\u0BBE', // ா
      '\u0D3F': '\u0BBF', // ி
      '\u0D40': '\u0BC0', // ீ
      '\u0D41': '\u0BC1', // ு
      '\u0D42': '\u0BC2', // ூ
      '\u0D43': '\u0BBF\u0BB0\u0BC1', // ൃ -> ிரு (e.g. കൃ -> கிரு)
      '\u0D44': '\u0BBF\u0BB0\u0BC2', // ൄ -> ிரூ
      '\u0D46': '\u0BC6', // ெ
      '\u0D47': '\u0BC7', // ே
      '\u0D48': '\u0BC8', // ை
      '\u0D4A': '\u0BCA', // ொ
      '\u0D4B': '\u0BCB', // ோ
      '\u0D4C': '\u0BCC', '\u0D57': '\u0BCC', // ௌ
      '\u0D4D': '\u0BCD'  // ்
    };

    sb.push(directMap[c] ?? c);
    i++;
  }
  return sb.join('');
}
