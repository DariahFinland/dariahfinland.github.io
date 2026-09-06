// tina/config.ts
//
// Edits the exact same Markdown/JSON files as .pages.yml/PagesCMS does --
// the two can coexist, since they're just two different editors pointed at
// the same content.
//
// IMPORTANT LIMITATION: TinaCMS's `reference` field type does not support
// `list: true` (confirmed: https://tina.io/docs/errors/ui-not-supported/).
// Every place your schema has a LIST of references, that field is left out
// of this config entirely -- it stays fully editable through PagesCMS, just
// not through Tina. Affected fields, all commented at their point of use:
//   - posts: tags, relatedPosts
//   - tools: collaborators
//   - affiliated-groups: expertise (this one changed since the last version
//     of this file -- expertise used to be free-text strings, now it's a
//     list of references into `tags`, so it moved into this exclusion list)
//   - pages > archive block: tags, selectedDocs
//   - pages > trainingSections block: trainings (Tina can edit a training
//     section's heading/intro, but NOT which trainings it shows)
// Single (non-list) references -- localOffice on events/tools/trainings/
// affiliated-groups -- work fine as-is, and are included below.

import { defineConfig } from 'tinacms'

export default defineConfig({
  branch: process.env.TINA_BRANCH || 'main',
  clientId: process.env.TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },

  media: {
    tina: {
      mediaRoot: 'media',
      publicFolder: 'public',
    },
  },

  schema: {
    collections: [
      {
        name: 'tags',
        label: 'Tags',
        path: 'src/content/tags',
        format: 'md',
        fields: [{ type: 'string', name: 'title', label: 'Title', required: true, isTitle: true }],
      },

      {
        name: 'posts',
        label: 'Posts',
        path: 'src/content/posts',
        format: 'md',
        fields: [
          { type: 'string', name: 'title', label: 'Title', required: true, isTitle: true },
          { type: 'image', name: 'heroImage', label: 'Hero Image' },
          { type: 'string', name: 'heroImageAlt', label: 'Hero Image Alt Text' },
          // tags, relatedPosts omitted -- list-of-reference, see note at top
          { type: 'string', name: 'authors', label: 'Authors', list: true },
          { type: 'string', name: 'publishedAt', label: 'Published At (YYYY-MM-DD)', required: true },
          {
            type: 'object',
            name: 'meta',
            label: 'SEO',
            fields: [
              { type: 'string', name: 'title', label: 'Title' },
              { type: 'string', name: 'description', label: 'Description', ui: { component: 'textarea' } },
              { type: 'image', name: 'image', label: 'Image' },
            ],
          },
          { type: 'rich-text', name: 'body', label: 'Content', isBody: true },
        ],
      },

      {
        name: 'localOffices',
        label: 'Local Offices',
        path: 'src/content/local-offices',
        format: 'md',
        fields: [
          { type: 'string', name: 'name', label: 'Name', required: true, isTitle: true },
          { type: 'image', name: 'logo', label: 'Logo' },
          { type: 'string', name: 'shortDescription', label: 'Short Description', ui: { component: 'textarea' } },
          { type: 'string', name: 'externalUrl', label: 'External URL' },
          {
            type: 'object',
            name: 'contacts',
            label: 'Contacts',
            list: true,
            fields: [
              { type: 'string', name: 'name', label: 'Name', required: true },
              { type: 'image', name: 'photo', label: 'Photo' },
              { type: 'string', name: 'url', label: 'URL' },
              { type: 'string', name: 'email', label: 'Email' },
              { type: 'string', name: 'note', label: 'Note' },
            ],
          },
        ],
      },

      {
        name: 'affiliatedGroups',
        label: 'Affiliated Groups',
        path: 'src/content/affiliated-groups',
        format: 'md',
        fields: [
          { type: 'string', name: 'name', label: 'Name', required: true, isTitle: true },
          { type: 'image', name: 'logo', label: 'Logo' },
          { type: 'string', name: 'externalUrl', label: 'External URL', required: true },
          // expertise omitted -- now a list-of-reference to `tags`, see note at top
          { type: 'string', name: 'contactName', label: 'Contact Name' },
          { type: 'string', name: 'contactUrl', label: 'Contact URL' },
          { type: 'reference', name: 'localOffice', label: 'Local Office', collections: ['localOffices'] },
          { type: 'rich-text', name: 'body', label: 'Description', isBody: true },
        ],
      },

      {
        name: 'tools',
        label: 'Tools',
        path: 'src/content/tools',
        format: 'md',
        fields: [
          { type: 'string', name: 'name', label: 'Name', required: true, isTitle: true },
          {
            type: 'object',
            name: 'accessLinks',
            label: 'Access Links',
            list: true,
            fields: [
              { type: 'string', name: 'label', label: 'Label' },
              { type: 'string', name: 'url', label: 'URL', required: true },
            ],
          },
          { type: 'string', name: 'tutorialUrl', label: 'Tutorial URL' },
          {
            type: 'object',
            name: 'contacts',
            label: 'Contacts',
            list: true,
            fields: [
              { type: 'string', name: 'name', label: 'Name', required: true },
              { type: 'string', name: 'url', label: 'URL' },
            ],
          },
          { type: 'reference', name: 'localOffice', label: 'Local Office', collections: ['localOffices'] },
          // collaborators omitted -- list-of-reference, see note at top
          { type: 'rich-text', name: 'body', label: 'Description', isBody: true },
        ],
      },

      {
        name: 'events',
        label: 'Events',
        path: 'src/content/events',
        format: 'md',
        fields: [
          { type: 'string', name: 'title', label: 'Title', required: true, isTitle: true },
          { type: 'string', name: 'startDate', label: 'Start Date (YYYY-MM-DD)', required: true },
          { type: 'string', name: 'startTime', label: 'Start Time (e.g. 12:15)' },
          { type: 'string', name: 'endDate', label: 'End Date (YYYY-MM-DD)' },
          { type: 'string', name: 'endTime', label: 'End Time (e.g. 14:00)' },
          { type: 'string', name: 'location', label: 'Location' },
          { type: 'boolean', name: 'isOnline', label: 'Online Event' },
          { type: 'string', name: 'registrationUrl', label: 'Registration URL' },
          { type: 'image', name: 'featuredImage', label: 'Featured Image' },
          { type: 'reference', name: 'localOffice', label: 'Organising Office', collections: ['localOffices'] },
          { type: 'boolean', name: 'cancelled', label: 'Cancelled' },
          { type: 'rich-text', name: 'body', label: 'Description', isBody: true },
        ],
      },

      {
        name: 'trainings',
        label: 'Trainings',
        path: 'src/content/trainings',
        format: 'md',
        fields: [
          { type: 'string', name: 'title', label: 'Title', required: true, isTitle: true },
          { type: 'string', name: 'url', label: 'URL' },
          { type: 'string', name: 'group', label: "Group (e.g. Bachelor's level)" },
          { type: 'string', name: 'levelTags', label: 'Level Tags' },
          { type: 'reference', name: 'localOffice', label: 'Local Office', collections: ['localOffices'] },
          { type: 'rich-text', name: 'body', label: 'Description', isBody: true },
        ],
      },

      {
        name: 'pages',
        label: 'Pages',
        path: 'src/content/pages',
        format: 'md',
        fields: [
          { type: 'string', name: 'title', label: 'Title', required: true, isTitle: true },
          { type: 'string', name: 'slug', label: 'Slug', required: true },
          {
            type: 'object',
            name: 'hero',
            label: 'Hero',
            fields: [
              { type: 'string', name: 'type', label: 'Type', options: ['none', 'lowImpact', 'mediumImpact', 'highImpact'] },
              { type: 'rich-text', name: 'richText', label: 'Text' },
              {
                type: 'object',
                name: 'links',
                label: 'Links',
                list: true,
                fields: [
                  { type: 'string', name: 'label', label: 'Label', required: true },
                  { type: 'string', name: 'url', label: 'URL', required: true },
                  { type: 'boolean', name: 'newTab', label: 'Open in New Tab' },
                ],
              },
              { type: 'image', name: 'media', label: 'Media' },
              { type: 'string', name: 'mediaAlt', label: 'Media Alt Text' },
            ],
          },
          {
            type: 'object',
            name: 'layout',
            label: 'Page Sections',
            list: true,
            // Matches Astro's discriminatedUnion('blockType', ...) key exactly --
            // same role as blockKey in .pages.yml.
            templateKey: 'blockType',
            templates: [
              {
                name: 'content',
                label: 'Content Columns',
                fields: [
                  {
                    type: 'object',
                    name: 'columns',
                    label: 'Columns',
                    list: true,
                    fields: [
                      { type: 'string', name: 'size', label: 'Size', options: ['oneThird', 'half', 'twoThirds', 'full'] },
                      { type: 'rich-text', name: 'richText', label: 'Text' },
                      {
                        type: 'object',
                        name: 'link',
                        label: 'Link',
                        fields: [
                          { type: 'string', name: 'label', label: 'Label' },
                          { type: 'string', name: 'url', label: 'URL' },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                name: 'cta',
                label: 'Call to Action',
                fields: [
                  { type: 'rich-text', name: 'richText', label: 'Text' },
                  {
                    type: 'object',
                    name: 'links',
                    label: 'Links',
                    list: true,
                    fields: [
                      { type: 'string', name: 'label', label: 'Label', required: true },
                      { type: 'string', name: 'url', label: 'URL', required: true },
                      { type: 'boolean', name: 'newTab', label: 'Open in New Tab' },
                    ],
                  },
                ],
              },
              {
                name: 'mediaBlock',
                label: 'Media',
                fields: [
                  { type: 'image', name: 'media', label: 'Media', required: true },
                  { type: 'string', name: 'mediaAlt', label: 'Media Alt Text' },
                ],
              },
              {
                name: 'archive',
                label: 'Post Archive',
                fields: [
                  { type: 'rich-text', name: 'introRichText', label: 'Intro Text' },
                  { type: 'string', name: 'populateBy', label: 'Populate By', options: ['collection', 'selection'] },
                  { type: 'number', name: 'limit', label: 'Limit' },
                  // tags, selectedDocs omitted -- list-of-reference, see note at top
                ],
              },
              {
                name: 'tabsBlock',
                label: 'Tabs',
                fields: [
                  {
                    type: 'object',
                    name: 'tabs',
                    label: 'Tabs',
                    list: true,
                    fields: [
                      { type: 'string', name: 'label', label: 'Label', required: true },
                      { type: 'string', name: 'listType', label: 'List Type', options: ['none', 'affiliatedGroups', 'tools'] },
                      { type: 'rich-text', name: 'richText', label: 'Text' },
                    ],
                  },
                ],
              },
              {
                name: 'trainingSections',
                label: 'Training Sections',
                fields: [
                  { type: 'string', name: 'heading', label: 'Heading' },
                  { type: 'string', name: 'intro', label: 'Intro', ui: { component: 'textarea' } },
                  // trainings omitted -- list-of-reference, see note at top.
                  // Tina can edit heading/intro here but NOT which trainings
                  // this block shows -- that still needs PagesCMS.
                ],
              },
              {
                name: 'upcomingEvents',
                label: 'Upcoming Events',
                fields: [
                  { type: 'string', name: 'heading', label: 'Heading' },
                  { type: 'number', name: 'limit', label: 'Limit' },
                  { type: 'string', name: 'viewAllLink', label: 'View All Link' },
                ],
              },
            ],
          },
          {
            type: 'object',
            name: 'meta',
            label: 'SEO',
            fields: [
              { type: 'string', name: 'title', label: 'Title' },
              { type: 'string', name: 'description', label: 'Description', ui: { component: 'textarea' } },
              { type: 'image', name: 'image', label: 'Image' },
            ],
          },
        ],
      },

      {
        // Single JSON file, not a folder of repeated docs -- ui.global:
        // true is Tina's convention for a singleton document, shown in its
        // own nav section rather than as a list to pick from.
        name: 'globals',
        label: 'Site Navigation',
        path: 'src/data',
        format: 'json',
        ui: { global: true },
        fields: [
          {
            type: 'object',
            name: 'header',
            label: 'Header',
            fields: [
              {
                type: 'object',
                name: 'navItems',
                label: 'Header Nav Items',
                list: true,
                fields: [
                  { type: 'string', name: 'label', label: 'Label', required: true },
                  { type: 'string', name: 'url', label: 'URL' },
                  { type: 'boolean', name: 'newTab', label: 'Open in New Tab' },
                ],
              },
            ],
          },
          {
            type: 'object',
            name: 'footer',
            label: 'Footer',
            fields: [
              {
                type: 'object',
                name: 'navItems',
                label: 'Footer Nav Items',
                list: true,
                fields: [
                  { type: 'string', name: 'label', label: 'Label', required: true },
                  { type: 'string', name: 'url', label: 'URL' },
                  { type: 'boolean', name: 'newTab', label: 'Open in New Tab' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
})
