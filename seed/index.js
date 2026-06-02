// seed/index.js — combines all skill files into the SEED() function
import { categories } from './categories.js';
import { projects } from './projects.js';
import { buildExperiences } from './experiences.js';
import { addFoundationQuestions } from './foundationQuestions.js';
import { addReactNativeInterviewQuestions } from './reactNativeInterviewQuestions.js';

import buildFoundationSkills from './skills/foundation.js';
import buildFrontendSkills from './skills/frontend.js';
import buildMobileSkills from './skills/mobile.js';
import buildWebGLSkills from './skills/webgl-3d.js';
import buildStateSkills from './skills/state-architecture.js';
import buildStylingSkills from './skills/styling.js';
import buildBackendSkills from './skills/backend.js';
import buildDatavizSkills from './skills/dataviz.js';
import buildDatabaseSkills from './skills/databases.js';
import buildSecuritySkills from './skills/security-auth.js';
import buildTestingSkills from './skills/testing.js';
import buildDevOpsSkills from './skills/devops.js';
import buildCloudSkills from './skills/cloud.js';
import buildPaymentSkills from './skills/payments.js';
import buildAIToolsSkills from './skills/ai-tools.js';
import buildMethodologySkills from './skills/methodology.js';
import buildInternetSkills from './skills/internet-networking.js';
import buildGenAISkills from './skills/gen-ai.js';
import buildDesignPatternSkills from './skills/design-patterns.js';
import buildEmbeddedSkills from './skills/embedded.js';
import buildToolsSkills from './skills/tools.js';
import buildPerformanceSkills from './skills/performance.js';

export const SEED = () => {
  const skills = [
    ...buildFoundationSkills(),
    ...buildFrontendSkills(),
    ...buildMobileSkills(),
    ...buildWebGLSkills(),
    ...buildStateSkills(),
    ...buildStylingSkills(),
    ...buildBackendSkills(),
    ...buildDatavizSkills(),
    ...buildDatabaseSkills(),
    ...buildSecuritySkills(),
    ...buildTestingSkills(),
    ...buildDevOpsSkills(),
    ...buildCloudSkills(),
    ...buildPaymentSkills(),
    ...buildAIToolsSkills(),
    ...buildMethodologySkills(),
    ...buildInternetSkills(),
    ...buildGenAISkills(),
    ...buildDesignPatternSkills(),
    ...buildEmbeddedSkills(),
    ...buildToolsSkills(),
    ...buildPerformanceSkills(),
  ];

  addReactNativeInterviewQuestions(skills);
  addFoundationQuestions(skills, categories);

  // Auto-link skills to projects by stack name match
  skills.forEach((s) => {
    projects.forEach((p) => {
      if (p.stack.some((t) => t.toLowerCase() === s.name.toLowerCase())) {
        s.relatedProjectIds.push(p.id);
      }
    });
  });

  return { categories, skills, projects, experiences: buildExperiences() };
};
