export default {
  name: 'post', title: 'Article', type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: (R) => R.required().max(110) },
    { name: 'slug', title: 'Web address', type: 'slug', description: 'The end of the article link, e.g. pr7-corridor-guide', options: { source: 'title', maxLength: 90 }, validation: (R) => R.required() },
    { name: 'excerpt', title: 'Summary', type: 'text', rows: 3, description: 'One or two sentences. Shown on cards and in Google results.', validation: (R) => R.required().max(220) },
    { name: 'category', title: 'Category', type: 'reference', to: [{ type: 'category' }], validation: (R) => R.required() },
    { name: 'publishedAt', title: 'Publish date', type: 'date', initialValue: () => new Date().toISOString().slice(0, 10), validation: (R) => R.required() },
    { name: 'mainImage', title: 'Cover image', type: 'image', options: { hotspot: true }, validation: (R) => R.required(),
      fields: [{ name: 'alt', title: 'Describe the image (for accessibility and SEO)', type: 'string', validation: (R) => R.required() }] },
    { name: 'body', title: 'Article', type: 'array', of: [
      { type: 'block', styles: [{ title: 'Paragraph', value: 'normal' }, { title: 'Heading', value: 'h2' }, { title: 'Sub-heading', value: 'h3' }, { title: 'Quote', value: 'blockquote' }],
        lists: [{ title: 'Bullets', value: 'bullet' }, { title: 'Numbered', value: 'number' }],
        marks: { decorators: [{ title: 'Bold', value: 'strong' }, { title: 'Italic', value: 'em' }],
          annotations: [{ name: 'link', type: 'object', title: 'Link', fields: [{ name: 'href', type: 'url', title: 'Link', validation: (R) => R.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] }) }] }] } },
      { type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', title: 'Describe the image', type: 'string' }, { name: 'caption', title: 'Caption', type: 'string' }] }
    ] },
    { name: 'cta', title: 'Call to action at the end', type: 'string', initialValue: 'aveda',
      options: { list: [{ title: 'Aveda Arenium: brochure + site visit', value: 'aveda' }, { title: 'General: request a call back', value: 'general' }, { title: 'Careers', value: 'careers' }, { title: 'Partners (Connect page)', value: 'partner' }], layout: 'radio' } },
    { name: 'readMins', title: 'Reading time (minutes)', type: 'number', description: 'Leave empty to calculate automatically.' }
  ],
  orderings: [{ title: 'Newest first', name: 'dateDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: { select: { title: 'title', subtitle: 'publishedAt', media: 'mainImage' } }
};
