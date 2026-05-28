/** Substitui caracteres de controle dentro de strings JSON por suas sequências de escape. */
function sanitizeJsonStrings(str: string): string {
  let result = "";
  let inString = false;
  let escaped = false;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];

    if (escaped) {
      result += ch;
      escaped = false;
      continue;
    }

    if (ch === "\\" && inString) {
      result += ch;
      escaped = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      result += ch;
      continue;
    }

    if (inString) {
      if      (ch === "\n") { result += "\\n";  continue; }
      else if (ch === "\r") { result += "\\r";  continue; }
      else if (ch === "\t") { result += "\\t";  continue; }
      else if (ch.charCodeAt(0) < 0x20) continue; // descarta outros controles
    }

    result += ch;
  }

  return result;
}

/** Extrai o primeiro objeto JSON de uma string de texto livre. */
export function extractJson<T>(text: string): T {
  const start = text.indexOf("{");
  const end   = text.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error(`Módulo não retornou JSON válido. Resposta recebida: ${text.slice(0, 200)}`);
  }

  const raw = text.slice(start, end + 1);

  try {
    return JSON.parse(raw) as T;
  } catch {
    // Segunda tentativa: sanitiza caracteres de controle dentro de strings
    const cleaned = sanitizeJsonStrings(raw);
    try {
      return JSON.parse(cleaned) as T;
    } catch (err2) {
      throw new Error(
        `JSON inválido após sanitização: ${err2 instanceof Error ? err2.message : err2}. Trecho: ${cleaned.slice(0, 300)}`
      );
    }
  }
}
