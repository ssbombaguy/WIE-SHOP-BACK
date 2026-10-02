// Validates req.body / req.query / req.params against zod schemas.
// Parsed (and type-coerced) values land on req.valid, e.g. req.valid.query.page is a number.
export const validate = (schemas) => (req, res, next) => {
  req.valid = {};
  for (const key of ["params", "query", "body"]) {
    if (schemas[key]) req.valid[key] = schemas[key].parse(req[key] ?? {});
  }
  next();
};
