import { NextResponse } from 'next/server';
import { getCatalogForPublic, getSettingsForPublic } from '../../../../lib/site-data';
import { initializeDatabase, maybeSeedDefaultData } from '../../../../lib/db';

export async function GET() {
  initializeDatabase();
  maybeSeedDefaultData();

  const catalog = getCatalogForPublic();
  const settings = getSettingsForPublic();

  return NextResponse.json({
    products: catalog.products,
    categories: catalog.categories,
    settings,
  });
}
