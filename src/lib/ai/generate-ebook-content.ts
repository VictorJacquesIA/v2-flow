import { runDiagnosisModule }     from "./modules/diagnosis-module";
import { runPackageParserModule } from "./modules/package-parser-module";
import { calculateScores, estimateLostClients } from "@/lib/ebook/scoring";
import type { EbookFormData, EbookContent } from "@/types";

export async function generateEbookContent(data: EbookFormData): Promise<EbookContent> {
  const scores      = calculateScores(data);
  const lostClients = estimateLostClients(scores);

  const [diagnosis, parsed] = await Promise.all([
    runDiagnosisModule(data, scores, lostClients),
    runPackageParserModule(data.gbpPackageText),
  ]);

  return { scores, diagnosis, parsed };
}
