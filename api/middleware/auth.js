
export const auth = (req, res, next) => {

    if (req.query.app !== 'dig-hub') {
        return res.status(400).send({ message: 'Not authorized' })  
    }

    next()
}