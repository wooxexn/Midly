import { randomInt } from 'crypto';

// 헷갈리는 문자(l, o, 0, 1) 제외
const ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789';
const CODE_LENGTH = 8;

/** 링크용 짧은 방 코드 생성 (예: "a1b2c3") */
export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return code;
}
