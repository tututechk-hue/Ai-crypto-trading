import crypto from 'crypto';

const ALGO = 'aes-256-gcm';

export function encrypt(text: string, key: string){
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, Buffer.from(key,'base64'), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return iv.toString('base64') + ':' + tag.toString('base64') + ':' + encrypted.toString('base64');
}

export function decrypt(payload: string, key: string){
  const [ivb, tagb, encb] = payload.split(':');
  const iv = Buffer.from(ivb,'base64');
  const tag = Buffer.from(tagb,'base64');
  const encrypted = Buffer.from(encb,'base64');
  const decipher = crypto.createDecipheriv(ALGO, Buffer.from(key,'base64'), iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}
