import { fetchLiturgyForDate } from "../server/liturgia";

async function run() {
  try {
    const result = await fetchLiturgyForDate("2026-07-05");
    console.log("=========================================");
    console.log("CELEBRATION:", result.celebration);
    console.log("GOSPEL REFERENCE:", result.gospel?.referencia);
    console.log("GOSPEL TEXT:", result.gospel?.texto);
    console.log("=========================================");
  } catch (err) {
    console.error("Error fetching liturgy:", err);
  }
}

run();
