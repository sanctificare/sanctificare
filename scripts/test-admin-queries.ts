import { getAdminStats, getAdminRegistrationGrowth } from "../server/db";
import dotenv from "dotenv";
dotenv.config();

async function run() {
  try {
    console.log("Running getAdminStats()...");
    const stats = await getAdminStats();
    console.log("Stats result:", JSON.stringify(stats, null, 2));

    console.log("Running getAdminRegistrationGrowth()...");
    const growth = await getAdminRegistrationGrowth();
    console.log("Growth result:", JSON.stringify(growth, null, 2));

    console.log("SUCCESS: All admin database queries completed successfully!");
  } catch (error) {
    console.error("FAIL: Admin query failed with error:", error);
  } finally {
    process.exit(0);
  }
}

run();
