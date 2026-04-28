import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

// Ensure we have a key, even if not provided (fallback for dev, but should be in .env)
const getSecretKey = (): Buffer => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    console.warn("⚠️ Avertissement: ENCRYPTION_KEY n'est pas définie dans le fichier .env. Une clé temporaire sera utilisée, ce qui signifie que les données ne pourront pas être déchiffrées après un redémarrage du serveur.");
    // In memory temporary key as fallback
    return crypto.randomBytes(32);
  }
  
  // Clean up quotes if present in env var
  const cleanKey = key.replace(/['"]/g, '');
  
  if (cleanKey.length !== 64) {
    throw new Error("ENCRYPTION_KEY doit contenir exactement 64 caractères hexadécimaux (32 octets).");
  }
  
  return Buffer.from(cleanKey, "hex");
};

// Lazy initialization of the key
let secretKey: Buffer | null = null;
const getKey = () => {
  if (!secretKey) secretKey = getSecretKey();
  return secretKey;
};

/**
 * Chiffre une chaîne de caractères (pour la base de données)
 */
export function encrypt(text: string | null | undefined): string | null | undefined {
  if (!text) return text;
  // Ne pas chiffrer deux fois
  if (text.startsWith("enc:")) return text;
  
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    const authTag = cipher.getAuthTag().toString("hex");
    
    return `enc:${iv.toString("hex")}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error("[ENCRYPTION_ERROR]", error);
    // En cas d'erreur, on retourne le texte original par sécurité (ou on throw ?)
    // Throw est plus sûr pour ne pas stocker en clair silencieusement
    throw new Error("Échec du chiffrement des données sensibles");
  }
}

/**
 * Déchiffre une chaîne de caractères (depuis la base de données)
 */
export function decrypt(text: string | null | undefined): string | null | undefined {
  if (!text) return text;
  // Si ce n'est pas chiffré, on retourne le texte original
  if (!text.startsWith("enc:")) return text;
  
  try {
    const parts = text.split(":");
    if (parts.length !== 4) return text; // Format invalide
    
    const iv = Buffer.from(parts[1], "hex");
    const authTag = Buffer.from(parts[2], "hex");
    const encryptedText = parts[3];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error) {
    console.error("[DECRYPTION_ERROR]", error);
    // En cas d'erreur de déchiffrement, on retourne une valeur masquée
    return "******** (Erreur de déchiffrement)";
  }
}

/**
 * Liste des champs considérés comme sensibles dans le modèle Client
 */
export const SENSITIVE_CLIENT_FIELDS = [
  "telephone",
  "telephonePortable",
  "email",
  "adresse",
  "adresseComplement",
  "codePostal",
  "ville",
  "pays",
  "siret",
  "numeroTVA",
  "contactSurPlace",
  "telSurPlace",
  "interlocuteurNomComplet",
  "interlocuteurEmail",
  "interlocuteurPortable"
];

/**
 * Chiffre les champs sensibles d'un objet
 */
export function encryptSensitiveData<T extends Record<string, any>>(data: T, fieldsToEncrypt: string[] = SENSITIVE_CLIENT_FIELDS): T {
  const result = { ...data };
  
  for (const field of fieldsToEncrypt) {
    if (result[field] && typeof result[field] === 'string') {
      result[field as keyof T] = encrypt(result[field]) as any;
    }
  }
  
  return result;
}

/**
 * Déchiffre les champs sensibles d'un objet
 */
export function decryptSensitiveData<T extends Record<string, any>>(data: T, fieldsToDecrypt: string[] = SENSITIVE_CLIENT_FIELDS): T {
  if (!data) return data;
  
  const result = { ...data };
  
  for (const field of fieldsToDecrypt) {
    if (result[field] && typeof result[field] === 'string' && result[field].startsWith('enc:')) {
      result[field as keyof T] = decrypt(result[field]) as any;
    }
  }
  
  return result;
}
