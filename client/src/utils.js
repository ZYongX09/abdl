/**
 * Shared utility functions
 */

/**
 * Format a date string/timestamp as relative time in Chinese
 * @param {string|number|Date} d - date input
 * @returns {string} relative time string (e.g. "3分钟前", "2小时前")
 */
export function timeAgo(d) {
  if (!d) return '';
  const ts = new Date(d).getTime();
  if (Number.isNaN(ts)) return '';
  const diff = Date.now() - ts;
  if (diff < 0) return '刚刚';
  const s = Math.floor(diff / 1000);
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const day = Math.floor(diff / 86400000);
  if (s < 10) return '刚刚';
  if (s < 60) return `${s}秒前`;
  if (m < 60) return `${m}分钟前`;
  if (h < 24) return `${h}小时前`;
  if (day < 7) return `${day}天前`;
  if (day < 30) return `${Math.floor(day / 7)}周前`;
  if (day < 365) return `${Math.floor(day / 30)}个月前`;
  return `${Math.floor(day / 365)}年前`;
}
