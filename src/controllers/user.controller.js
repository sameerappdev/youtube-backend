import {asyncHandler} from '../utils/asyncHandler.js'

const createUser = asyncHandler( async (req, res) => {
    res.status(200).json({
        message: "User has been created"
    })
} )

export {createUser}