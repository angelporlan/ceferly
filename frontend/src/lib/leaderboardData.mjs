const asNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const asText = (value) => (typeof value === "string" ? value.trim() : "");

export function normalizeRankingPayload(payload) {
  const source = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && Array.isArray(payload.data)
      ? payload.data
      : [];

  return source
    .filter((item) => item && typeof item === "object" && !Array.isArray(item))
    .map((item, index) => {
      const username = asText(item.username);

      return {
        id: item.id ?? index + 1,
        rank: index + 1,
        name: asText(item.name) || username || "Alumno",
        username,
        streak: asNumber(item.streak),
        coins: asNumber(item.coins ?? item.score ?? item.value),
      };
    });
}
