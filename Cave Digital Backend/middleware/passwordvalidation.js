// middlewares/passwordValidator.js

const passwordValidator = (req, res, next) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }

    // Regular expression for password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            message: "Invalid password format."
        });
    }

    next(); // Proceed to next middleware or route handler
};

module.exports = passwordValidator;
