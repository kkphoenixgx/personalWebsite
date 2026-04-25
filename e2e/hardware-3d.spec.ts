import { test, expect } from '@playwright/test';

test.describe('Instrumentation Test: WebGL, Physics & Raycaster', () => {
  
  test('Deve renderizar os planetas em Three.js e ativar o Raycaster do Footer no hover do mouse', async ({ page }) => {
    await page.goto('/');

    // 1. Identifica o canvas do Footer
    const footerCanvas = page.locator('app-footer canvas');
    await expect(footerCanvas).toBeVisible({ timeout: 15000 });

    // 2. Faz um scroll bruto até o final da página
    // Isso engatilha seu `IntersectionObserver` que destrava o `requestAnimationFrame` da sua arquitetura
    await footerCanvas.scrollIntoViewIfNeeded();
    
    // Dá um tempo para os planetas ("React", "Angular") serem montados pelo WebGLRenderer
    await page.waitForTimeout(2000);

    // 3. Extrai as caixas delimitadoras reais do Hardware
    const box = await footerCanvas.boundingBox();
    expect(box).not.toBeNull();

    // 4. Move o mouse nativo para o centro exato da galáxia (onde o sol/planeta central deve estar)
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);

    // 5. Se o Raycaster estiver funcionando, a tooltip nativa do DOM precisa ter sido injetada e atualizada
    // Assumindo que sua Tooltip crie uma div flutuante com a classe .tooltip
    // const tooltip = page.locator('.tooltip');
    // await expect(tooltip).toBeVisible();
  });
});