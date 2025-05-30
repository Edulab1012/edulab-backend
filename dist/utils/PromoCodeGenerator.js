"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePromoCode = generatePromoCode;
function generatePromoCode(options) {
    const length = options?.length ?? 8;
    const prefix = options?.prefix ?? '';
    const charset = options?.charset ?? 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no O/0, I/1 to avoid confusion
    let code = '';
    for (let i = 0; i < length; i++) {
        code += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    console.log(`Generated promo code: ${prefix}${code}`);
    return prefix + code;
}
//# sourceMappingURL=PromoCodeGenerator.js.map