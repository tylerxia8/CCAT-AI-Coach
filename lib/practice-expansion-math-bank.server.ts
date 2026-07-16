import type { AnswerKey } from "./diagnostic";
import { rotatedCorrectIndex } from "./question-choice-rotation";

let answerOffset = 0;

export const ADVANCED_MATH_ANSWER_KEY: AnswerKey = {
  "practice-num-42": a(2, "Dividing 216 by 1.35 gives the original value, 160."),
  "practice-num-43": a(2, "Let managers be 2k and staff 9k. Then 2k plus 6 equals 3k, so k is 6 and staff is 54."),
  "practice-num-44": a(2, "The middle of five consecutive integers equals their average. The values are 36 through 40."),
  "practice-num-45": a(2, "The car travels 29 miles per gallon. Dividing 377 by 29 gives 13 gallons."),
  "practice-num-46": a(2, "The remaining three fifths of the number equals 18, so the number is 30."),
  "practice-num-47": a(2, "The differences are 7, 14, 21, 28, and then 35. Adding 35 to 81 gives 116."),
  "practice-num-48": a(2, "The discounted price is $408. Applying 8% tax gives $440.64."),
  "practice-num-49": a(2, "Combining the fractions gives 7x over 12 equals 35, so x equals 60."),
  "practice-num-50": a(2, "The added 45 liters represents three eighths of capacity, making total capacity 120 liters."),
  "practice-num-51": a(2, "The combined rate is five eighteenths of a job per hour, so time is 18/5 hours, or 3 hours 36 minutes."),
  "practice-num-52": a(2, "Solving (6 + x)/(30 + x) = 0.40 gives x equal to 10 liters."),
  "practice-num-53": a(1, "Multiplying 1.20 by 0.90 gives 1.08, an overall increase of 8%."),
  "practice-num-54": a(2, "The original total is 216 and the remaining total is 175, so the removed value is 41."),
  "practice-num-55": a(2, "Substitute b = 8 - a to obtain 7a = 34, so a equals 34/7."),
  "practice-num-56": a(1, "For equal distances, average speed is the harmonic mean: 120 divided by 16 equals 7.5 mph."),
  "practice-num-57": a(2, "Each term is doubled and then successive integers 1, 2, 3, 4, and 5 are added. The next term is 121."),
  "practice-num-58": a(3, "The perimeter gives width 20 and length 28. Their product is an area of 560."),
  "practice-num-59": a(2, "The three-part difference equals $2,400, so one part is $800 and all ten parts total $8,000."),
  "practice-num-60": a(2, "Returning from 125 to 100 requires a reduction of 25/125, which is 20%."),
  "practice-num-61": a(3, "The constant of variation is 5. Multiplying 5 by 25 gives 125."),
  "practice-num-62": a(1, "Downstream speed is 16 mph and upstream speed is 12 mph. Half their difference is a 2 mph current."),
  "practice-num-63": a(3, "The numbers are 35 and 49 because 35 plus 1.4 times 35 equals 84."),
  "practice-num-64": a(2, "Three sevenths takes 12 days, so each seventh takes 4 days. The remaining four sevenths takes 16 days."),
  "practice-num-65": a(1, "Factoring gives (x - 3)(x - 8), so the smaller root is 3."),
  "practice-num-66": a(2, "The net rate is 1/8 + 1/12 - 1/24 = 1/6 tank per hour, requiring 6 hours."),
  "practice-num-67": a(3, "The sale price is 1.40 times 0.85, or 1.19 times cost, yielding 19% profit."),
  "practice-num-68": a(3, "The two subgroup totals count the sixth value twice. Their sum exceeds the overall total by 38."),
  "practice-num-69": a(3, "Acid stays constant, so 0.25V = 0.40(V - 12). Solving gives V = 32 liters."),
  "practice-num-70": a(1, "Because 8 is 2 cubed, x = 3y. Combined with x + y = 20, this gives y = 5."),
  "practice-num-71": a(2, "At 25 mph, the two legs take 2.4 and 3 hours, totaling 5.4 hours."),
  "practice-num-72": a(1, "The conditions force the units digit to be twice the tens digit and three larger, producing 36."),
  "practice-num-73": a(1, "The multiplier is 1.10 times 1.10 times 0.80 = 0.968, a 3.2% decrease."),
  "practice-num-74": a(2, "Arithmetic mean 13 gives sum 26. Harmonic mean 12 then gives product 156."),
  "practice-num-75": a(1, "The new side must be multiplied by 1/1.2, so it decreases by one sixth, or 16 2/3%."),
  "practice-num-76": a(3, "A common ratio representation is a:b:c = 15:20:24. Thus b is 20/59 of the total."),
  "practice-num-77": a(3, "The job needs 180 worker-days. After 60 are used, 120 remain; eight workers need 15 more days."),
  "practice-num-78": a(3, "The first two changes cancel because 0.80 times 1.25 equals 1. A further 10% rise leaves it 10% above."),
  "practice-num-79": a(1, "Squaring x + 1/x = 5 gives x squared + 2 + 1/x squared = 25, so the requested value is 23."),
  "practice-num-80": a(2, "The rates are 2/15 and 1/6, totaling 3/10 pool per hour. Time is 10/3 hours, or 3 hours 20 minutes."),
  "practice-num-81": a(2, "The train moves 15 meters per second. In 30 seconds it covers 450 meters, so the platform is 270 meters."),
};

function a(correctIndex: number, explanation: string) {
  const id = `practice-num-${42 + answerOffset++}`;
  return { correctIndex: rotatedCorrectIndex(id, correctIndex), explanation };
}
