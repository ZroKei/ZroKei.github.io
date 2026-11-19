/**
 * 中英文混排的字数统计：
 * 中日韩字符按「字数」累加，英文/数字按「单词数」累加。
 */
const PATTERN =
  /[a-zA-Z0-9_\u0392-\u03C9\u00C0-\u00FF\u0600-\u06FF\u0400-\u04FF]+|[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF\u3040-\u309F\uAC00-\uD7AF]+/g

export function countWord(data: string): number {
  const matched = data.match(PATTERN)
  if (!matched) return 0

  let count = 0
  for (const word of matched) {
    // 中韩日字符按长度算，拉丁字符按 1 个单词算
    count += word.charCodeAt(0) >= 0x4e00 ? word.length : 1
  }
  return count
}
