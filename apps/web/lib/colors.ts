/** 참여자 마커·리스트에 순서대로 배정되는 색 */
export const PARTICIPANT_COLORS = [
  '#2B44FF', // cobalt
  '#12B5A5', // teal
  '#F6A609', // amber
  '#7A5CFF', // violet
  '#FF8A3D', // orange
  '#00A3FF', // sky
  '#E5484D', // red
  '#12A150', // green
];

export const participantColor = (i: number): string =>
  PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length];
