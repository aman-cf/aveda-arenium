import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';

// Replace YOUR_PROJECT_ID with the id from sanity.io/manage (also set it as SANITY_PROJECT_ID in Vercel).
export default defineConfig({
  name: 'dkg-journal',
  title: 'DKG Landcorp — Journal',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'YOUR_PROJECT_ID',
  dataset: 'production',
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes }
});
