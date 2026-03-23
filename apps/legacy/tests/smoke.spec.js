const { test, expect } = require('@playwright/test');

async function uploadWorkbook(page) {
  const workbook = {
    SheetNames: ['Nodes', 'Slides', 'Edges', 'LayoutOverrides'],
    Sheets: {
      Nodes: {
        '!ref': 'A1:J5',
        A1: { v: 'NodeID' }, B1: { v: 'ParentID' }, C1: { v: 'Dept' }, D1: { v: 'Name' }, E1: { v: 'Title' }, F1: { v: 'PageGroup' }, G1: { v: 'SortOrder' }, H1: { v: 'RoleType' }, I1: { v: 'LayoutType' }, J1: { v: 'ShowInOverview' },
        A2: { v: 'root' }, B2: { v: '' }, C2: { v: 'HQ' }, D2: { v: 'John Doe' }, E2: { v: 'CEO' }, F2: { v: 'HQ' }, G2: { v: 1 }, H2: { v: 'normal' }, I2: { v: 'standard' }, J2: { v: true },
        A3: { v: 'assistant' }, B3: { v: 'root' }, C3: { v: 'HQ Office' }, D3: { v: 'Amy Lin' }, E3: { v: 'Executive Assistant' }, F3: { v: 'HQ' }, G3: { v: 1 }, H3: { v: 'assistant' }, I3: { v: 'sidecar' }, J3: { v: true },
        A4: { v: 'sales' }, B4: { v: 'root' }, C4: { v: 'Sales' }, D4: { v: 'David Chen' }, E4: { v: 'VP Sales' }, F4: { v: 'HQ' }, G4: { v: 2 }, H4: { v: 'normal' }, I4: { v: 'standard' }, J4: { v: true },
        A5: { v: 'ops' }, B5: { v: 'root' }, C5: { v: 'Operations' }, D5: { v: 'Nina Wu' }, E5: { v: 'VP Ops' }, F5: { v: 'OPS' }, G5: { v: 3 }, H5: { v: 'shared-service' }, I5: { v: 'sidecar' }, J5: { v: false }
      },
      Slides: {
        '!ref': 'A1:F3',
        A1: { v: 'PageGroup' }, B1: { v: 'SlideTitle' }, C1: { v: 'RenderMode' }, D1: { v: 'RootNodeID' }, E1: { v: 'MaxDepth' }, F1: { v: 'SlideOrder' },
        A2: { v: 'HQ' }, B2: { v: 'Corporate Overview' }, C2: { v: 'overview' }, D2: { v: 'root' }, E2: { v: 3 }, F2: { v: 1 },
        A3: { v: 'OPS' }, B3: { v: 'Operations Focus' }, C3: { v: 'focus' }, D3: { v: 'ops' }, E3: { v: 3 }, F3: { v: 2 }
      },
      Edges: {
        '!ref': 'A1:E2',
        A1: { v: 'EdgeID' }, B1: { v: 'FromNodeID' }, C1: { v: 'ToNodeID' }, D1: { v: 'EdgeType' }, E1: { v: 'PageScope' },
        A2: { v: 'e1' }, B2: { v: 'assistant' }, C2: { v: 'sales' }, D2: { v: 'dotted' }, E2: { v: 'local' }
      },
      LayoutOverrides: {
        '!ref': 'A1:G2',
        A1: { v: 'TargetType' }, B1: { v: 'TargetID' }, C1: { v: 'PageGroup' }, D1: { v: 'OffsetX' }, E1: { v: 'OffsetY' }, F1: { v: 'AnchorMode' }, G1: { v: 'ZIndex' },
        A2: { v: 'node' }, B2: { v: 'assistant' }, C2: { v: 'HQ' }, D2: { v: 0.35 }, E2: { v: -0.15 }, F2: { v: 'center' }, G2: { v: 1 }
      }
    }
  };

  const buffer = await page.evaluate(async (wb) => {
    const clone = JSON.parse(JSON.stringify(wb));
    const workbook = XLSX.read(XLSX.write(clone, { bookType: 'xlsx', type: 'array' }), { type: 'array' });
    const out = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return Array.from(new Uint8Array(out));
  }, workbook);

  await page.setInputFiles('#excelUpload', {
    name: 'v2-sample.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: Buffer.from(buffer)
  });
}

test.describe('org generator smoke', () => {
  test('legacy sample and UI language switch work', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#previewCanvas');

    await page.getByRole('button', { name: /載入範例|Load Sample/i }).click();
    await expect(page.locator('#dataInput')).toContainText('HQ');

    await page.selectOption('#docLangSelect', 'en');
    await expect(page.locator('#dataInput')).toContainText('John Doe');
  });

  test('browser-driven V2 import enables workbook UI', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.XLSX !== 'undefined');

    await uploadWorkbook(page);

    await expect(page.locator('#modeBadge')).toContainText(/V2/i);
    await expect(page.locator('#slideGroupSelect')).toBeVisible();
    await expect(page.locator('#slideGroupSelect')).toHaveValue('HQ');
    await expect(page.locator('#editorPanel')).toBeVisible();
  });

  test('custom file labels follow UI language', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#excelUploadName')).toContainText(/未選擇任何檔案|No file selected/);

    await page.click('#langBtn');
    await expect(page.locator('#excelUploadName')).toContainText('No file selected');

    await page.click('#langBtn');
    await expect(page.locator('#excelUploadName')).toContainText('未選擇任何檔案');
  });
});
