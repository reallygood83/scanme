export function analyzeMeal(name: string) {
  const highPurine = ['삼겹살', '내장', '맥주', '멸치', '새우', '고등어'];
  const isHigh = highPurine.some(p => name.includes(p));
  const isMed = ['닭', '돼지', '소고기', '참치'].some(p => name.includes(p));

  return {
    calories: Math.floor(Math.random() * 400 + 200),
    purineLevel: isHigh ? 'high' as const : isMed ? 'medium' as const : 'low' as const,
    gi: Math.floor(Math.random() * 60 + 20),
    protein: Math.floor(Math.random() * 30 + 5),
    carbs: Math.floor(Math.random() * 60 + 10),
    fat: Math.floor(Math.random() * 20 + 3),
    recommendation: isHigh
      ? '⚠️ 퓨린 함량이 높은 음식입니다. 요산 수치가 높을 때는 피하세요.'
      : isMed
      ? '🟡 적당히 섭취하세요. 일주일에 2-3회 이내를 권장합니다.'
      : '✅ 퓨린 함량이 낮아 안심하고 드셔도 됩니다.',
  };
}

export function getFlareRisk(uricAcid: number, recentMeals: string[]): { level: 'low' | 'medium' | 'high'; message: string } {
  if (uricAcid >= 8.0) return { level: 'high', message: '요산 수치가 높습니다. 수분 섭취를 늘리고 퓨린이 높은 음식을 피하세요.' };
  if (uricAcid >= 6.8) return { level: 'medium', message: '요산 수치를 주의하세요. 식단 관리가 필요합니다.' };
  return { level: 'low', message: '요산 수치가 안정적입니다. 현재 식단을 유지하세요.' };
}

const coachResponses: Record<string, string> = {
  '요산': '현재 요산 수치 추이를 보면 지난 7일간 꾸준히 감소하고 있어요! 🎉 수분 섭취와 저퓨린 식단이 효과를 보고 있습니다. 목표 6.0mg/dL까지 조금만 더 힘내세요.',
  '혈당': '오늘 식후 혈당이 약간 높았네요. 식후 15분 가벼운 산책을 하면 혈당 스파이크를 줄일 수 있어요. 내일 점심 후에 시도해보세요!',
  '식단': '오늘 퓨린 섭취량은 적정 수준입니다. 저녁에는 두부나 달걀 요리를 추천드려요. 체리나 블루베리도 요산 감소에 도움이 됩니다!',
  'GLP-1': '오젬픽 투여 후 체중이 안정적으로 감소하고 있어요. 메스꺼움이 있다면 소량 자주 식사하는 것이 도움됩니다. 다음 주사는 3일 후입니다.',
  '운동': '통풍이 있을 때는 저강도 운동이 좋아요. 수영, 요가, 가벼운 산책을 추천합니다. 격렬한 운동은 일시적으로 요산을 높일 수 있어요.',
  '물': '하루 2L 이상 수분 섭취를 목표로 하세요! 물을 충분히 마시면 요산 배출에 도움이 됩니다. 커피와 술은 가능하면 줄여주세요.',
};

export function getChatResponse(message: string): string {
  for (const [key, response] of Object.entries(coachResponses)) {
    if (message.includes(key)) return response;
  }
  return '네, 궁금하신 점을 자세히 말씀해주세요. 요산 관리, 혈당 조절, 식단 추천, GLP-1 관리 등 다양한 건강 정보를 도와드릴 수 있어요! 💪';
}
