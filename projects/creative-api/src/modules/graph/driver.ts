/** Memgraph 드라이버 싱글턴 — neo4j-driver로 Bolt 프로토콜 연결 */

import neo4j, { type Driver, type Session } from 'neo4j-driver';

let driver: Driver | null = null;

export function getDriver(): Driver {
  if (!driver) {
    const uri = process.env.NEO4J_URI;
    const user = process.env.NEO4J_USER;
    const password = process.env.NEO4J_PASSWORD;

    if (!uri || !user || !password) {
      throw new Error('Memgraph 환경변수 누락: NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD');
    }

    driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
      maxConnectionPoolSize: 10,
      connectionAcquisitionTimeout: 5000,
    });
  }
  return driver;
}

export function getSession(): Session {
  return getDriver().session();
}

/** 쿼리 실행 헬퍼 */
export async function runQuery<T = unknown>(
  cypher: string,
  params?: Record<string, unknown>
): Promise<T[]> {
  const session = getSession();
  try {
    const result = await session.run(cypher, params);
    return result.records.map((r) => r.toObject()) as T[];
  } finally {
    await session.close();
  }
}

/** 드라이버 종료 (앱 종료 시) */
export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}
