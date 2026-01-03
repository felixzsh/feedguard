import { cleanHTMLForLLM } from '../../utils/html_cleaner';
import { existsSync } from 'fs';
import { join, basename, dirname } from 'path';

export async function cleanerCommand(htmlPath: string) {
  try {
    console.log('🧹 FeedGuard HTML Cleaner\n');

    // Validate input file exists
    if (!existsSync(htmlPath)) {
      console.error(`❌ Error: File not found: ${htmlPath}`);
      process.exit(1);
    }

    console.log(`📂 Input: ${htmlPath}`);

    // Read HTML file
    const file = Bun.file(htmlPath);
    const html = await file.text();

    const inputSizeMB = (html.length / 1024 / 1024).toFixed(2);
    console.log(`📊 Original size: ${inputSizeMB} MB\n`);

    // Clean HTML
    console.log('⚙️  Cleaning HTML...');
    const result = await cleanHTMLForLLM(html);

    // Debug: mostrar el resultado completo
    console.log('\n🔍 Debug - Result structure:', {
      hasOriginalSize: typeof result.originalSize !== 'undefined',
      hasCleanedSize: typeof result.cleanedSize !== 'undefined',
      hasReductionPercent: typeof result.reductionPercent !== 'undefined',
      hasCleanedHtml: typeof result.cleanedHtml !== 'undefined',
      cleanedHtmlLength: result.cleanedHtml?.length || 0
    });

    // Generate output filename
    const inputDir = dirname(htmlPath);
    const inputFilename = basename(htmlPath, '.html');
    const outputFilename = `${inputFilename}_cleaned.html`;
    const outputPath = join(inputDir, outputFilename);

    // Write cleaned HTML
    await Bun.write(outputPath, result.cleanedHtml);

    // Display results
    console.log('\n✅ Cleaning complete!\n');
    console.log('📊 Results:');
    console.log(`   Original:  ${(result.originalSize / 1024).toFixed(2)} KB`);
    console.log(`   Cleaned:   ${(result.cleanedSize / 1024).toFixed(2)} KB`);
    console.log(`   Reduction: ${result.reductionPercent.toFixed(1)}%\n`);
    console.log(`💾 Output saved to: ${outputPath}\n`);

  } catch (error) {
    if (error instanceof Error) {
      console.error(`\n❌ Error: ${error.message}\n`);

      // Stack trace para debug
      console.error('Stack trace:', error.stack);
    } else {
      console.error('\n❌ An unknown error occurred\n');
      console.error('Error object:', error);
    }
    process.exit(1);
  }
}
