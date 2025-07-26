declare module 'crypto-js' {
  export interface WordArray {
    toString(encoder?: any): string;
  }

  export interface CipherParams {
    toString(): string;
  }

  export namespace AES {
    function encrypt(message: string, key: string): CipherParams;
    function decrypt(ciphertext: string, key: string): WordArray;
  }

  export namespace enc {
    export const Utf8: any;
  }

  export default {
    AES,
    enc
  };
}