"use server";

import { scanWifi } from "./wifiScanner";
import { runIperfTest } from "./iperfRunner";
import {
  readDatabase,
  addSurveyPoint,
  updateDatabaseField,
  SurveyPoint,
  Database,
} from "./database";

export async function startSurvey(
  dbPath: string,
  x: number,
  y: number,
  testConfig: {
    testDuration: number;
    sudoerPassword: string;
  }
): Promise<SurveyPoint> {
  const db = await readDatabase(dbPath);
  const iperfServer = db.iperfServer;

  // Perform WiFi scan
  const wifiData = await scanWifi(testConfig.sudoerPassword);

  // Run iperf3 tests
  const iperfResults = await runIperfTest(iperfServer, testConfig.testDuration);

  // Create new survey point
  const newPoint: SurveyPoint = {
    x,
    y,
    wifiData,
    iperfResults,
    timestamp: new Date().toISOString(),
  };

  // Add to database
  await addSurveyPoint(dbPath, newPoint);

  return newPoint;
}

export async function getSurveyData(dbPath: string): Promise<Database> {
  return await readDatabase(dbPath);
}

export async function updateIperfServer(
  dbPath: string,
  server: string
): Promise<void> {
  await updateDatabaseField(dbPath, "iperfServer", server);
}

export async function updateFloorplanImage(
  dbPath: string,
  imagePath: string
): Promise<void> {
  await updateDatabaseField(dbPath, "floorplanImage", imagePath);
}

export async function updateDbField(
  dbPath: string,
  fieldName: keyof Database,
  value: any
): Promise<void> {
  await updateDatabaseField(dbPath, fieldName, value);
}
