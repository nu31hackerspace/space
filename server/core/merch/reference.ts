// Human-readable order references, in the style Docker names containers, but
// in Ukrainian: `хоробрий-беркут-123456`. A buyer has to read this out over the
// phone and type it into a chat, which a 32-character hex string makes
// miserable — and Ukrainian words are what the people reading it actually speak.
//
// The trade-off is deliberate and worth stating: this is far less entropy than
// the UUID it replaces. 64 × 64 × 10^6 is ~4×10^9 combinations, and the public
// status endpoint is keyed on it — so guessing a reference reveals an order's
// status and total (nothing else: no name, contact or address). If that ever
// matters, the fix is a separate unguessable token in the result URL, keeping
// this one purely for humans.
//
// Cyrillic means the reference is not URL-safe on its own: every place that
// puts it in a URL must percent-encode it. Both callers do.

import { randomInt } from 'node:crypto'

// Masculine adjectives, to agree with the masculine nouns below — a reference
// a Ukrainian speaker reads aloud should not be grammatically broken.
const ADJECTIVES = [
    'бадьорий',
    'безстрашний',
    'білий',
    'блакитний',
    'бурштиновий',
    'веселий',
    'вправний',
    'гарячий',
    'гнучкий',
    'гордий',
    'гострий',
    'гучний',
    'добрий',
    'дужий',
    'жвавий',
    'завзятий',
    'залізний',
    'зелений',
    'зимовий',
    'зірковий',
    'золотий',
    'кмітливий',
    'козацький',
    'круглий',
    'легкий',
    'лютий',
    'мідний',
    'мудрий',
    'надійний',
    'нічний',
    'новий',
    'обережний',
    'палкий',
    'північний',
    'пильний',
    'поважний',
    'потужний',
    'прудкий',
    'ранковий',
    'рвучкий',
    'рішучий',
    'свіжий',
    'світлий',
    'сильний',
    'синій',
    'сірий',
    'сміливий',
    'сонячний',
    'спокійний',
    'срібний',
    'старий',
    'стрімкий',
    'суворий',
    'теплий',
    'тихий',
    'точний',
    'тямущий',
    'хитрий',
    'хмарний',
    'хоробрий',
    'чемний',
    'чорний',
    'щирий',
    'ясний',
]

const NOUNS = [
    'барс',
    'беркут',
    'бобер',
    'борсук',
    'бук',
    'ведмідь',
    'вітер',
    'вовк',
    'ворон',
    'вулкан',
    'гепард',
    'горобець',
    'граніт',
    'грім',
    'дельфін',
    'дощ',
    'дуб',
    'жайвір',
    'журавель',
    'заєць',
    'зубр',
    'їжак',
    'кажан',
    'камінь',
    'кедр',
    'кит',
    'кінь',
    'клен',
    'ключ',
    'компас',
    'кремінь',
    'лелека',
    'лис',
    'лід',
    'ліхтар',
    'лось',
    'магніт',
    'маяк',
    'мороз',
    'оберіг',
    'орел',
    'острів',
    'пагорб',
    'палац',
    'пес',
    'потік',
    'прапор',
    'промінь',
    'ріг',
    'сокіл',
    'соловей',
    'стриж',
    'струмок',
    'тигр',
    'туман',
    'фазан',
    'хміль',
    'шершень',
    'шпак',
    'щит',
    'явір',
    'ясен',
    'яструб',
    'ячмінь',
]

export const REFERENCE_DIGITS = 6
const DIGIT_RANGE = 10 ** REFERENCE_DIGITS

// `pick` is injectable so the shape can be asserted deterministically; in
// production it is crypto-grade randomness, not Math.random.
export type RandomPicker = (maxExclusive: number) => number

export function generateOrderReference(pick: RandomPicker = randomInt): string {
    const adjective = ADJECTIVES[pick(ADJECTIVES.length)]
    const noun = NOUNS[pick(NOUNS.length)]
    const digits = String(pick(DIGIT_RANGE)).padStart(REFERENCE_DIGITS, '0')

    return `${adjective}-${noun}-${digits}`
}
