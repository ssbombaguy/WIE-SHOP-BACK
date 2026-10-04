// "Apple iPhone 17 Pro Max" -> "apple-iphone-17-pro-max". Same rule the seed uses.
export const slugify = (s) =>
  s.toLowerCase().replace(/["']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const slugSchemaMessage = "Use lowercase letters, numbers and dashes";
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
