import { DocumentationData } from '../ai/services/documentation.service';

export class ExportUtil {
  public static documentationToMarkdown(doc: DocumentationData): string {
    return `${doc.featureName}

1. Opis Funkcji (Feature Description)
${doc.featureDescription}

2. Założenia (Assumptions)
${doc.assumptions.map(item => `- ${item}`).join('\n')}

3. Zależności (Dependencies)
${doc.dependencies.map(item => `- ${item}`).join('\n')}

4. Ryzyka i Mitygacja (Risks)
${doc.risks.map(item => `- ${item}`).join('\n')}

5. Korzyści dla Użytkownika (User Benefits)
${doc.userBenefits.map(item => `- ${item}`).join('\n')}

6. Warunki Spełnienia (Conditions of Satisfaction)
${doc.conditionsOfSatisfaction.map(item => `- ${item}`).join('\n')}

7. Metryki Sukcesu (Success Metrics)
${doc.successMetrics.map(item => `- ${item}`).join('\n')}

8. Otwarte Pytania (Open Questions)
${doc.openQuestions.map(item => `- ${item}`).join('\n')}

---
Wynik Kompletności Dokumentacji: ${doc.completenessScore}/10

Brakujące Informacje:
${doc.missingInformation.map(item => `- ${item}`).join('\n')}

Kluczowe Decyzje do Potwierdzenia:
${doc.keyDecisions.map(item => `- ${item}`).join('\n')}
`;
  }
}
