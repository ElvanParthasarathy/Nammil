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
  return /[\p{L}\p{M}]/u.test(c);
}

function getTamilBaseConsonant(c: string): string | null {
  if (c === '\u0D36' || c === '\u0D38' || c === '\u0D1C' || (c >= '\u0D1A' && c <= '\u0D1D')) return '\u0B9A'; // ശ, സ, ജ, ച -> ச
  if (c >= '\u0D15' && c <= '\u0D18') return '\u0B95'; // க
  if (c >= '\u0D1F' && c <= '\u0D22') return '\u0B9F'; // ட
  if (c === '\u0D23') return '\u0BA3'; // ண
  if (c >= '\u0D24' && c <= '\u0D27') return '\u0BA4'; // த
  if (c === '\u0D28') return '\u0BA8'; // ந
  if (c === '\u0D29') return '\u0BA9'; // ன
  if (c >= '\u0D2A' && c <= '\u0D2D' && c !== '\u0D2B') return '\u0BAA'; // ப
  if (c === '\u0D2B') return '\u0B83\u0BAA'; // ஃப
  if (c === '\u0D2E') return '\u0BAE'; // ம
  if (c === '\u0D2F') return '\u0BAF'; // ய
  if (c === '\u0D30') return '\u0BB0'; // ர
  if (c === '\u0D31') return '\u0BB1'; // ற
  if (c === '\u0D32') return '\u0BB2'; // ல
  if (c === '\u0D33') return '\u0BB3'; // ள
  if (c === '\u0D34') return '\u0BB4'; // ழ
  if (c === '\u0D35') return '\u0BB5'; // வ
  if (c === '\u0D37') return '\u0BB7'; // ஷ
  if (c === '\u0D39') return '\u0B95'; // ഹ -> க (medially)
  return null;
}

/**
 * Transliterates Malayalam script into authentic Tamil script, applying
 * classical Kutriyalukaram (Samvruthokaram), Svarabhakti cluster resolution,
 * Chillu-pulli, and phonological folding rules.
 */
export function mlymToTaml(text: string): string {
  if (!text) return '';
  const sb: string[] = [];
  let i = 0;
  const n = text.length;

  while (i < n) {
    const c = text[i];
    const isWordStart = i === 0 || !isLetterChar(text[i - 1]);
    const isWordEnd = i === n - 1 || !isLetterChar(text[i + 1]);

    // 1. Word-initial Prosthetic Vowel (மொழிமுதல் முன்னிலை உயிர்: ற, ര, ല, ള):
    // In Tamil, words cannot start with ற, ர, ல, ள (Tolkappiyam Mozhimarabu).
    // Prepend 'இ' (or 'உ' before u/o vowels).
    if (isWordStart) {
      if (c === '\u0D31' || c === '\u0D30') { // റ, ര -> இர / உர
        const next = i + 1 < n ? text[i + 1] : '';
        if (next === '\u0D41' || next === '\u0D42') { // ു, ൂ
          sb.push('\u0B89'); // உ
        } else {
          sb.push('\u0B87'); // இ
        }
        sb.push('\u0BB0'); // ர
        i++;
        continue;
      }
      if (c === '\u0D32' || c === '\u0D33') { // ല, ള -> இல / உல
        const next = i + 1 < n ? text[i + 1] : '';
        if (next === '\u0D4A' || next === '\u0D4B' || next === '\u0D41' || next === '\u0D42') { // ൊ, ോ, ു, ൂ
          sb.push('\u0B89'); // உ
        } else {
          sb.push('\u0B87'); // இ
        }
        sb.push(c === '\u0D33' ? '\u0BB3' : '\u0BB2'); // ள / ல
        i++;
        continue;
      }

      // 2. Word-initial Ha (ഹ) deletion per Tolkappiyam (ஹரி -> அரி, இந்து, ஏமம்):
      if (c === '\u0D39') {
        const next = i + 1 < n ? text[i + 1] : '';
        const vMap: Record<string, string> = {
          '\u0D3E': '\u0B86', // ஆ
          '\u0D3F': '\u0B87', // இ
          '\u0D40': '\u0B88', // ஈ
          '\u0D41': '\u0B89', // உ
          '\u0D42': '\u0B8A', // ஊ
          '\u0D46': '\u0B8E', // எ
          '\u0D47': '\u0B8F', // ஏ
          '\u0D48': '\u0B90', // ஐ
          '\u0D4A': '\u0B92', // ஒ
          '\u0D4B': '\u0B93', // ஓ
          '\u0D4C': '\u0B94', // ஔ
          '\u0D57': '\u0B94'
        };
        if (vMap[next]) {
          sb.push(vMap[next]);
          i += 2;
          continue;
        } else {
          // Inherent short a (e.g. ഹരി -> அரி)
          sb.push('\u0B85'); // அ
          i++;
          continue;
        }
      }
    }

    // 3. Cluster ഹ്മ (hma) / ഹ്ന (hna) - Ha deletion per Tolkappiyam (Brahm -> பிரம்மம், பிராமண):
    if (c === '\u0D39' && i + 2 < n && text[i + 1] === '\u0D4D') {
      const c3 = text[i + 2];
      if (c3 === '\u0D2E') { // ഹ്മ -> ம்ம / ம
        const prev = i > 0 ? text[i - 1] : '';
        const prevIsLong = prev === '\u0D3E' || prev === '\u0D40' || prev === '\u0D42' || prev === '\u0D47' || prev === '\u0D4B' || prev === '\u0D48';
        if (prevIsLong) {
          sb.push('\u0BAE'); // ம (e.g. ബ്രാഹ്മണ -> பிராமண)
        } else {
          sb.push('\u0BAE\u0BCD\u0BAE'); // ம்ம (e.g. ബ്രഹ്മം -> பிரம்மம்)
        }
        i += 3;
        continue;
      }
      if (c3 === '\u0D28') { // ഹ്ന -> ன்ன (e.g. ചിഹ്നം -> சின்னம்)
        sb.push('\u0BA9\u0BCD\u0BA9');
        i += 3;
        continue;
      }
    }

    // 4. Word-initial / Svarabhakti cluster resolution (மொழிமுதல் மெய்ம்மயக்கமின்மை):
    // Palatal gemination for sa- prefix / short 'sa' before palatals (സജീവ -> சச்சீவ, സചിവ -> சச்சிவ):
    if ((c === '\u0D38' || c === '\u0D1A') && i + 1 < n) {
      const next = text[i + 1];
      if (next >= '\u0D1A' && next <= '\u0D1D') {
        sb.push('\u0B9A\u0B9A\u0BCD'); // சச்
        i++;
        continue;
      }
    }

    // Malayalam conjunct സ്റ്റ (sta = സ + ് + റ + ് + റ):
    // In Malayalam typography, sa + tta represents English/loan 'st' (stand -> ஸ்டாண்டு, post -> போஸ்டு, restart -> இரீஸ்டார்ட்டு)
    if (c === '\u0D38' && i + 4 < n && text[i + 1] === '\u0D4D' && text[i + 2] === '\u0D31' && text[i + 3] === '\u0D4D' && text[i + 4] === '\u0D31') {
      sb.push('\u0BB8\u0BCD\u0B9F'); // ஸ்ட
      i += 5;
      continue;
    }

    if (i + 2 < n && text[i + 1] === '\u0D4D') {
      const c1 = c;
      const c3 = text[i + 2];
      const base1 = getTamilBaseConsonant(c1);

      if (base1) {
        // C1 + ് + ര (Ra):
        // പ്ര -> பிர, പ്രി -> பிரி, ശ്ര -> சிர (ശ്രമം -> சிரமம், ശ്രദ്ധ -> சிரத்தை)
        if (c3 === '\u0D30' && (isWordStart || c1 === '\u0D36' || c1 === '\u0D38')) {
          sb.push(base1 + '\u0BBF'); // inserts ி
          sb.push('\u0BB0');         // ர
          i += 3;
          continue;
        }

        // C1 + ് + യ (Ya) -> Svarabhakti per Tolkappiyam / Nannul 147-148:
        // - Medial Dental + ് + യ -> த் + தி + ய (thtthiya, e.g. സാങ്കേതികവിദ്യ: -> சாங்கேதிகவித்திய:, ആദിത്യ -> ஆதித்திய, സത്യ -> சத்திய, പ്രത്യേകം -> பிரத்தியேகம்)
        // - Medial Velar + ് + യ -> க் + கி + ய (kkiya, e.g. വാക്യം -> வாக்கியம், ഭാഗ്യം -> பாக்கியம், യോഗ്യം -> யோக்கியம், ആരോഗ്യം -> ஆரோக்கியம்)
        // - Medial Labial + ് + യ -> ப் + பி + ய (ppiya, e.g. അഭ്യാസം -> அப்பியாசம்)
        // - Medial Palatal + ് + യ -> ச் + சி + ய (cciya, e.g. രാജ്യം -> ராச்சியம்)
        // - Medial Va + ് + യ -> வ் + வி + ய (vviya, e.g. ദിവ്യം -> திவ்வியம்)
        // - Medial Ra + ് + യ -> ரிய (riya, e.g. കാര്യ -> காரிய, സൂര്യ -> சூரிய)
        // - Word-initial Dental + ് + യ -> தியா (e.g. ത്യാഗം -> தியாகம்)
        // - Other Word-initial C1 + ് + യ -> C1 + ி + ய (e.g. ന്യാ -> நியா, വ്യാ -> வியா)
        if (c3 === '\u0D2F') {
          const code1 = c1.charCodeAt(0);
          const isDental = code1 >= 0x0D24 && code1 <= 0x0D27; // ത, ഥ, ദ, ധ
          const isVelar = code1 >= 0x0D15 && code1 <= 0x0D18;  // ക, ഖ, ഗ, ഘ
          const isLabial = code1 >= 0x0D2A && code1 <= 0x0D2D && c1 !== '\u0D2B'; // പ, ഫ, ബ, ഭ
          const isPalatal = (code1 >= 0x0D1A && code1 <= 0x0D1D) || c1 === '\u0D1C'; // ച, ഛ, ജ, ഝ

          if (isDental) {
            if (!isWordStart) {
              sb.push('\u0BA4\u0BCD\u0BA4\u0BBF\u0BAF'); // த்திய
              i += 3;
              continue;
            } else {
              sb.push('\u0BA4\u0BBF\u0BAF'); // தியா
              i += 3;
              continue;
            }
          } else if (!isWordStart && isVelar) {
            sb.push('\u0B95\u0BCD\u0B95\u0BBF\u0BAF'); // க்கிய
            i += 3;
            continue;
          } else if (!isWordStart && isLabial) {
            sb.push('\u0BAA\u0BCD\u0BAA\u0BBF\u0BAF'); // ப்பிய
            i += 3;
            continue;
          } else if (!isWordStart && isPalatal) {
            sb.push('\u0B9A\u0BCD\u0B9A\u0BBF\u0BAF'); // ச்சிய
            i += 3;
            continue;
          } else if (!isWordStart && c1 === '\u0D35') {
            sb.push('\u0BB5\u0BCD\u0BB5\u0BBF\u0BAF'); // வ்விய
            i += 3;
            continue;
          } else if (c1 === '\u0D30') {
            sb.push('\u0BB0\u0BBF\u0BAF'); // ரிய
            i += 3;
            continue;
          } else if (isWordStart) {
            sb.push(base1 + '\u0BBF'); // inserts ி
            sb.push('\u0BAF');         // ய
            i += 3;
            continue;
          }
        }

        // Word-initial C1 + ് + വ (Va) -> C1 + ு + வ (சுவா / சுவ, e.g. സ്വാമി -> சுவாமி, ദ്வா -> துவா, സ്വന്തം -> சுவந்தம்)
        if (isWordStart && c3 === '\u0D35') {
          sb.push(base1 + '\u0BC1'); // inserts ு
          sb.push('\u0BB5');         // வ
          i += 3;
          continue;
        }

        // Word-initial സ/ശ + ് + ന/മ/ല (Sibilant + Nasal/Liquid per Tolkappiyam):
        if (isWordStart && (c1 === '\u0D38' || c1 === '\u0D36')) {
          if (c3 === '\u0D28') { // സ്ന -> சின (சினேகம்)
            sb.push('\u0B9A\u0BBF\u0BA9');
            i += 3;
            continue;
          }
          if (c3 === '\u0D2E') { // സ്ம -> சும (சுமரணை)
            sb.push('\u0B9A\u0BC1\u0BAE');
            i += 3;
            continue;
          }
          if (c3 === '\u0D32') { // ശ്ല -> சுல (சுலோகம்)
            sb.push('\u0B9A\u0BC1\u0BB2');
            i += 3;
            continue;
          }
        }

        // C1 + ് + ല/ള (Liquid La / Lla):
        // Svarabhakti (இடைப்பிறவரல்):
        // - After Anusvara (e.g. ഇംഗ്ലീഷ് -> இங்கிலீஷ், ഇംഗ്ലണ്ട് -> இங்கிலண்டு)
        // - At word start (e.g. ക്ലാസ്സ് -> கிலாசு, പ്ലാവ് -> பிலாவு)
        if ((c3 === '\u0D32' || c3 === '\u0D33') && c1 !== '\u0D32' && c1 !== '\u0D33') {
          if (isWordStart || (i > 0 && (text[i - 1] === '\u0D02' || !isLetterChar(text[i - 1])))) {
            sb.push(base1 + '\u0BBF'); // inserts ி
            sb.push(c3 === '\u0D33' ? '\u0BB3' : '\u0BB2'); // ல / ள
            i += 3;
            continue;
          }
        }

        // s + consonant in loanwords like modern സ്റ്റ (st) or സ്ക (sk):
        if (c1 === '\u0D38') {
          sb.push('\u0BB8\u0BCD'); // retain pulli sibilant ஸ்
          sb.push(getTamilBaseConsonant(c3) ?? c3);
          i += 3;
          continue;
        }
      }
    }

    // 5. Word-final A-stem feminine/loan noun ending -> Tamil '-ai' (ஆ ஈற்று வடசொல் ஐகார ஈறாதல்):
    // E.g. കഥ -> கதை, ലങ്ക -> இலங்கை, ദോശ -> தோசை, ഗംഗ -> கங்கை, മാല -> மாலை, പൂജ -> பூசை, സഭ -> சபை
    if (isWordEnd) {
      const prev = i > 0 ? text[i - 1] : '';
      const prev2 = i > 1 ? text[i - 2] : '';
      const prevIsLong = prev === '\u0D3E' || prev === '\u0D40' || prev === '\u0D42' || prev === '\u0D47' || prev === '\u0D4B' || prev === '\u0D48';

      // 1. Ending in ഥ (tha) -> தை (e.g. കഥ -> கதை)
      if (c === '\u0D25') {
        sb.push('\u0BA4\u0BC8');
        i++;
        continue;
      }

      // 2. Ending in ശ/ഷ -> சை (e.g. ദോശ -> தோசை, ഭാഷ -> பாசை, ആശ -> ஆசை)
      if (c === '\u0D36' || c === '\u0D37') {
        sb.push('\u0B9A\u0BC8');
        i++;
        continue;
      }

      // 3. Ending in ഭ (bha) -> பை (e.g. സഭ -> சபை, ശോഭ -> சோபை)
      if (c === '\u0D2D') {
        sb.push('\u0BAA\u0BC8');
        i++;
        continue;
      }

      // 4. Ending in ജ (ja) -> சை (e.g. പൂജ -> பூசை)
      if (c === '\u0D1C') {
        sb.push('\u0B9A\u0BC8');
        i++;
        continue;
      }

      // 5. Ending in ങ്ക (nka) or Anusvara + ഗ (nga) -> ங்கை (e.g. ലങ്ക -> இலங்கை, ഗംഗ -> கங்கை)
      if ((c === '\u0D15' && prev === '\u0D4D' && prev2 === '\u0D19') ||
          (c === '\u0D17' && prev === '\u0D02')) {
        sb.push('\u0B95\u0BC8');
        i++;
        continue;
      }

      // 6. Ending in Dental (ത, ഥ, ദ, ധ) after long vowel, nasal, or conjunct (e.g. ചിന്ത -> சிந்தை, വാർത്ത -> வார்த்தை, കവിത -> கவிதை, സീത -> சீதை, ശ്രദ്ധ -> சிரத்தை)
      if (c >= '\u0D24' && c <= '\u0D27') {
        const isAfterNasalOrConjunct = prev === '\u0D4D' || prev === '\u0D7B' || prev === '\u0D7A' || prev === '\u0D7C';
        const isAfterMultiSyllableVowel = prev === '\u0D3F' && i >= 3;
        if (prevIsLong || isAfterNasalOrConjunct || isAfterMultiSyllableVowel) {
          sb.push('\u0BA4\u0BC8');
          i++;
          continue;
        }
      }

      // 7. Ending in ല (la) after long vowel (e.g. മാല -> மாலை, ശാല -> சாலை)
      if (c === '\u0D32' && prevIsLong) {
        sb.push('\u0BB2\u0BC8');
        i++;
        continue;
      }

      // 8. Ending in വ (va) for specific words like സേവ -> சேவை
      if (c === '\u0D35' && i >= 2 && text.slice(i - 2, i + 1) === '\u0D38\u0D47\u0D35') {
        sb.push('\u0BB5\u0BC8');
        i++;
        continue;
      }

      // 9. Ending in ഖ (kha) after long vowel (e.g. ശാഖ -> சாகை, രേഖ -> இரேகை)
      if (c === '\u0D16' && prevIsLong) {
        sb.push('\u0B95\u0BC8');
        i++;
        continue;
      }

      // 10. Ending in യ (ya) after long vowel for Sanskrit nouns (ഛായ -> சாயை, മായ -> மாயை)
      // Malayalam relative participle adjectives ending in -āya (പൊതുവായ) retain original letter 'ய'
      if (c === '\u0D2F' && (prev === '\u0D3E' || prev === '\u0D47' || prev === '\u0D4B')) {
        const isSanskritNoun = i <= 3 && (text === '\u0D1B\u0D3E\u0D2F' || text === '\u0D2E\u0D3E\u0D2F' || text.endsWith(' \u0D1B\u0D3E\u0D2F') || text.endsWith(' \u0D2E\u0D3E\u0D2F'));
        if (isSanskritNoun) {
          sb.push('\u0BAF\u0BC8'); // சாயை, மாயை
          i++;
          continue;
        }
      }
    }

    // 6. Anusvara (ം) Homorganic Nasal (இனவெழுத்து) assimilation:
    // Velar (ക,ഖ,ഗ,ഘ) -> ங் (e.g. ഇംഗ്ലീഷ് -> இங்கிலீஷ், സംഗീതം -> சங்கீதம்)
    // Palatal (ച,ഛ,ജ,ഝ) -> ஞ் (e.g. പഞ്ചായത്ത് -> பஞ்சாயத்து)
    // Retroflex (ട,ഠ,ഡ,ഢ) -> ண்
    // Dental (ത,ഥ,ദ,ധ) -> ந் (e.g. സന്തോഷം -> சந்தோஷம்)
    // Labial (പ,ഫ,ബ,ഭ,മ) -> ம் (e.g. ആരംഭം -> ஆரம்பம்)
    if (c === '\u0D02') {
      const nextChar = i + 1 < n ? text[i + 1] : null;
      if (nextChar !== null) {
        const nextCode = nextChar.charCodeAt(0);
        if (nextCode >= 0x0D15 && nextCode <= 0x0D18) {
          sb.push('\u0B99\u0BCD'); // ங்
          i++;
          continue;
        } else if (nextCode >= 0x0D1A && nextCode <= 0x0D1D) {
          sb.push('\u0B9E\u0BCD'); // ஞ்
          i++;
          continue;
        } else if (nextCode >= 0x0D1F && nextCode <= 0x0D22) {
          sb.push('\u0BA3\u0BCD'); // ண்
          i++;
          continue;
        } else if (nextCode >= 0x0D24 && nextCode <= 0x0D27) {
          sb.push('\u0BA8\u0BCD'); // ந்
          i++;
          continue;
        } else if (nextCode >= 0x0D2A && nextCode <= 0x0D2E) {
          sb.push('\u0BAE\u0BCD'); // ம்
          i++;
          continue;
        } else if (nextChar === '\u0D31') {
          sb.push('\u0BA9\u0BCD'); // ன்
          i++;
          continue;
        }
      }
      sb.push('\u0BAE\u0BCD');
      i++;
      continue;
    }

    // 7. Intervocalic Ha (இடை ஹகரம் -> க, e.g. സ്നേഹം -> சினேகம், മോഹം -> மோகம், ദേഹം -> தேகம், ദാഹം -> தாகம்):
    if (!isWordStart && c === '\u0D39') {
      sb.push('\u0B95'); // க
      i++;
      continue;
    }

    // 7b. Dental vs Alveolar vs Retroflex Nasal (ந vs ன vs ண per Tolkappiyam):
    // Word-initial is ந, medial single is ன
    // Before retroflex stop (ട, ഠ, ഡ, ഢ) -> ண (டன்னகரம்: பிராண்டு)
    // Before dental stop (ത, ഥ, ദ, ധ) -> ந் (பந்து)
    // Before alveolar stop (റ) -> ன் (என்றெ)
    if (c === '\u0D28') {
      if (isWordStart) {
        sb.push('\u0BA8'); // ந
      } else if (i + 1 < n && text[i + 1] === '\u0D4D') {
        let lookahead = i + 2;
        while (lookahead < n && (text[lookahead] === '\u200C' || text[lookahead] === '\u200D')) {
          lookahead++;
        }
        const nextChar = lookahead < n ? text[lookahead] : null;
        if (nextChar !== null) {
          const nextCode = nextChar.charCodeAt(0);
          if (nextCode >= 0x0D1F && nextCode <= 0x0D22) {
            sb.push('\u0BA3\u0BCD'); // ண் before ட (டன்னகரம்: பிராண்டு, செக்கண்டு, ஸ்டாண்டு)
            i = lookahead;
            continue;
          } else if (nextCode >= 0x0D24 && nextCode <= 0x0D27) {
            sb.push('\u0BA8\u0BCD'); // ந் before த (தந்நகரம்: பந்து)
            i = lookahead;
            continue;
          } else if (nextChar === '\u0D31') {
            sb.push('\u0BA9\u0BCD'); // ன் before ற (றன்னகரம்: என்று)
            i = lookahead;
            continue;
          } else if (nextCode >= 0x0D15 && nextCode <= 0x0D18) {
            sb.push('\u0B99\u0BCD'); // ங் before க
            i = lookahead;
            continue;
          } else if (nextCode >= 0x0D1A && nextCode <= 0x0D1D) {
            sb.push('\u0B9E\u0BCD'); // ஞ் before ச
            i = lookahead;
            continue;
          } else if (nextCode >= 0x0D2A && nextCode <= 0x0D2E) {
            sb.push('\u0BAE\u0BCD'); // ம் before ப
            i = lookahead;
            continue;
          }
        }
        sb.push('\u0BA9\u0BCD'); // ன்
        i = lookahead;
        continue;
      } else {
        sb.push('\u0BA9'); // ன (medial intervocalic)
      }
      i++;
      continue;
    }

    // 7c. Chillu N (ൻ) homorganic nasal assimilation (டன்னகரம் / தந்நகரம் / றன்னகரம்):
    // Before retroflex stop (ട, ഠ, ഡ, ഢ) -> ண் (டன்னகரம்: பிராண்டு, செக்கண்டு, ஸ்டாண்டு)
    // Before dental stop (ത, ഥ, ദ, ധ) -> ந் (பந்து)
    // Before alveolar stop (റ) -> ன் (என்றெ)
    if (c === '\u0D7B') {
      let lookahead = i + 1;
      while (lookahead < n && (text[lookahead] === '\u200C' || text[lookahead] === '\u200D' || text[lookahead] === '\u0D4D')) {
        lookahead++;
      }
      const nextChar = lookahead < n ? text[lookahead] : null;
      if (nextChar !== null) {
        const nextCode = nextChar.charCodeAt(0);
        if (nextCode >= 0x0D1F && nextCode <= 0x0D22) {
          sb.push('\u0BA3\u0BCD'); // ண் before ட (டன்னகரம்: பிராண்டு, செக்கண்டு, ஸ்டாண்டு)
          i = lookahead;
          continue;
        } else if (nextCode >= 0x0D24 && nextCode <= 0x0D27) {
          sb.push('\u0BA8\u0BCD'); // ந் before த (தந்நகரம்)
          i = lookahead;
          continue;
        } else if (nextChar === '\u0D31') {
          sb.push('\u0BA9\u0BCD'); // ன் before ற (றன்னகரம்)
          i = lookahead;
          continue;
        } else if (nextCode >= 0x0D15 && nextCode <= 0x0D18) {
          sb.push('\u0B99\u0BCD'); // ங் before க
          i = lookahead;
          continue;
        } else if (nextCode >= 0x0D1A && nextCode <= 0x0D1D) {
          sb.push('\u0B9E\u0BCD'); // ஞ் before ச
          i = lookahead;
          continue;
        } else if (nextCode >= 0x0D2A && nextCode <= 0x0D2E) {
          sb.push('\u0BAE\u0BCD'); // ம் before ப
          i = lookahead;
          continue;
        }
      }
      sb.push('\u0BA9\u0BCD'); // ன்
      i++;
      continue;
    }

    // 7d. Chillu R (ർ) before Ya (യ) -> Svarabhakti 'ரி' per Nannul 147 (കാര്യം -> காரியம், സൂര്യൻ -> சூரியன், ധൈര്യം -> தைரியம்):
    if (c === '\u0D7C') {
      if (i + 1 < n && text[i + 1] === '\u0D2F') {
        sb.push('\u0BB0\u0BBF'); // inserts ரி before ய
        i++;
        continue;
      }
      sb.push('\u0BB0\u0BCD'); // ர்
      i++;
      continue;
    }

    // 8. Word-final sibilant with virama (e.g. Settings -> സെറ്റിങ്സ്):
    // Avoid corrupted 'ச்' at word ends in loanwords
    if (c === '\u0D38' && i + 1 < n && text[i + 1] === '\u0D4D') {
      sb.push('\u0BB8\u0BCD'); // retain pulli ஸ் (not ச்)
      i += 2;
      continue;
    }

    // 9. Word-final Virama '്':
    // - After Vallinam and Chillu-capable consonants -> Tamil 'ு' (Kutriyalukaram: അത്, വീട്, എന്താണ്, അവന്, കണ്ണ്)
    // - After consonants without chillu (ழ, ய, வ) and Grantha -> Tamil '்' (Pure pulli: തമിഴ്, താഴ്, ബസ്)
    if (c === '\u0D4D') {
      if (isWordEnd && i > 0) {
        if (text[i - 1] === '\u0D37') {
          sb.push('\u0BCD');
          i++;
          continue;
        }
        if (takesKutriyalukaram(text[i - 1])) {
          if (text[i - 1] === '\u0D28' && sb.length > 0 && sb[sb.length - 1] === '\u0BA8') {
            sb[sb.length - 1] = '\u0BA9';
          }
          sb.push('\u0BC1');
          i++;
          continue;
        }
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
      '\u0D0B': '\u0B87\u0BB0\u0BBF', // ഋ -> இரி
      '\u0D0E': '\u0B8E', // எ -> எ
      '\u0D0F': '\u0B8F', // ഏ -> ஏ
      '\u0D10': '\u0B90', // ஐ -> ஐ
      '\u0D12': '\u0B92', // ஒ -> ஒ
      '\u0D13': '\u0B93', // ഓ -> ஓ
      '\u0D14': '\u0B94', // ഔ -> ஔ

      // Visarga
      '\u0D03': '\u0B83',       // ഃ -> ஃ (Aytham)

      // Chillu letters
      '\u0D7B': '\u0BA9\u0BCD', // ൻ -> ன்
      '\u0D7A': '\u0BA3\u0BCD', // ൺ -> ண்
      '\u0D7C': '\u0BB0\u0BCD', // ർ -> ர்
      '\u0D7D': '\u0BB2\u0BCD', // ൽ -> ல்
      '\u0D7E': '\u0BB3\u0BCD', // ൾ -> ள்
      '\u0D7F': '\u0B95\u0BCD', // ൿ -> க்

      // Consonants in Tolkappiyam (Granthas converted to Tamil letters):
      '\u0D15': '\u0B95', '\u0D16': '\u0B95', '\u0D17': '\u0B95', '\u0D18': '\u0B95', // க
      '\u0D19': '\u0B99', // ங
      '\u0D1A': '\u0B9A', '\u0D1B': '\u0B9A', '\u0D1D': '\u0B9A', // ச
      '\u0D1C': '\u0B9A', // ജ -> ச (Tolkappiyam: ஜனம் -> சனம், ஜீவன் -> சீவன்)
      '\u0D1E': '\u0B9E', // ஞ
      '\u0D1F': '\u0B9F', '\u0D20': '\u0B9F', '\u0D21': '\u0B9F', '\u0D22': '\u0B9F', // ட
      '\u0D23': '\u0BA3', // ண
      '\u0D24': '\u0BA4', '\u0D25': '\u0BA4', '\u0D26': '\u0BA4', '\u0D27': '\u0BA4', // த
      '\u0D28': '\u0BA8', '\u0D29': '\u0BA9',
      '\u0D2A': '\u0BAA', '\u0D2C': '\u0BAA', '\u0D2D': '\u0BAA', // ப
      '\u0D2B': '\u0B83\u0BAA', // ഫ -> ஃப
      '\u0D2E': '\u0BAE', '\u0D2F': '\u0BAF', '\u0D30': '\u0BB0', '\u0D31': '\u0BB1',
      '\u0D32': '\u0BB2', '\u0D33': '\u0BB3', '\u0D34': '\u0BB4', '\u0D35': '\u0BB5',
      '\u0D36': '\u0B9A', // ശ -> ச (Tolkappiyam: சிவன், சாந்தி, சிரமம்)
      '\u0D37': '\u0BB7', // ഷ -> ஷ
      '\u0D38': '\u0B9A', // സ -> ச (Tolkappiyam: சுகம், சூரியன், சபை)
      '\u0D39': '\u0B95', // ഹ -> க (medial)

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
