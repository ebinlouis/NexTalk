export const validate = (schema) => async (req, res, next) => {
    try {
        const parsed = await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        req.body = parsed.body || req.body;
        next();
    } catch (error) {
        const issues = error.issues?.map((err) => ({
            field: err.path.slice(1).join('.'),
            message: err.message,
        })) || [];
        return res.status(400).json({
            success: false,
            message: issues[0]?.message || 'Validation failed',
            errors: issues,
        });
    }
};