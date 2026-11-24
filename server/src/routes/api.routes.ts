import { Router, Request, Response, NextFunction } from 'express';
import { upload } from '../middleware/upload.middleware';
import { documentationService } from '../ai/services/documentation.service';
import { mockupService } from '../ai/services/mockup.service';
import { promptLoader } from '../ai/services/prompt-loader.service';
import { generateDocSchema, editDocSchema, regenerateSectionSchema, editMockupSchema } from '../schemas/feature.schema';
import { ExportUtil } from '../utils/export.util';

const router = Router();

// Get list of prompts
router.get('/prompts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prompts = promptLoader.listPrompts();
    res.json({ success: true, prompts });
  } catch (error) {
    next(error);
  }
});

// Get prompt content
router.get('/prompts/:filename', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filename = req.params.filename;
    const content = promptLoader.getPromptContent(filename);
    res.json({ success: true, filename, content });
  } catch (error) {
    next(error);
  }
});

// Save prompt content
router.put('/prompts/:filename', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filename = req.params.filename;
    const { content } = req.body;
    if (typeof content !== 'string') {
      return res.status(400).json({ success: false, error: 'Content string is required.' });
    }
    promptLoader.savePromptContent(filename, content);
    res.json({ success: true, filename });
  } catch (error) {
    next(error);
  }
});

// Generate Documentation & Optional Mockup
router.post('/generate-documentation', upload.array('screenshots', 5), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = generateDocSchema.parse(req.body);
    const files = req.files as Express.Multer.File[] | undefined;
    const images = files ? files.map(f => ({ path: f.path, mimetype: f.mimetype })) : [];

    const documentation = await documentationService.generateDocumentation(
      body.featureIdea,
      body.additionalContext || '',
      images
    );

    let mockup = null;
    if (body.generateMockup) {
      let screenshotAnalysis = '';
      if (images.length > 0) {
        try {
          screenshotAnalysis = await documentationService.analyzeScreenshots(images);
        } catch (e) {
          console.error('Screenshot analysis error:', e);
        }
      }
      mockup = await mockupService.generateMockup(documentation, screenshotAnalysis, images);
    }

    res.json({
      success: true,
      documentation,
      mockup
    });
  } catch (error) {
    next(error);
  }
});

// Edit Documentation with AI
router.post('/edit-documentation', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = editDocSchema.parse(req.body);
    const updatedDoc = await documentationService.editDocumentation(body.documentation, body.instruction);
    res.json({
      success: true,
      documentation: updatedDoc
    });
  } catch (error) {
    next(error);
  }
});

// Regenerate Single Section
router.post('/regenerate-section', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = regenerateSectionSchema.parse(req.body);
    const updatedSectionValue = await documentationService.regenerateSection(body.sectionKey, body.documentation);
    res.json({
      success: true,
      sectionKey: body.sectionKey,
      sectionValue: updatedSectionValue
    });
  } catch (error) {
    next(error);
  }
});

// Generate Mockup standalone
router.post('/generate-mockup', upload.array('screenshots', 5), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const documentation = req.body.documentation ? JSON.parse(req.body.documentation) : null;
    if (!documentation) {
      return res.status(400).json({ success: false, error: 'Documentation is required for mockup generation.' });
    }

    const files = req.files as Express.Multer.File[] | undefined;
    const images = files ? files.map(f => ({ path: f.path, mimetype: f.mimetype })) : [];

    let screenshotAnalysis = '';
    if (images.length > 0) {
      screenshotAnalysis = await documentationService.analyzeScreenshots(images);
    }

    const mockup = await mockupService.generateMockup(documentation, screenshotAnalysis, images);
    res.json({
      success: true,
      mockup
    });
  } catch (error) {
    next(error);
  }
});

// Edit Mockup with AI
router.post('/edit-mockup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = editMockupSchema.parse(req.body);
    const updatedMockup = await mockupService.editMockup(
      body.existingTsx,
      body.existingCss || '',
      body.instruction,
      body.featureContext || ''
    );
    res.json({
      success: true,
      mockup: updatedMockup
    });
  } catch (error) {
    next(error);
  }
});

// Export Documentation
router.post('/export-documentation', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { documentation, format } = req.body;
    if (!documentation) {
      return res.status(400).json({ success: false, error: 'Documentation data is required for export.' });
    }

    if (format === 'markdown' || !format) {
      const md = ExportUtil.documentationToMarkdown(documentation);
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(documentation.featureName || 'feature')}-documentation.md"`);
      return res.send(md);
    }

    res.status(400).json({ success: false, error: 'Unsupported export format.' });
  } catch (error) {
    next(error);
  }
});

export const apiRoutes = router;
