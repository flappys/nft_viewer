export default function truncateAddress(str) {
  return str.substring(0, 4) + '...' + str.substring(str.length - 4); // shorten wallet address
}
